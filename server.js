var express = require('express');
var app = express();
var validUrl = require('valid-url');
var mongo = require('mongodb').MongoClient;

var MONGODB = 'mongodb://' + process.env.DBUSER + ':' + process.env.DBPWD + '@' + process.env.DBSERVER + ':' + process.env.DBPORT + '/' + process.env.DBNAME;
var collection;

function dbConnect() {
  mongo.connect(MONGODB, (err, db) => {
    if (err) {
      throw err; // Should be handled better
    }
    collection = db.collection(process.env.DBCOLLECTION);
  });
}

dbConnect();

app.get('/new/*', function(req, res) {
  try {
    var url = req.params[0];
    if (validUrl.isUri(url)) {
      if (collection) {
        collection.find({url : url})
          .toArray((err, docs) => {
          if (err) {
            throw err;
          } 
          if (docs.length > 0) {
            res.json({
              original_url: url,
              short_url: docs[0].short_url
            });
          } else {
            // Create a short url to call
            var group = {
              $group : {
                _id : "max", // arbitrary string
                total : {
                  $max : '$short_url'
                }
              }
            };
            console.log(collection.find().sort({short_url:-1}).limit(1));
            /*collection.aggregate([{}, group], function(err, res) {
              if (err) {
                throw err;
              }
              console.log(Number(res[0].max));
            });*/
            /*collection.insert(doc, function(err, data) {
              if (err) {
                throw err;
              }
              console.log(JSON.stringify(doc));
            });   */
          }

        });
        
      } else {
        res.json({
          error: "No database connection"
        })
      }
    } else {
      res.json({
        error: "Invalid URL"
      });
    }
  } catch (e) {
    res.sendStatus(500);
  }
});
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

