const webpack = require('webpack');
const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = {

  entry: {
    'polyfills': helpers.root('src','client', 'polyfills.ts'),
    'app': helpers.root('src','client', 'main.ts'),
    'vendor': helpers.root('src','client', 'vendor.ts'),
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
            configFileName: helpers.root('src','client', 'tsconfig.json')
          }
        }
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
      inject: 'body'
    }),

    // adds a defer attribute to the injected script tags
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    })
  ]
};
