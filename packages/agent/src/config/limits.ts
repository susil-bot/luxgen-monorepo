export const TOOL_TIMEOUTS: Record<string, number> = {
  read_file: 5_000,
  list_files: 10_000,
  search_code: 15_000,
  write_file: 2_000,
};

export const MAX_FILE_SIZE = 1_000_000;
export const MAX_DIR_ENTRIES = 5_000;
export const MAX_READ_CHARS = 8_000;

export const MAX_TOOL_CALLS_PER_RESPONSE = 5;
export const MAX_TOTAL_TOOL_CALLS = 30;
export const MAX_STAGED_FILES_PER_SESSION = 20;
export const MAX_CONSECUTIVE_TOOL_ONLY = 5;
export const MAX_ITERATIONS = 10;
export const MAX_CONTEXT_CHARS = 80_000;
