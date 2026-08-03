#!/usr/bin/env bash
set -euo pipefail

# Safe build-then-swap deployment for the API container on the free-tier
# EC2 instance.
#
# Why this exists: `docker compose up -d --build` builds directly into the
# service you're about to replace. If the build fails partway (out of disk,
# out of memory, a bad commit), you can be left with the OLD container
# already stopped and no new one running - a full outage, not just a failed
# deploy. This happened repeatedly during initial setup.
#
# This script instead: prunes stale build cache first (keeps the tiny EBS
# volume from filling up over time), tags the current image as a rollback
# target, builds the new image WITHOUT touching the running container,
# only swaps over if the build succeeds, then health-checks the new
# container and automatically rolls back to the previous image if it
# doesn't come up healthy within HEALTH_RETRIES attempts.
#
# Usage: ./scripts/deploy-api.sh
# Run from the repo root on the EC2 instance (e.g. /opt/luxgen).

COMPOSE_FILE="docker-compose.prod.yml"
# Compose names images "<project-dir-name>-<service>" by default (e.g.
# "luxgen-api" or "luxgen_api" depending on Compose version) - run
# `docker images` after your first successful build and adjust this if it
# doesn't match.
IMAGE_NAME="luxgen-api"
BACKUP_TAG="${IMAGE_NAME}:previous"
HEALTH_URL="http://localhost:4000/health"
HEALTH_RETRIES=10
HEALTH_DELAY=3

echo "==> Freeing disk space before build (safe: only removes unused cache/images, never running containers)"
docker builder prune -f
docker image prune -f

echo "==> Tagging current image as rollback target (if one exists)"
if docker image inspect "${IMAGE_NAME}:latest" >/dev/null 2>&1; then
  docker tag "${IMAGE_NAME}:latest" "${BACKUP_TAG}"
  echo "    Backed up current image as ${BACKUP_TAG}"
else
  echo "    No existing image found - nothing to back up (first deploy)"
fi

echo "==> Building new image (running container is untouched at this point)"
if ! docker compose -f "${COMPOSE_FILE}" build api; then
  echo "XX Build failed. Running container is untouched - nothing to roll back, nothing is down."
  exit 1
fi

echo "==> Starting new container"
docker compose -f "${COMPOSE_FILE}" up -d api redis

echo "==> Health-checking new container"
for i in $(seq 1 "${HEALTH_RETRIES}"); do
  if curl -sf "${HEALTH_URL}" >/dev/null; then
    echo "==> Healthy. Deploy succeeded."
    exit 0
  fi
  echo "    Not healthy yet (attempt ${i}/${HEALTH_RETRIES}), waiting ${HEALTH_DELAY}s..."
  sleep "${HEALTH_DELAY}"
done

echo "XX New container failed health check - rolling back to previous image"
if docker image inspect "${BACKUP_TAG}" >/dev/null 2>&1; then
  docker tag "${BACKUP_TAG}" "${IMAGE_NAME}:latest"
  docker compose -f "${COMPOSE_FILE}" up -d api redis
  echo "    Rolled back to previous image and restarted. Investigate before retrying the deploy."
  exit 1
else
  echo "    No previous image available to roll back to - manual intervention needed."
  exit 1
fi
