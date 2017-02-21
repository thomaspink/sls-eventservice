const webpack = require('webpack');
const helpers = require('./helpers');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
