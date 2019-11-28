// Custom Jest transform implementation that wraps babel-jest and injects our
// babel presets, so we don't have to use .babelrc.

module.exports = require('babel-jest').createTransformer({
  presets: ["@babel/env", "@babel/react"],
  plugins: ["@babel/plugin-transform-runtime"]
});
