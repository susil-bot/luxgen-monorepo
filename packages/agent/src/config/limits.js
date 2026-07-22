'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MAX_CONTEXT_CHARS =
  exports.MAX_ITERATIONS =
  exports.MAX_CONSECUTIVE_TOOL_ONLY =
  exports.MAX_STAGED_FILES_PER_SESSION =
  exports.MAX_TOTAL_TOOL_CALLS =
  exports.MAX_TOOL_CALLS_PER_RESPONSE =
  exports.MAX_READ_CHARS =
  exports.MAX_DIR_ENTRIES =
  exports.MAX_FILE_SIZE =
  exports.TOOL_TIMEOUTS =
    void 0;
exports.TOOL_TIMEOUTS = {
  read_file: 5000,
  list_files: 10000,
  search_code: 15000,
  write_file: 2000,
};
exports.MAX_FILE_SIZE = 1000000;
exports.MAX_DIR_ENTRIES = 5000;
exports.MAX_READ_CHARS = 8000;
exports.MAX_TOOL_CALLS_PER_RESPONSE = 5;
exports.MAX_TOTAL_TOOL_CALLS = 30;
exports.MAX_STAGED_FILES_PER_SESSION = 20;
exports.MAX_CONSECUTIVE_TOOL_ONLY = 5;
exports.MAX_ITERATIONS = 10;
exports.MAX_CONTEXT_CHARS = 80000;
