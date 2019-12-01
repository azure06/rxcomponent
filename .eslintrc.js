module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  extends: ['prettier', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint', 'sort-imports-es6-autofix'],
  rules: {
    'no-console': 'off',
    'prettier/prettier': ['error', { singleQuote: true }],
    'sort-imports-es6-autofix/sort-imports-es6': [
      2,
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
  },
};
