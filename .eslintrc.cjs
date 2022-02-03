module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'prettier/prettier': [
      'error',
      { singleQuote: true, parser: 'flow', endOfLine: 'auto' },
    ],
    'import/extensions': 'off',
  },
};
