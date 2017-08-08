const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    path: helpers.root('public', 'wp-content', 'themes', 'sls-2017', 'assets'),
    publicPath: '<?= get_template_directory_uri(); ?>/assets/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
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
    // injects script tag into layout html template and saves the file to dist folder
    new HtmlWebpackPlugin({
      template: helpers.root('src', 'theme', 'index.php'),
      filename: helpers.root('public', 'wp-content', 'themes', 'sls-2017', 'index.php'),
      inject: 'body',
      excludeAssets: [/internal.*.js/, /external.*.js/]
    })
  ]

});
