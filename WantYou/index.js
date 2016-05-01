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
var passwordHash = require('password-hash');




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
  // get data from page's request
  var loginData = req.body;
  var query = "select user_id, fname, pwd from user where email='" + loginData.email + "';";
  console.log(query);
  pool.getConnection(function (err, connection) {
    connection.query(query, function (err, rows) {
      connection.release();
      if (!err) {

        //console.log(rows);
        if (rows.length > 0) {        
          var dbpwd = rows[0].pwd;
          if (passwordHash.verify(req.body.password, dbpwd)) {
            req.session.user = {
              userId : rows[0].user_id,
              fname : rows[0].fname
            };
            res.json({result : true, msg : req.session.user});
          } else {
            res.json({result : false, msg : "wrong password"});
          }
        } else {
          res.json({result : false, msg : "wrong email"});
        }

      } else {
        console.log('Error is : ', err);
        res.json({result : false, msg : "login fail!"});
      }
    });
  });

});

//======= Register ========
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


    data.pwd = passwordHash.generate(data.pwd);
    console.log(data.pwd);
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

//service list
//select  city ="san francisco";
//TODO, city name
app.get('/serReqList', function (req, res) {
  var cityName = "San Francisco";
  var query = "select service_id, time, category_name, title from service as s, category as c " 
  query = query + "where s.category_id = c.category_id and city ='" + cityName +"';";
  //console.log(query);      

  pool.getConnection(function (err, connection) {
    connection.query(query, function (err, rows) {
      connection.release();
       if (!err) {
        var servInfo = [];
        for (let i = 0; i < rows.length; i++) {
          servInfo.push({
            service_id : rows[i].service_id,
            time : rows[i].time,
            category_name : rows[i].category_name,
            title : rows[i].title
          });
        }
        //console.log(servInfo);
        // add session check
        if (req.session.user) {
          res.render('pages/serReqList', {'data': servInfo, 'MemberInfo': req.session.user});
        } else {
          res.render('pages/serReqList', {'data': servInfo});
        }
        
      } else {
        console.log('Error is : ', err);
        console.log('Error while performing Query.');
      }
    });
  });
});

// admin user list
app.get('/admin', function (req, res) {
  var query = "select * from user;" 
  console.log(query);  

    pool.getConnection(function (err, connection) {
      connection.query(query, function (err, rows) {
        connection.release();
         if (!err) {
          res.render('pages/admin', {'data': rows});
        } else {
          console.log('Error is : ', err);
          console.log('Error while performing Query.');
        }
      });
    });
});


//======= Create Service ========
app.get('/service_create', function (req, res) {
  var renderPage = function (data) {
    if (req.session.user) {
      res.render('pages/service_create', {cateData: data, MemberInfo:req.session.user});
    } else {
      res.redirect('/login');
    }
  }
  pool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM category;', function(err, rows) {
      connection.release();
      if (err) {
        console.log('db error is: ', err);

      } else {          
        var data = [];
        for(let i = 0; i < rows.length; i++) {
          data.push({
            category_id: rows[i].category_id,
            category_name: rows[i].category_name
          });
        }
        console.log('data: ', data)
        renderPage(data);
      }
    });
  });
});

app.post('/service_create', function (req, res) {
  var data = req.body;
  var today = new Date();
  var currentTime = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  var category_id = 0;
  if (data.title == '' || data.description == '') {
    return json_false(res, "Please enter valid data");
  }

  var service = {
    title : data.title,
    description : data.description,
    state : data.state,
    city : data.city,
    time : currentTime,
    category_id : data.category_id,
    user_id : req.session.user.userId
  };
  console.log(service);
  pool.getConnection(function (err, connection) {
    var query = connection.query('INSERT INTO service SET ?', service, function(err, result) {
      connection.release();
      if (err) {
        console.log('db error is: ', err);
        res.json({result : false, msg : err});
      } else {
        if (result.affectedRows == 1) {
          return json_true(res, "register done!");
        }
        console.log('result is: ', result.affectedRows);
      }
    });
    //console.log(query);
  });
})

