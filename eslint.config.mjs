// @ts-check

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const config = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "react-hooks/exhaustive-deps": "off",
    },
    overrides: [
      {
        files: ["src/migrations/*.ts"],
        rules: {
          "@typescript-eslint/consistent-type-imports": "off",
          "@typescript-eslint/no-import-type-side-effects": "off",
          "@typescript-eslint/no-unused-vars": "off",
        },
      },
    ],
  }),
];

export default config;
