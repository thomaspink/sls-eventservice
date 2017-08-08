const webpack = require('webpack');
const helpers = require('./helpers');

module.exports = {

  entry: {
    // Script entry files
    'polyfills': helpers.root('src', 'client', 'polyfills.ts'),
    'vendor': helpers.root('src', 'client', 'vendor.ts'),
    'app': helpers.root('src', 'client', 'main.ts'),

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
      },
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
