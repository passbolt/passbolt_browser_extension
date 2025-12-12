import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import path from 'path';
import {fileURLToPath} from 'url';

// ESLint plugins import
import js from '@eslint/js';
import noUnsanitizedPlugin from 'eslint-plugin-no-unsanitized';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,                        // core JavaScript rules
  reactPlugin.configs.flat.recommended,          // React best practices
  reactPlugin.configs.flat['jsx-runtime'],       // JSX transform rules
  importPlugin.flatConfigs.recommended,          // import/export validations
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],

    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2024,
      sourceType: 'module',

      parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
          jsx: true,
        },
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
        ...globals.webextensions,

        // Custom globals
        global: 'readonly',
        port: 'readonly',
      },
    }, plugins: {
      'no-unsanitized': noUnsanitizedPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          paths: [__dirname], // Add project root to resolution paths
          extensions: ['.js', '.jsx', '.mjs', '.cjs'],
        },
        alias: {
          map: [
            ['passbolt-styleguide', path.resolve(__dirname)],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      /*
       * ============================================
       * CUSTOM OVERRIDES
       * ============================================
       */

      "array-bracket-spacing": 1, // Enforces consistent spacing inside array brackets
      "block-spacing": 1, // Enforces consistent spacing inside single-line blocks
      "brace-style": ["warn", "1tbs", {allowSingleLine: true}], // Enforces one true brace style (opening brace on same line)
      "comma-spacing": 1, // Enforces consistent spacing before/after commas
      "computed-property-spacing": 1, // Enforces consistent spacing inside computed property brackets
      "eol-last": 1, // Requires newline at the end of files
      "func-call-spacing": 1, // Disallows spaces between function name and parentheses in calls
      "key-spacing": ["warn", {mode: "minimum"}], // Enforces minimum spacing between keys and values in object literals
      "keyword-spacing": 1, // Enforces consistent spacing before/after keywords (if, else, for, etc.)
      "linebreak-style": 1, // Enforces consistent linebreak style (unix vs windows)
      "no-trailing-spaces": 1, // Disallows trailing whitespace at the end of lines
      "object-curly-spacing": ["warn", "never"], // Disallows spaces inside object curly braces
      "one-var": ["error", {initialized: "never", uninitialized: "always"}], // Enforces variables declaration style (one declaration for uninitialized, separate for initialized)
      "padded-blocks": ["warn", "never"], // Disallows padding blank lines within blocks
      "semi": ["warn", "always"], // Requires semicolons at the end of statements
      "semi-spacing": 1, // Enforces spacing before/after semicolons
      "space-before-blocks": 1, // Requires space before opening brace of blocks
      "space-before-function-paren": ["warn", "never"], // Disallows space before function parentheses
      "space-in-parens": ["warn", "never"], // Disallows spaces inside parentheses
      "space-infix-ops": 1, // Requires spaces around infix operators (+, -, =, etc.)
      "arrow-body-style": ["warn", "as-needed"], // Requires braces around arrow function body only when needed
      "arrow-parens": ["warn", "as-needed"], // Requires parens around arrow function parameters only when needed
      "arrow-spacing": 1, // Enforces consistent spacing before/after arrow function arrows
      "template-curly-spacing": ["warn", "never"], // Disallows spaces inside template literal curly braces
      "multiline-comment-style": ["error", "starred-block"], // Enforces starred-block style for multiline comments (/* * */)
      "indent": ["warn", 2, {MemberExpression: 1, SwitchCase: 1}], // Enforces 2 spaces indentation with specific rules for member expressions and switch cases
      // "object-shorthand": ["error", "consistent"],


      // Critical rules not in recommended configs
      'curly': 'error',                          // Always use braces
      'no-implicit-coercion': 'error',           // No implicit type coercion
      'no-implicit-globals': 'error',            // No implicit global variables
      'no-unsanitized/method': 'error',          // Prevent XSS via innerHTML
      'no-unsanitized/property': 'error',        // Prevent XSS via outerHTML

      // Our specific preferences (override recommended)
      'no-console': 'off',                       // Allow console.log in dev
      'react/display-name': 'off',               // Don't require display names
      'react/prop-types': 'off',                 // Skip PropTypes (future TypeScript)
      'no-useless-escape': 'off',                // Too many false positives
      "func-names": [
        "error",
        "never"
      ],

      // Phantom dependency detection (CRITICAL)
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: [
          '**/*.test.{js,jsx}',
          '**/*.spec.{js,jsx}',
          '**/__tests__/**',
          '**/test/**',
          '**/tests/**',
          '**/scripts/**',
          '*.config.{js,mjs,cjs}',
          'webpack.config.js',
        ],
        optionalDependencies: false,
        peerDependencies: true,
      }],

      // Browser extension specific
      'n/no-unsupported-features/node-builtins': 'off',  // We use browser APIs
      'n/no-missing-import': 'off',                       // Handled by import plugin
      'n/no-missing-require': 'off',                      // Handled by import plugin

      // Muted during migration
      'import/no-named-as-default-member': 'off',
      'import/no-duplicates': 'off',
      'import/named': 'off',
      'import/no-named-as-default': 'off',
      'no-empty': 'off',
      'react/jsx-uses-react': 'error',  // Marks React as used when JSX is present
      'react/jsx-uses-vars': 'error',   // Marks JSX components as used
      'react/react-in-jsx-scope': 'error', // Ensures React is in scope for JSX
    },
  },
  /*
   * ============================================
   * TEST FILES CONFIGURATION
   * ============================================
   */
  {
    files: [
      '**/*.test.{js,jsx}',
      '**/*.test.data.{js,jsx}',
      '**/*.test.page.{js,jsx}',
      '**/*.test.page.object.{js,jsx}',
      '**/*.test.stories.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/__tests__/**',
      '**/test/mock/**',
    ],

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },

    plugins: {
      jest: jestPlugin,
    },

    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,

      // Test-specific overrides
      'no-console': 'off',                       // Allow console in tests
      'import/no-extraneous-dependencies': 'off', // Dev deps OK in tests
      'jest/prefer-expect-assertions': 'off',     // Not always needed

      // Rules muted during migration
      'jest/no-conditional-expect': 'off',
      'jest/valid-title': 'off',
      'jest/no-alias-methods': 'off',
      'jest/no-export': 'off',
      'jest/valid-expect': 'off',
      'jest/no-identical-title': 'off',
      'jest/expect-expect': 'off',
      'jest/valid-expect-in-promise': 'off',
      'jest/no-disabled-tests': 'off',
      'jest/valid-describe-callback': 'off',
      'jest/no-focused-tests': 'off',
      'jest/no-standalone-expect': 'off'
    },
  },
  /*
   * ============================================
   * BUILD/CONFIG FILES
   * ============================================
   */
  {
    files: ['*.config.{js,mjs,cjs}', 'scripts/**/*.js', 'webpack.config.js'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',                       // Allow console in scripts
      'import/no-extraneous-dependencies': 'off', // Dev deps OK in configs
    },
  },
];
