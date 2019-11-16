const reactAppConfig = require('./webpack.react_app.config').default;
const quickaccessConfig = require('./webpack.quickaccess.config').default;

const configs = [
  reactAppConfig,
  quickaccessConfig
];

module.exports = function (env) {
  env = env || {};
  return configs.map(config => config(env));
};
