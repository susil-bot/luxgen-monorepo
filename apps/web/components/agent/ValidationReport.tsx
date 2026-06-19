import React, { useState } from 'react';
import type { ValidationResult } from '@luxgen/agent';

interface ValidationReportProps {
  sessionId: string;
  validation: ValidationResult | null;
  onValidate: () => Promise<void>;
  validating: boolean;
}

export default function ValidationReport({ validation, onValidate, validating }: ValidationReportProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      className="border-b px-4 py-3 flex-shrink-0"
      style={{ borderColor: 'var(--color-separator)', backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary">Validation</span>
          {validation && (
            <span className={`badge ${validation.passed ? 'badge-green' : 'badge-red'}`}>
              {validation.passed ? 'Passed' : 'Failed'}
            </span>
          )}
        </div>
        <button
          onClick={onValidate}
          disabled={validating}
          className="px-2.5 py-1 text-xs font-medium rounded-lg transition-all"
          style={{ backgroundColor: 'var(--color-fill-secondary)', color: 'var(--color-blue)' }}
        >
          {validating ? 'Running…' : 'Run Checks'}
        </button>
      </div>

      {!validation || validation.checks.length === 0 ? (
        <p className="text-xs text-secondary">Run validation before commit (dev/staging modes).</p>
      ) : (
        <div className="space-y-1">
          {validation.checks.map((check) => {
            const key = `${check.scope}:${check.name}`;
            const isOpen = expanded === key;
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className="w-full flex items-center gap-2 text-left text-xs py-1"
                >
                  <span style={{ color: check.passed ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <span className="font-mono text-primary">{check.scope}</span>
                  <span className="text-secondary">{check.name}</span>
                  <span className="text-tertiary ml-auto">{check.durationMs}ms</span>
                </button>
                {isOpen && check.output && (
                  <pre
                    className="text-xs p-2 rounded-lg overflow-x-auto max-h-32 mt-1"
                    style={{
                      backgroundColor: 'var(--color-fill-quaternary)',
                      color: 'var(--color-label-secondary)',
                    }}
                  >
                    {check.output}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
