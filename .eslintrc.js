// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended', // 或 vue/essential
    'prettier'
  ],
  plugins: ['vue'],
  rules: {}
}
