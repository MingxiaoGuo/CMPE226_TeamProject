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
var pool = mysql.createPool({
  host:'localhost',
  user:'root',
  password:'',
  database:'wantYou'
});

//Open mysql connection
pool.getConnection(function(err){
  if(!err) {
    console.log("Database is connected ... ");    
  } else {
    console.log(err)
    console.log("Error connecting database ... ");    
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
  if (req.session.user) {
    res.render('pages/index', {MemberInfo : req.session.user});
  } else {
    res.render('pages/index');
  }
  
});

app.get('/login', function (req, res) {
  res.render('pages/login');
});

app.post('/login', function (req, res) {
  var loginData = req.body;
  var query = "select user_id, fname from user where email='" + loginData.email + "' and pwd='" + loginData.password + "';";
  console.log(query);
  pool.getConnection(function (err, connection) {
    connection.query(query, function (err, rows) {
      connection.release();
      if (!err) {
        req.session.user = {
          userId : rows[0].user_id,
          fname : rows[0].fname
        };
        res.json({result : true, msg : req.session.user});
      } else {
        console.log('Error is : ', err);
        res.json({result : false, msg : "login fail!"});
      }
    });
  });

});

app.get('/register', function (req, res) {
  res.render('pages/register');
});


//service list
//select  city ="san francisco";
//TODO, city name
app.get('/serReqList', function (req, res) {
  var cityName = "San Francisco";
  var query = "select time, category_name, title from service as s, category as c " 
  query = query + "where s.category_id = c.category_id and city ='" + cityName +"';";
  console.log(query);      

    pool.getConnection(function (err, connection) {
      connection.query(query, function (err, rows) {
        connection.release();
         if (!err) {
          res.render('pages/serReqList', {'data': rows});
        } else {
          console.log('Error is : ', err);
          console.log('Error while performing Query.');
        }
      });
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

app.get('/service/create', function (req, res) {

  res.render('pages/service_create');
});

app.get('/request/create', function (req, res) {

  res.render('pages/request_create');
});