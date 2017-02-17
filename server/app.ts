import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as compression from 'compression';
import * as helmet from 'helmet';

// create a new express app
const app = express();

// configure nunjucks
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});

// Use gzip compression
app.use(compression());

// Helmet can help protect your app from some well-known web
// vulnerabilities by setting HTTP headers appropriately.
app.use(helmet());

// define location where static files are
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
  res.render('routes/index.njk');
});

app.listen(3000, function () {
  console.log('Listening on: http://localhost:3000');
});
