const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // In TS projects this often creates noise (especially when linting non-TS files),
      // and TS compiler already catches undefined names in TS files.
      "no-undef": "off",

      // Early SDK stage: allow `any` and tighten later.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
