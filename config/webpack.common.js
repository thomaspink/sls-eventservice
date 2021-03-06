const webpack = require('webpack');
const helpers = require('./helpers');

module.exports = {

  entry: {
    // Script entry files
    'polyfills': helpers.root('src', 'client', 'polyfills.ts'),
    'vendor': helpers.root('src', 'client', 'vendor.ts'),
    'app': helpers.root('src', 'client', 'main.ts'),

    // Style entry files
    'inline': helpers.root('src', 'client', 'internal.scss'),
    'main': helpers.root('src', 'client', 'external.scss'),
    'editor': helpers.root('src', 'client', 'editor.scss'),
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
      }
      // , {
      //   test: /\.scss$/,
      //   exclude: helpers.root('src', 'client', 'app'),
      //   use: ['style-loader', 'css-loader', 'sass-loader']
      // }
    ]
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    // creates 3 junks, does code splitting
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    })
  ]
};
