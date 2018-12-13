const OFF = 0
const WARN = 1
const ERROR = 2
const ON = 2
const YES = true

module.exports = {
  root: YES,

  plugins: [],

  parserOptions: {
    ecmaVersion: 5,
    impliedStrict: YES,
    sourceType: 'module',
  },

  // https://github.com/sindresorhus/globals/blob/master/globals.json
  env: {
    browser: YES,
    node: YES,
    mocha: YES,
  },

  // https://github.com/eslint/eslint/blob/master/conf/eslint-recommended.js
  extends: [
    'eslint:recommended',
  ],

  rules: {
    'array-bracket-spacing': ERROR,
    'array-callback-return': ON,
    'arrow-parens': ON,
    'arrow-spacing': ON,
    'block-scoped-var': ON,
    'block-spacing': ERROR,
    'brace-style': [ON, '1tbs', { allowSingleLine: true }],
    'comma-dangle': [ON, 'never'],
    'comma-spacing': ERROR,
    'comma-style': [ON, 'last'],
    'complexity': [ON, 8],   // default is 20
    'computed-property-spacing': ERROR,
    'consistent-return': ON,
    'consistent-this': [ON, '_self'],
    'curly': ON,
    'dot-location': [ON, 'property'],
    'dot-notation': WARN,
    'eol-last': ON,
    'eqeqeq': [ON, 'smart'],
    'func-call-spacing': ERROR,
    'guard-for-in': WARN,
    'handle-callback-err': [ON, '^err(or)?$'],
    'implicit-arrow-linebreak': ERROR,
    'indent': [ON, 2, { flatTernaryExpressions: YES, SwitchCase: 1 }],
    'jsx-quotes': [ON, 'prefer-double'],
    'key-spacing': [ON, { mode: 'minimum' }],
    'keyword-spacing': ON,
    'linebreak-style': [ON, 'unix'],
    'max-depth': [ON, 3],
    'max-nested-callbacks': [ON, 3],  // default is 10
    'max-params': [ON, 3],
    'new-parens': ON,
    'no-alert': ON,
    'no-array-constructor': ON,
    'no-caller': ON,
    'no-catch-shadow': ON,
    'no-confusing-arrow': [ON, { allowParens: YES }],
    'no-console': WARN,
    'no-debugger': WARN,
    'no-div-regex': ON,
    'no-duplicate-imports': [ON, { includeExports: YES }],
    'no-else-return': ON,
    'no-eval': ON,
    'no-extend-native': ON,
    'no-extra-bind': ON,
    'no-floating-decimal': ON,
    'no-implicit-globals': ON,
    'no-implied-eval': ON,
    'no-iterator': ON,
    'no-label-var': ON,
    'no-lone-blocks': ON,
    'no-lonely-if': ON,
    'no-loop-func': ON,
    'no-multi-str': ON,
    'no-multiple-empty-lines': [ON, { max: 2 }],
    'no-native-reassign': ON,
    'no-new-func': ON,
    'no-new-object': ON,
    'no-new-wrappers': ON,
    'no-new': ON,
    'no-octal-escape': ON,
    'no-proto': ON,
    'no-prototype-builtins': ON,
    'no-return-assign': [ON, 'except-parens'],
    'no-script-url': ON,
    'no-self-compare': ON,
    'no-sequences': ON,
    'no-shadow-restricted-names': ON,
    'no-shadow': ON,
    'no-spaced-func': ON,
    'no-tabs': ON,
    'no-template-curly-in-string': ON,
    'no-throw-literal': ON,
    'no-trailing-spaces': ON,
    'no-undef-init': ON,
    'no-unmodified-loop-condition': ON,
    'no-unneeded-ternary': ON,
    'no-unused-expressions': ON,
    'no-use-before-define': [ON, 'nofunc'],
    'no-useless-call': ON,
    'no-useless-computed-key': ON,
    'no-useless-rename': ON,
    'no-useless-return': ON,
//    'no-var': ON,
    'no-whitespace-before-property': ON,
    'no-with': ON,
    'object-curly-spacing': [ON, 'always'],
    'one-var-declaration-per-line': ON,
    'operator-linebreak': ERROR,
    'prefer-const': [ON, { destructuring: 'all' }],
    'prefer-numeric-literals': ON,
    'prefer-promise-reject-errors': ON,
    'quote-props': [ON, 'consistent'],
    'quotes': [ON, 'single', 'avoid-escape'],
    'radix': ON,
    'require-atomic-updates': ON,
    'require-await': ON,
    'require-yield': ON,
    'rest-spread-spacing': ERROR,
    'semi-spacing': ERROR,
    'semi': [ON, 'never'],
    'space-before-blocks': ERROR,
    'space-before-function-paren': [ON, 'always'],
    'space-in-parens': ERROR,
    'space-infix-ops': ERROR,
    'space-unary-ops': ERROR,
    'switch-colon-spacing': [ON, { after: YES }],
    'template-curly-spacing': ERROR,
    'unicode-bom': [ON, 'never'],
    'wrap-iife': [ON, 'inside'],
    'yield-star-spacing': ON,
    'yoda': ERROR,
  },
}
