const webpack = require('webpack');
const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

module.exports = {

  entry: {
    // Script entry files
    'polyfills': helpers.root('src', 'client', 'polyfills.ts'),
    'app': helpers.root('src', 'client', 'main.ts'),
    'vendor': helpers.root('src', 'client', 'vendor.ts'),

    // Style entry files
    'critical.css': helpers.root('src', 'client', 'critical.scss'),
    'main.css': helpers.root('src', 'client', 'main.scss'),
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            configFileName: helpers.root('src', 'client', 'tsconfig.json')
          }
        }
      }, {
        test: /\.scss$/,
        exclude: helpers.root('src', 'client', 'app'),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          //resolve-url-loader may be chained before sass-loader if necessary
          use: ['raw-loader', 'sass-loader']
        })
      }
    ]
  },

  plugins: [

    // creates 3 junks, does code splitting
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),

    // injects script tag into layout html template and saves the file to dist folder
    new HtmlWebpackPlugin({
      template: helpers.root('src', 'server', 'views', 'layouts', 'base.njk'),
      filename: helpers.root('dist', 'views', 'layouts', 'base.njk'),
      inject: 'body',
      excludeAssets: [/critical.css.bundle.js/, /main.css.bundle.js/]
    }),

    // Exludes asses specified in the excludeAssets array
    new HtmlWebpackExcludeAssetsPlugin(),

    // extracts css form the js bundles and saves it as its own file
    new ExtractTextPlugin('[name]'),

    // inlines critical css into a style tag in you html
    new StyleExtHtmlWebpackPlugin('critical.css'),

    // adds a defer attribute to the injected script tags
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    })

  ]
};
