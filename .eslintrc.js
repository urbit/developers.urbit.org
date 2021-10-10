module.exports = {
  env: {
    browser: true,
    es2021: false,
    node: true
  },
  extends: ['plugin:react/recommended', 'standard'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 8,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {}
}
