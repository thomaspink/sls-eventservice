import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as compression from 'compression';
import * as helmet from 'helmet';

// create a new express app
const app = express();

// get port or fall back to 8080
const PORT: number = process.env.PORT || 8080;

// configure nunjucks
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  noCache: true // TODO: do this only in dev mode
});

// Use gzip compression
app.use(compression());

// Helmet can help protect your app from some well-known web
// vulnerabilities by setting HTTP headers appropriately.
app.use(helmet());

// define location where static files are
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
  res.render('routes/index.njk');
});

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
  console.log(`Press Ctrl+C to quit.`);
});
