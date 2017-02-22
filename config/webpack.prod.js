const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

// const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',

  output: {
    path: helpers.root('dist', 'public', 'assets'),
    publicPath: '/',
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  plugins: [
    // Exludes asses specified in the excludeAssets array
    new HtmlWebpackExcludeAssetsPlugin(),

    // extracts css form the js bundles and saves it as its own file
    new ExtractTextPlugin('[name].[hash].bundle.css'),

    // inlines internal css into a style tag in you html
    new StyleExtHtmlWebpackPlugin('internal'),

    // adds a defer attribute to the injected script tags
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }),

    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      dropDebugger: true,
      dropConsole: true,
      sourceMap: false,
      compressor: {
        warnings: false,
      },
    }),
  ]
});
