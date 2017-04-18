import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { useWebpackMiddleware } from './webpack.middleware';

const ENV = process.env.NODE_ENV || 'production';
const isDEV = ENV === 'development';

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
  console.error(`\x1b[31mERROR: Unknown Environment "${process.env.NODE_ENV}"! \x1b[0m`);
  console.error(`\x1b[31mOnly "production" or "development" is allowed.\x1b[0m`);
  console.error(`\x1b[31mFalling back to "production"\x1b[0m`);
}

// create a new express app
const app = express();

// get port or fall back to 8080
const PORT: number = process.env.PORT || 8080;

// configure nunjucks
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  noCache: isDEV
});

if (isDEV) {
  // inject webpack middleware for hot module reloading
  useWebpackMiddleware(app);
} else {
  // Use gzip compression
  app.use(compression());

  // Helmet can help protect your app from some well-known web
  // vulnerabilities by setting HTTP headers appropriately.
  app.use(helmet());
}

// define location where static files are
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
  res.render('routes/index.njk');
});

app.get('/referenzen', function (req, res, next) {
  res.render('routes/referenzen.njk');
});

app.get('/referenzen/:id', function (req, res, next) {
  res.render('routes/referenzen-detail.njk');
});

app.listen(PORT, function () {
  console.log(``);
  console.log(`\x1b[32m#####################################\x1b[0m`);
  console.log(`\x1b[32mApp listening on port ${PORT}\x1b[0m`);
  console.log(`\x1b[32mOpen: http://localhost:${PORT}\x1b[0m`);
  console.log(`Environment: ${ENV}`);
  console.log(`Press Ctrl+C to quit.`);
  if (isDEV) {
    console.log(`Enter \`rs\` to restart server`);
  }
  console.log(`\x1b[32m#####################################\x1b[0m`);
  console.log(``);
});
