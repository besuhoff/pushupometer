var crypto = require('crypto'),
    request = require('request');

function AppBase(self, app, settings) {
  var wrapper = self,
      dbclient = settings.dbclient;

  /*app.get('/api/marks/contributions/:contrib_id', function (req, res) {
    var token = req.headers.access_token;

    if (!token) {
      res.send(401, 'Not authorized');
      return;
    }


    var sql = 'SELECT contrib_id, feed, count(*) as number FROM marks WHERE contrib_id = $1 GROUP BY contrib_id, feed',
        contribId = parseInt(req.params.contrib_id, 10);

    dbclient.query(sql, [contribId], function (err, queryResult) {

      if (err) {
//        console.log(err);
      }
      var rows = queryResult.rows;
      var result = {contrib_id: contribId, pizza: 0, tomato: 0, userVote: null};

      for (var i in [0, 1]) {
        if (rows[i]) {
          result[rows[i].feed] = parseInt(rows[i].number, 10);
        }
      }

      wrapper._getUser(token, function (userInfo) {
        if (!userInfo.id) {
          res.send(401, 'Not authorized');
          return;
        }
        var userId = userInfo.id,
            sql = 'SELECT feed FROM marks WHERE contrib_id = $1 and user_id = $2';

        dbclient.query(sql, [contribId, userId], function (err, queryResult) {
          if (queryResult.rows[0]) {
            result.userVote = queryResult.rows[0].feed;
          }
          res.send(result);
        });

      });

    });
  });

  app.post('/api/marks/contributions', function (req, res) {

    var token = req.headers.access_token;

    if (!token) {
      res.send(401, 'Not authorized');
      return;
    }

    wrapper._getUser(token, function (userInfo) {
      if (!userInfo.id) {
        res.send(401, 'Not authorized');
        return;
      }

      var userId = userInfo.id,
          sql = 'select feed from marks where contrib_id = $1 AND user_id=$2',
          contribId = req.body.contrib_id,
          feed = req.body.feed,
          data = [contribId, userId, feed];

      dbclient.query(sql, [contribId, userId], function (err, queryResult) {
        if (err) {
//          console.log(err);
          res.send({ error: err });
          return;
        }
        var rows = queryResult.rows,
            sql = '';

        if (rows[0]) {
          if (rows[0].feed !== feed) {
            sql = 'UPDATE marks SET feed = $3 WHERE user_id = $2 AND contrib_id=$1';
          } else {
            res.send({ error: 'You have only one ' + feed + ' for this contribution' });
          }
        } else {
          sql = 'INSERT INTO marks(contrib_id, user_id, feed) VALUES($1,$2,$3)';
        }

        if (sql !== '') {
          dbclient.query(sql, data, function (err, queryResult) {
            if (err) {
//              console.log('request failed:', err);
              res.send(500, { error: err });
            } else {
              res.send(queryResult);
            }
          });
        }
      });
    });

  });
*/
  //gitHub user info request
  app.get('/api/github/user', function (req, res) {

    var token = req.headers.access_token;

    if (!token) {
      res.send(401, 'Not authorized');
      return;
    }

    wrapper._getUser(token, function (userInfo) {
      if (!userInfo) {
        res.send(401, 'Not authorized');
      } else {
        res.send(userInfo);
      }
    });

  });

  self._proxy = function (req, res) {
    var url = 'https://api.github.com' + req.url.replace('/api/github/', '/');
    var apiReq = request(url, {
      headers: { 'Authorization': 'token ' + req.headers.access_token }
    });

//    console.log(apiReq);
    req.pipe(apiReq).pipe(res);
  };
}

function App(app, settings) {
  App.prototype = new AppBase(this, app, settings);


  //gitHub OAuth token request
  app.get('/api/github/gettoken/:code', function (req, res) {
    request.post({
      uri: 'https://github.com/login/oauth/access_token',
      form: {
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        code: req.params.code
      },
      json: true
    }, function (err, httpResponse, body) {
      if (err) {
//        console.error('request failed:', err);
        res.send(500, { error: err });
        return;
      }
      res.send(body);
    });
  });

  this._getUser = function (token, callback) {
    request.get({
      uri: 'https://api.github.com/user?access_token=' + token,
      headers: {
        'User-Agent': 'request'
      },
      json: true
    }, function (err, httpResponse, body) {
      if (err) {
//        console.error('request failed:', err);
        callback(false);
        return;
      }
      callback(body);
    });
  };

  app.get('/api/github/oauth', function (req, res) {
    var authUri = 'https://github.com/login/oauth/authorize?client_id=' + settings.clientId + '&scope=repo&redirect_uri=';
    res.redirect(authUri);
  });

  app.get('/api/github/*', this._proxy);
}

function createApi(app, settings) {
  new App(app, settings);
  return app;
}

module.exports = createApi;