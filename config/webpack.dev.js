const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=true&reload=true';

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  entry: {
    // Script entry files
    'polyfills': [helpers.root('src', 'client', 'polyfills.ts'), hotMiddlewareScript],
    'app': [helpers.root('src', 'client', 'main.ts'), hotMiddlewareScript],
    'vendor': [helpers.root('src', 'client', 'vendor.ts'), hotMiddlewareScript],

    // Style entry files
    'internal': [helpers.root('src', 'client', 'internal.scss'), hotMiddlewareScript],
    'external': [helpers.root('src', 'client', 'external.scss'), hotMiddlewareScript],
  },

  output: {
    path: helpers.root('dist', 'public', 'assets'),
    publicPath: '/assets/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),

    // enable HMR globally
    new webpack.HotModuleReplacementPlugin()
  ]

});
