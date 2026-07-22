/** @type {import('lint-staged').Config} */
module.exports = {
  '*.{js,jsx,ts,tsx}': (files) => {
    const list = files.join(' ');
    return [`oxlint --fix --fix-suggestions ${list}`, `oxfmt --write ${list}`];
  },
  '*.{json,md,css,yml,yaml}': (files) => {
    const filtered = files.filter((f) => !f.endsWith('package-lock.json'));
    if (filtered.length === 0) return [];
    return `oxfmt --write ${filtered.join(' ')}`;
  },
};
