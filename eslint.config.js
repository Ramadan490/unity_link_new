const { defineConfig } = require("eslint/config");

module.exports = defineConfig({
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // ✅ this adds prettier rules
  ],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "warn",
  },
});
