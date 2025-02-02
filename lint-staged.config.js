import path from "path";

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(" --file ")}`;

/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
  "*.css": "stylelint --cache --fix",
  "**/*": "prettier --write --ignore-unknown",
};
