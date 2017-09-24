const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ClosureCompiler = require('google-closure-compiler-js').webpack;

const externs = fs.readFileSync(helpers.root('config', 'closure-externs.js'), 'utf8');

// const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
  output: {
    path: helpers.root('dist', 'sls-2017', 'assets'),
    publicPath: '/',
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: helpers.root('src', 'client', 'app'),
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },

  plugins: [

    new ManifestPlugin({
      fileName: 'build-manifest.json',
      prettyPrint: true
    }),

    // Exludes asses specified in the excludeAssets array
    new HtmlWebpackExcludeAssetsPlugin(),

    // extracts css form the js bundles and saves it as its own file
    new ExtractTextPlugin('[name].[hash].bundle.css'),

    // adds a defer attribute to the injected script tags
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }),

    // new webpack.optimize.UglifyJsPlugin({
    //   comments: false,
    //   dropDebugger: true,
    //   dropConsole: true,
    //   sourceMap: false,
    //   compressor: {
    //     warnings: false,
    //   },
    // }),

    new ClosureCompiler({
      options: {
        languageIn: 'ECMASCRIPT5',
        languageOut: 'ECMASCRIPT5',
        compilationLevel: 'ADVANCED',
        warningLevel: 'QUIET', // 'DEFAULT',
        externs: [{ src: externs }]
      },
    }),

    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    })
  ]
});
