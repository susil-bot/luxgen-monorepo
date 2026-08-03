export const TOOL_TIMEOUTS: Record<string, number> = {
  read_file: 5_000,
  list_files: 10_000,
  search_code: 15_000,
  write_file: 2_000,
  delete_file: 2_000,
  run_command: 60_000,
  fetch_url: 10_000,
  rename_file: 2_000,
  read_project_config: 5_000,
};

export const MAX_SEARCH_RESULTS = 200;
export const DEFAULT_SEARCH_RESULTS = 50;
export const MAX_COMMAND_OUTPUT_CHARS = 4_000;
export const MAX_FETCH_URL_CHARS = 8_000;
export const STREAM_READ_FILE_THRESHOLD = 100_000;

export const MAX_FILE_SIZE = 1_000_000;
export const MAX_DIR_ENTRIES = 5_000;
export const MAX_READ_CHARS = 8_000;

export const MAX_TOOL_CALLS_PER_RESPONSE = 5;
export const MAX_TOTAL_TOOL_CALLS = 30;
export const MAX_STAGED_FILES_PER_SESSION = 20;
export const MAX_CONSECUTIVE_TOOL_ONLY = 5;
export const MAX_ITERATIONS = 10;
export const MAX_CONTEXT_CHARS = 80_000;

/**
 * Bounds the Developer -> Reviewer -> PM Tester loop (core/orchestrator.ts's
 * runOrchestratedTask). Each iteration can run the Developer once plus up to two more LLM
 * calls (Reviewer, PM Tester) — capped low by design per the orchestrator's cost-control
 * principle: a task that can't converge in 3 rounds needs a human, not more retries.
 */
export const MAX_ORCHESTRATOR_ITERATIONS = 3;

/** Max characters of the staged-file diff summary fed to the Reviewer/PM Tester prompts. */
export const MAX_DIFF_SUMMARY_CHARS = 12_000;
