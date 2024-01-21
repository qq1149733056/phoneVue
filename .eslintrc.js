module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    //"eslint:recommended",
    //"plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  rules: {
    'vue/no-use-v-if-with-v-for': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',
    'vue/require-prop-types': 'error',
    'vue/valid-v-bind': 'error',
    'vue/valid-v-model': 'error',
    'vue/no-unused-components': 'error',
    'no-unused-vars': 'error',
    'no-useless-return': 'error',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'consistent-return':'error',
    'no-unreachable':'error',
    'for-direction':'error'
  },
};
