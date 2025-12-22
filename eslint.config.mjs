import globals from "globals";
import babelParser from "@babel/eslint-parser";
import path from "path";
import { fileURLToPath } from "url";

// ESLint plugins import
import js from "@eslint/js";
import noUnsanitizedPlugin from "eslint-plugin-no-unsanitized";
import jestPlugin from "eslint-plugin-jest";
import reactPlugin from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import pluginSecurity from "eslint-plugin-security";
import nodePlugin from "eslint-plugin-n";
import * as regexpPlugin from "eslint-plugin-regexp";
import pluginPromise from "eslint-plugin-promise";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended, // core JavaScript rules
  reactPlugin.configs.flat.recommended, // React best practices
  reactPlugin.configs.flat["jsx-runtime"], // JSX transform rules
  importPlugin.flatConfigs.recommended, // import/export validations
  pluginSecurity.configs.recommended,
  nodePlugin.configs["flat/recommended-script"],
  regexpPlugin.configs["flat/recommended"],
  pluginPromise.configs["flat/recommended"],
  prettierConfig, // Must be last - disables conflicts
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],

    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2024,
      sourceType: "module",

      parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
          jsx: true,
        },
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
        ...globals.webextensions,

        // Custom globals
        global: "readonly",
        port: "readonly",
      },
    },
    plugins: {
      "no-unsanitized": noUnsanitizedPlugin,
      prettier: prettierPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          paths: [__dirname], // Add project root to resolution paths
          extensions: [".js", ".jsx", ".mjs", ".cjs"],
        },
        alias: {
          map: [["passbolt-styleguide", path.resolve(__dirname)]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      /*
       * ============================================
       * CUSTOM OVERRIDES
       * ============================================
       */
      "prettier/prettier": "warn",

      // Critical rules not in recommended configs
      curly: "error", // Always use braces
      "no-implicit-coercion": "error", // No implicit type coercion
      "no-implicit-globals": "error", // No implicit global variables
      "no-unsanitized/method": "error", // Prevent XSS via innerHTML
      "no-unsanitized/property": "error", // Prevent XSS via outerHTML

      // Our specific preferences (override recommended)
      "no-console": "off", // Allow console.log in dev
      "react/display-name": "off", // Don't require display names
      "react/prop-types": "off", // Skip PropTypes (future TypeScript)
      "no-useless-escape": "off", // Too many false positives
      "func-names": ["error", "never"],

      // Phantom dependency detection (CRITICAL)
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.test.{js,jsx}",
            "**/*.spec.{js,jsx}",
            "**/__tests__/**",
            "**/test/**",
            "**/tests/**",
            "**/scripts/**",
            "*.config.{js,mjs,cjs}",
            "webpack.config.js",
          ],
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],

      // Browser extension specific
      "n/no-unsupported-features/node-builtins": "off", // We use browser APIs
      "n/no-missing-import": "off", // Handled by import plugin
      "n/no-missing-require": "off", // Handled by import plugin

      // Muted during migration
      "import/no-named-as-default-member": "off",
      "import/no-duplicates": "off",
      "import/named": "off",
      "import/no-named-as-default": "off",
      "no-empty": "off",
      "react/jsx-uses-react": "error", // Marks React as used when JSX is present
      "react/jsx-uses-vars": "error", // Marks JSX components as used
      "react/react-in-jsx-scope": "error", // Ensures React is in scope for JSX
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-possible-timing-attacks": "off",
      "n/no-unpublished-import": [
        "error",
        {
          allowModules: [
            "jest-fetch-mock",
            "jest-useragent-mock",
            "jest-each",
            "@testing-library/dom",
            "@testing-library/jest-dom",
            "@testing-library/react",
            "@testing-library/user-event",
            "fetch-mock",
            "@babel/core",
            "@storybook/test",
          ],
        },
      ],
      "n/no-unpublished-require": [
        "error",
        {
          allowModules: ["jest-fetch-mock"],
        },
      ],
      "n/no-extraneous-import": [
        "error",
        {
          allowModules: ["expect", "history"],
        },
      ],
      "prefer-regex-literals": "off",
      "regexp/strict": "off",
      "regexp/no-useless-escape": "off",
      "regexp/no-dupe-characters-character-class": "off",
      "regexp/use-ignore-case": "off",
      "regexp/prefer-d": "off",
      "regexp/prefer-character-class": "off",
      "regexp/prefer-w": "off",
      "regexp/no-obscure-range": "off",
      "regexp/prefer-range": "off",
      "regexp/no-dupe-disjunctions": "off",
      "regexp/no-useless-assertions": "off",
      "regexp/optimal-quantifier-concatenation": "off",
      "regexp/no-unused-capturing-group": "off",
      "regexp/sort-flags": "off",
      "regexp/negation": "off",
      "regexp/no-useless-flag": "off",
      "promise/param-names": "off",
      "promise/catch-or-return": "off",
    },
  },
  /*
   * ============================================
   * TEST FILES CONFIGURATION
   * ============================================
   */
  {
    files: [
      "**/*.test.{js,jsx}",
      "**/*.test.data.{js,jsx}",
      "**/*.test.page.{js,jsx}",
      "**/*.test.page.object.{js,jsx}",
      "**/*.test.stories.{js,jsx}",
      "**/*.spec.{js,jsx}",
      "**/__tests__/**",
      "**/test/mock/**",
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
      ...jestPlugin.configs["flat/recommended"].rules,

      // Test-specific overrides
      "no-console": "off", // Allow console in tests
      "import/no-extraneous-dependencies": "off", // Dev deps OK in tests
      "jest/prefer-expect-assertions": "off", // Not always needed

      // Rules muted during migration
      "jest/no-conditional-expect": "off",
      "jest/valid-title": "off",
      "jest/no-alias-methods": "off",
      "jest/no-export": "off",
      "jest/valid-expect": "off",
      "jest/no-identical-title": "off",
      "jest/expect-expect": "off",
      "jest/valid-expect-in-promise": "off",
      "jest/no-disabled-tests": "off",
      "jest/valid-describe-callback": "off",
      "jest/no-focused-tests": "off",
      "jest/no-standalone-expect": "off",
    },
  },
  /*
   * ============================================
   * BUILD/CONFIG FILES
   * ============================================
   */
  {
    files: ["*.config.{js,mjs,cjs}", "scripts/**/*.js", "webpack.config.js"],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-console": "off", // Allow console in scripts
      "import/no-extraneous-dependencies": "off", // Dev deps OK in configs
      "n/no-unpublished-import": "off",
    },
  },
];