//======= Create Request =========
app.get('/request_create', function (req, res) {
  var renderPage = function (data) {
    if (req.session.user) {
      res.render('pages/request_create', {cateData: data, MemberInfo:req.session.user});
    } else {
      res.redirect('/login');
    }
  }
  pool.getConnection(function (err, connection) {
    connection.query('SELECT * FROM category;', function(err, rows) {
      connection.release();
      if (err) {
        console.log('db error is: ', err);

      } else {          
        var data = [];
        for(let i = 0; i < rows.length; i++) {
          data.push({
            category_id: rows[i].category_id,
            category_name: rows[i].category_name
          });
        }
        //console.log('data: ', data)
        renderPage(data);
      }
    });
  });
});

app.post('/request_create', function (req, res) {
  var data = req.body;
  var today = new Date();
  var currentTime = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  var category_id = 0;
  if (data.title == '' || data.description == '') {
    return json_false(res, "Please enter valid data");
  }

  var request = {
    title : data.title,
    description : data.description,
    state : data.state,
    city : data.city,
    time : currentTime,
    category_id : data.category_id,
    user_id : req.session.user.userId
  };
  console.log(request);
  pool.getConnection(function (err, connection) {
    var query = connection.query('INSERT INTO request SET ?', request, function(err, result) {
      connection.release();
      if (err) {
        console.log('db error is: ', err);
        res.json({result : false, msg : err});
      } else {
        if (result.affectedRows == 1) {
          return json_true(res, "register done!");
        }
        console.log('result is: ', result.affectedRows);
      }
    });
    //console.log(query);
  });
})

//======= Get Detail ========
app.get('/serReqDetail/:id', function (req, res) {
  var service_id = req.params.id;
  var query = "select s.service_id, s.title, s.time posttime, c.category_name, s.city, s.description, u.fname, u.phone, u.email, r.comment, r.time commenttime, avg(rate) avgrate from service as s, user as u, category as c, review as r where s.category_id = c.category_id and u.user_id = s.user_id and r.service_id = s.service_id and s.service_id = " + service_id + ";";
  pool.getConnection(function (err, connection) {
    connection.query(query, function(err, rows) {
      connection.release();
      if (err) {
        console.log('db error is: ', err);
      } else {          
        
        //console.log('data: ', data)
        //renderPage(data);
        getReviews(rows[0]);
      }
    });
  });

  var getReviews = function (detailData) {
    var reviewQuery = "select u.fname, r.time, r.comment, r.rate from review as r, user as u where u.user_id = r.user_id and r.service_id = " + service_id + ";";
    
    pool.getConnection(function (err, connection) {
      connection.query(reviewQuery, function(err, rows1) {
        connection.release();
        if (err) {
          console.log('db error is: ', err);
        } else {          
          
          console.log('data: ', detailData)
          //renderPage(data);
          if (req.session.user) {
            res.render('pages/serReqDetail', {data: detailData, reviews: rows1, MemberInfo: req.session.user});
          } else {
            res.render('pages/serReqDetail', {data: detailData, reviews: rows1});
          }
        }
      });
    });

  }
});

app.post('/writereview', function (req, res) {
  console.log('revew', req.body)
  var today = new Date();
  var currentTime = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  var reviewData = {
    user_id : req.body.user_id,
    service_id : req.body.service_id,
    time : currentTime,
    comment : req.body.comment,
    rate : req.body.rate
  };

  console.log(reviewData);
  
  pool.getConnection(function (err, connection) {
    connection.query('INSERT INTO review SET ?', reviewData,function(err, result) {
      connection.release();
      if (err) {
        console.log('db error is: ', err);
      } else {          
        console.log(result)
        if (result.affectedRows == 1) {
          return json_true(res, "review done!");
        } else {
          return json_false(res, "error while creating review!");
        }
      }
    });
  });
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
