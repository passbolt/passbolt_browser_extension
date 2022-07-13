module.exports = {
  keySeparator: false,
  namespaceSeparator: false,
  defaultNamespace: "common",
  createOldCatalogs: false,
  input: ["src/all/**/*.{js,jsx}"],
  output: "src/all/locales/$LOCALE/$NAMESPACE.json",
  sort: true,
  lexers: {
    js: [{
      lexer: 'JsxLexer',
      functions: ['t', 'translate'],
    }],
    jsx: [{
      lexer: 'JsxLexer',
      functions: ['t', 'translate'],
    }],
    default: ["JavascriptLexer"]
  },
  locales: ["en-UK"],
  useKeysAsDefaultValue: true,
};
