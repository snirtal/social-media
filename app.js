const express = require('express');
 const bodyParser = require('body-parser');
 const cors = require('cors');
 const mongoose = require('mongoose');
require('custom-env').env(process.env.NODE_ENV, './config');
//$env:NODE_ENV="local"; node app.js
  mongoose.connect(process.env.CONNECTION_STRING,{
 useNewUrlParser: true,
 useUnifiedTopology: true });

 var app = express();
 app.use(cors());
 app.use(bodyParser.urlencoded({extended : true}));
 app.use(express.json());
 app.listen(process.env.PORT);