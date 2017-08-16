const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./config/webpack.dev.js');
const compiler = webpack(webpackConfig);
const cors = require('cors');

// Create the express app
const app = express();

// Cross Origin Requests
app.use(cors());

// Attach webpack-dev-middleware and webpack-hot-middleware
app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'app.bundle.js',
  publicPath: webpackConfig.output.publicPath,
  noInfo: true,
  stats: {
    colors: true,
  },
  historyApiFallback: true,
}));
app.use(webpackHotMiddleware(compiler, {
  log: console.log,
  path: '/__webpack_hmr',
  heartbeat: 10 * 1000
}));

// Create static directories
app.use('/dist', express.static(__dirname + '/dist'));

// Set the address/port
const address = process.env.DOCKER_HOST || 'localhost';
const port = process.env.PORT || 4000

// Listen to the port
const server = app.listen(port, function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Running on http://%s:%s', address, port);
});
