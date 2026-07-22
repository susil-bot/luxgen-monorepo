/**
 * Smoke test: ConfigMap public URLs must use Ingress hostnames.
 * Catches mismatches like H-14 (api subdomain vs path-based routing).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const configmapPath = join(repoRoot, 'k8s/configmap.yaml');
const ingressPath = join(repoRoot, 'k8s/ingress.yaml');

function readYaml(path) {
  return readFileSync(path, 'utf8');
}

/** Collect hostnames from Ingress rules and TLS blocks. */
function extractIngressHosts(ingressYaml) {
  const hosts = new Set();
  for (const match of ingressYaml.matchAll(/^\s*-\s+([a-zA-Z0-9][a-zA-Z0-9.-]*)\s*$/gm)) {
    const candidate = match[1];
    if (candidate.includes('.')) hosts.add(candidate);
  }
  for (const match of ingressYaml.matchAll(/host:\s*['"]?([^\s'"]+)['"]?/g)) {
    hosts.add(match[1]);
  }
  return hosts;
}

function extractConfigMapValue(configmapYaml, key) {
  const pattern = new RegExp(`^\\s*${key}:\\s*['"]?([^'"]+)['"]?\\s*$`, 'm');
  const match = configmapYaml.match(pattern);
  assert.ok(match, `ConfigMap key ${key} not found`);
  return match[1];
}

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function hostnamesFromCsv(value) {
  return value
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return hostnameFromUrl(trimmed);
      }
      return trimmed;
    })
    .filter(Boolean);
}

test('k8s ConfigMap URLs match Ingress hostnames', () => {
  const configmap = readYaml(configmapPath);
  const ingress = readYaml(ingressPath);
  const ingressHosts = extractIngressHosts(ingress);

  assert.ok(ingressHosts.size > 0, 'Ingress must declare at least one hostname');

  const urlKeys = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_GRAPHQL_URL', 'NEXT_PUBLIC_APP_URL'];

  for (const key of urlKeys) {
    const value = extractConfigMapValue(configmap, key);
    const host = hostnameFromUrl(value);
    assert.ok(host, `${key} must be a valid URL`);
    assert.ok(
      ingressHosts.has(host),
      `${key} host "${host}" is not listed in k8s/ingress.yaml (hosts: ${[...ingressHosts].join(', ')})`,
    );
  }

  const corsOrigin = extractConfigMapValue(configmap, 'CORS_ORIGIN');
  for (const host of hostnamesFromCsv(corsOrigin)) {
    assert.ok(ingressHosts.has(host), `CORS_ORIGIN host "${host}" is not listed in k8s/ingress.yaml`);
  }
});
