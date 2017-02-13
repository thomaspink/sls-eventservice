import * as express from 'express';
import * as nunjucks from 'nunjucks';

const app = express();

nunjucks.configure(__dirname + '/templates', {
  autoescape: true,
  express: app
});

app.get('/', function (req, res, next) {
  res.render('index.html');
});

app.listen(3000, function () {
  console.log('Listening on: http://localhost:3000');
});
