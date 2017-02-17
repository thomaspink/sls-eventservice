const webpack = require('webpack');
const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  entry: {
    'polyfills': helpers.root('client', 'polyfills.ts'),
    'app': helpers.root('client', 'main.ts'),
    'vendor': helpers.root('client', 'vendor.ts'),
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
            configFileName: helpers.root('client', 'tsconfig.json')
          }
        }
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),
    // new HtmlWebpackPlugin({
    //   template: 'dist/views/layouts/base.njk',
    //   filename: '../../../server/views/layouts/base.njk',
    //   inject: 'body'
    // }),
  ]
};
