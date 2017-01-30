var webpack = require('webpack');
var helpers = require('./helpers');

module.exports = {

  entry: {
    'app': helpers.root('src', 'main.ts')
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader']
      },
    ]
  }
};
