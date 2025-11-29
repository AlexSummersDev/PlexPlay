// @ts-check
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: [
      "**/dist/*",
      "**/node_modules/*",
      "**/.expo/*",
      "**/rootStore.example.ts",
      "**/nativewind-env.d.ts",
      "**/*.config.js",
      "**/.eslintrc.js",
    ],
  },
  ...compat.extends("expo"),
  {
    rules: {
      "import/first": "off",
    },
  },
];
