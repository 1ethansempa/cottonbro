// Flat config for ESLint v9 in infra
// Docs: https://eslint.org/docs/latest/use/configure/migration-guide

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default [
  // Make ESLint *globally* ignore build artifacts
  globalIgnores(["cdk.out/**", "dist/**", "node_modules/**"]),

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules (flat-config presets)
  ...tseslint.configs.recommended,

  // TS files config
  {
    files: ["**/*.ts", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // Set `project` if you want type-aware linting with a tsconfig:
        // project: true
      },
    },
    rules: {
      // add project-specific tweaks here
    },
  },
];
