var crypto = require('crypto'),
    request = require('request');

function AppBase(self, app, settings) {
  var wrapper = self,
      dbclient = settings.dbclient;

  app.get('/api/workout/:user/stats', function (req, res) {
    var token = req.headers.access_token;

    if (!token) {
      res.send(401, 'Not authorized');
      return;
    }

    var user = req.params.user,
      sql = 'select "total" as `key`, sum(amount) as `value` ' +
        'from (' +
        ' select request.* ' +
        ' from request ' +
        ' inner join review ' +
        ' on review.event_type = "request" and review.event_id = request.id ' +
        ' group by request.id having count(*) >= 2 ' +
        ') s where s.trainee = ' + dbclient.escape(user) + ' ' +

        'union ' +

        'select "workout" as `key`, sum(amount) as `value` ' +
        'from (' +
        ' select workout.*, ' +
        ' count(*) as approval_count ' +
        ' from workout ' +
        ' inner join review ' +
        ' on review.event_type = "workout" and review.event_id = workout.id ' +
        ' group by workout.id ' +
        ') s where s.trainee = ' + dbclient.escape(user) + ' and (approval_count >= 2)';

    dbclient.query(sql, function (err, rows) {

      if (err) {
        res.send(500, err);
      }
      var result = {total: 0, workout: 0, left: 0};

      for (var i in [0, 1]) {
        if (rows[i]) {
          result[rows[i].key] = +rows[i].value;
        }
      }
      result.left = result.total - result.workout;

      res.send(result);
    });
  });
/*
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