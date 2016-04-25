'use strict';

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http');
var async = require("async");
var request = require("request");
var mysql = require("mysql");
var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'root',
  database:'CMPE226'
});

//Open mysql connection
connection.connect(function(err){
  if(!err) {
      console.log("Database is connected ... nn");    
  } else {
      console.log("Error connecting database ... nn");    
  }
});


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 
// for session access
app.use(cookieParser());
app.use(session({
	secret : 'CMPE226_secret_key',
	cookie : {/*secure : true*/}
	}));

// index.html
app.get('/', function(req, res) {
  connection.query('SELECT * from test', function(err, rows, fields) {
  connection.end();
    if (!err) {
      console.log('data: ', rows);
      res.render('pages/index', {data : rows});
    }
    else {
      console.log('Error while performing Query.');
    }
  });
  
});


function json_false (res, msg) {
	res.json({ result : false, msg : msg });
	return void(null);
}

function json_true (res, data) {
	res.json({ result : true, data : data });
	return void(null);
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});