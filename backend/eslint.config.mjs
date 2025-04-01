import typescriptEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import globals from "globals"

export default [
    {
      ignores: ['**/dist/**', '**/node_modules/**'],
    },
    {
      files: ['**/*.ts', '**/*.tsx'], // Apply config to TypeScript files
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: tsParser,
        globals: {
          ...globals.node,
        },
      },
      plugins: {
        "@typescript-eslint": typescriptEslint,
      },
      rules: {
        ...typescriptEslint.configs.recommended.rules, // Include recommended rules from the plugin
      },
    },
  ];