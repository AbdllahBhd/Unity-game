// Same correctness rules as ../prototype/eslint.config.mjs, plus the browser and
// Node built-ins this folder uses.
import base from "../prototype/eslint.config.mjs";

const extra = Object.fromEntries(
  ["Image", "navigator", "setTimeout", "clearTimeout", "performance", "structuredClone", "__dirname"].map(
    (name) => [name, "readonly"],
  ),
);
export default [
  ...base,
  {
    files: ["**/*.js"],
    languageOptions: { globals: { ...base[0].languageOptions.globals, ...extra } },
  },
];
