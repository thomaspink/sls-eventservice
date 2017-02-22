const webpack = require('webpack');
const helpers = require('./helpers');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {

  entry: {
    // Script entry files
    'polyfills': helpers.root('src', 'client', 'polyfills.ts'),
    'app': helpers.root('src', 'client', 'main.ts'),
    'vendor': helpers.root('src', 'client', 'vendor.ts'),

    // Style entry files
    'internal': helpers.root('src', 'client', 'internal.scss'),
    'external': helpers.root('src', 'client', 'external.scss'),
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
      },{
        test: /\.scss$/,
        exclude: helpers.root('src', 'client', 'app'),
        use: ExtractTextPlugin.extract({
          use: ['raw-loader', 'sass-loader']
        })
      }
    ]
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    // creates 3 junks, does code splitting
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),

    // injects script tag into layout html template and saves the file to dist folder
    new HtmlWebpackPlugin({
      template: helpers.root('src', 'server', 'views', 'layouts', 'base.njk'),
      filename: helpers.root('dist', 'views', 'layouts', 'base.njk'),
      inject: 'body',
      excludeAssets: [/internal.*.js/, /external.*.js/]
    })

  ]
};
