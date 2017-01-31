const webpack = require('webpack');
const helpers = require('./helpers');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  entry: {
    // 'polyfills': helpers.root('src', 'polyfills.ts'),
    'app': helpers.root('src', 'main.ts'),
    'vendor': helpers.root('src', 'vendor.ts'),
    // 'css': helpers.root('src', 'main.css')
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
            configFileName: helpers.root('src', 'tsconfig.json')
          }
        }
      },{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallbackLoader: "style-loader",
          loader: "css-loader?sourceMap"
        })
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor']
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
  ]
};
