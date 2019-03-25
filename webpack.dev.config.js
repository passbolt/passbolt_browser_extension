const config = require("./webpack.config");

config.mode = "development";
config.devtool = "inline-source-map";

module.exports = config;
