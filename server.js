var fs = require('fs');
var express = require('express');
var app = express();
var validUrl = require('valid-url');
var mongo = require('mongodb').MongoClient;

var MONGODB = 'mongodb://' + process.env.DBUSER + ':' + process.env.DBPWD + '@' + process.env.DBSERVER + ':' + process.env.DBPORT + '/' + process.env.DBNAME;
// The next short url value to use.
// If this is 0 it hasn't been initialised and the
// database connection isn't ready to use
var nextShortUrl = 0;

// !!! Change some of this to work with promises rather than chaining callbacks

mongo.connect(MONGODB, (err, db) => {
  if (err) {
    throw err; // Should be handled better
  }
  app.locals.collection = db.collection(process.env.DBCOLLECTION);
  app.locals.collection.ensureIndex("short_url", {unique: true}, function(err, name) {
    if (err) {
      throw err;
    }
    app.locals.collection.count({}, function(err, count) {
      if (err) {
        throw err;
      }
      console.log(count + " documents found in database");
      if (count === 0) {
        nextShortUrl = count + 1;
        console.log("DB entries NOT found. Next short_url: " + nextShortUrl);
      } else { 
        var options = { "sort": [['short_url','desc']] }
        var a = app.locals.collection.findOne({}, options, function(err, doc) {
          if (err) {
            throw err;
          }
          nextShortUrl = doc.short_url + 1;
          console.log("DB entries found. Next short_url: " + nextShortUrl);
        });
      }
    });
  });
});

app.get('/new/*', function(req, res) {
  try {
    var url = req.params[0];
    if (validUrl.isUri(url)) {
      if (req.app.locals.collection && nextShortUrl != 0) {
        req.app.locals.collection.find({url : url})
          .toArray((err, docs) => {
          if (err) {
            throw err;
          } 
          if (docs.length > 0) {
            var short_url = req.protocol + '://' + req.get('host') + '/' + docs[0].short_url;
            res.json({
              original_url: url,
              short_url: short_url
            });
          } else {
            var doc = {
              url: url,
              short_url: nextShortUrl
            };
            req.app.locals.collection.insert(doc, function(err, data) {
              if (err) {
                throw err;
              }
            });
            var short_url = req.protocol + '://' + req.get('host') + '/' + nextShortUrl;
            res.json({
              original_url: url,
              short_url: short_url
            });
            nextShortUrl++;
          }

        });
        
      } else {
        res.json({
          error: "No database connection"
        })
      }
    } else {
      res.json({
        error: "Invalid URL. Make sure it starts with http(s)://"
      });
    }
  } catch (e) {
    res.sendStatus(500);
  }
});
  
app.get('/:short_url_id', function(req, res) {
  try {
    var short_url_id = parseInt(req.params.short_url_id + '');
    if (req.app.locals.collection) {
      req.app.locals.collection.find({short_url : short_url_id})
        .toArray((err, docs) => {
        if (err) {
          throw err;
        } 
        if (docs.length > 0) {
          res.redirect(docs[0].url);
        } else {
          res.json({
            error: "URL not found in the database"
          });
        }
      });
    } else {
      res.json({
        error: "No database connection"
      })
    }
    
  } catch (e) {
    res.sendStatus(500);
  }
});

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

