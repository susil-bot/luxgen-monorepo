'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isBinary = isBinary;
function isBinary(buffer) {
  if (buffer.includes(0)) return true;
  const sample = buffer.slice(0, 8192);
  let nonPrintable = 0;
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      nonPrintable++;
    }
  }
  return sample.length > 0 && nonPrintable / sample.length > 0.1;
}
