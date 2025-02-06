/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "^(react|next|payload)(/.+)?$",
    "<THIRD_PARTY_MODULES>",
    "^@/.*$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  trailingComma: "all",
  semi: true,
  tabWidth: 2,
  singleQuote: false,
};

export default config;
