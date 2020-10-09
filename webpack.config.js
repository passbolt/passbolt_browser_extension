const contentScriptsAppConfig = require('./webpack.content_scripts.app.config').default;
const dataAppConfig = require('./webpack.data.app.config').default;
const dataQuickaccessConfig = require('./webpack.data.quickaccess.config').default;

const configs = [
  contentScriptsAppConfig,
  dataQuickaccessConfig,
  dataAppConfig,
];

module.exports = function (env) {
  env = env || {};
  return configs.map(config => config(env));
};
