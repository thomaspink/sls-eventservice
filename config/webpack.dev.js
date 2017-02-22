const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    path: helpers.root('dist', 'public', 'assets'),
    publicPath: '/assets/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  }

});
