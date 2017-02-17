import * as express from 'express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

// create a new express app
const app = express();

// configure nunjucks
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app
});

// define location where static files are
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
  res.render('routes/index.njk');
});

app.listen(3000, function () {
  console.log('Listening on: http://localhost:3000');
});
