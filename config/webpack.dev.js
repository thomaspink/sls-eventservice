const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&reload=true';

const entry = {};
for (let name in commonConfig.entry) {
  if (commonConfig.entry.hasOwnProperty(name)) {
    entry[name] = [commonConfig.entry[name], hotMiddlewareScript];
  }
}

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  entry: entry,

  output: {
    path: helpers.root('dist', 'public', 'assets'),
    publicPath: '/assets/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    hotUpdateChunkFilename: '[id].[hash].hot-update.js',
    hotUpdateMainFilename: '[hash].hot-update.json'
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: helpers.root('src', 'client', 'app'),
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },

  plugins: [
    // enable HMR globally
    new webpack.HotModuleReplacementPlugin()
  ]

});
