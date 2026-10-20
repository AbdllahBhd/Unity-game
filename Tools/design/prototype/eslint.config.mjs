const globals = Object.fromEntries(
  [
    "window",
    "document",
    "console",
    "localStorage",
    "requestAnimationFrame",
    "globalThis",
    "module",
    "require",
    "process",
    "HNGame",
    "HNArt",
    "HNLevels",
    "HNStories",
  ].map((name) => [name, "readonly"]),
);
export default [
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { args: "none" }],
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "valid-typeof": "error",
      eqeqeq: ["error", "always"],
    },
  },
  { files: ["**/*.mjs"], languageOptions: { sourceType: "module" } },
];
