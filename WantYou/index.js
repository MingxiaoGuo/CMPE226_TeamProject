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

app.post('/register', function(req, res) {
  var data = req.body;
  // check data integrity
  if (data.fname == '' || data.lname == '' || data.email == '' 
    || data.pwd == '' || data.confpwd == '' || data.gender == '') {
    // if any required field is empty, return error to page
    return json_false(res, "Please input valid data");
  } else  if (!data.email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
    // if email field does not match email format, return error to page
    return json_false(res, "Please input valid email");
  } else if (data.pwd != data.confpwd) {
    // if two passwords don't match, return error to page
    return json_false(res, "password don't match");
  } else {
    // confpwd doesn't exist in database, delete it before insert
    delete data.confpwd;
    // 
    pool.getConnection(function (err, connection) {
      var query = connection.query('INSERT INTO user SET ?', data, function(err, result) {
        //
        connection.release();
        if (err) {
          console.log('db error is: ', err);
        } else {
          if (result.affectedRows == 1) {
            return json_true(res, "register done!");
          }
          console.log('result is: ', result.affectedRows);
        }
      });
      //console.log(query);
    });
  }
})

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