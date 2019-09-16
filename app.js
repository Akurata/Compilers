const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
global.env = process.env.NODE_ENV || 'dev';

app.use(express.static(path.resolve('views'), {maxAge: 86400000}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', (req, res) => {
  res.sendFile(path.resolve('views/html/index.html'));
});






app.listen(80, (err) => {
  if(err) throw err;
  console.log("App started 80");
});
