const reactAppConfig = require('./webpack.react_app.config').default;
const quickaccessConfig = require('./webpack.quickaccess.config').default;
const manageReactAppIframeConfig = require('./webpack.manage_react_app_iframe.config').default;

const configs = [
  reactAppConfig,
  quickaccessConfig,
  manageReactAppIframeConfig
];

module.exports = function (env) {
  env = env || {};
  return configs.map(config => config(env));
};
