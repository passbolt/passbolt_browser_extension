const webpack = require('webpack');
const path = require('path');

const config = {
  entry: {
    'app': path.resolve(__dirname, './src/all/webAccessibleResources/js/app/InFormMenu.js')
  },
  mode: 'production',
  plugins: [
    new webpack.ProvidePlugin({
      // Inject browser polyfill as a global API, and adapt it depending on the environment (MV2/MV3/Windows app).
      browser: path.resolve(__dirname, './src/all/common/polyfill/browserPolyfill.js'),
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules[\\/]((?!(passbolt\-styleguide))))/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/react"],
        }
      },
      // Transform SVG as react component
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                        cleanupIds: false,
                        removeTitle: false,
                        removeDesc: false,
                      },
                    },
                  },
                  {
                    name: 'prefixIds',
                    params: {
                      prefixIds: false,
                      prefixClassNames: false
                    },
                  },
                ],
              }
            }
          }
        ],
      }
    ]
  },
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]((?!(passbolt\-styleguide)).*)[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
      }
    },
  },
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    },
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    // Set a unique name to ensure the cohabitation of multiple webpack loader on the same page.
    chunkLoadingGlobal: 'dataInFormMenuChunkLoadingGlobal',
    path: path.resolve(__dirname, './build/all/webAccessibleResources/js/dist/in-form-menu'),
    pathinfo: true,
    filename: '[name].js'
  }
};

exports.default = function (env) {
  env = env || {};
  // Enable debug mode.
  if (env && env.debug) {
    config.mode = "development";
    config.devtool = "inline-source-map";
  }
  return config;
};
