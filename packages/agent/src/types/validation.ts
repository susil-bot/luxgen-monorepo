export type ValidationCheckName = 'lint' | 'typecheck' | 'test';

export interface ValidationCheckResult {
  name: ValidationCheckName;
  scope: string;
  passed: boolean;
  output: string;
  durationMs: number;
}

export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheckResult[];
  ranAt: number;
}

export type ValidationPolicy = 'off' | 'warn' | 'strict';
