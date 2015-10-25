#!/usr/bin/env node
var extend = require('extend'),
  mysql = require('mysql'),
  express = require('express'),
  config = require('./config.defaults.js'),
  createApi = require('./api');

try {
  extend(config, require('./config'))
} catch(e) {

}

var dbclient = new mysql.createConnection(config.dbConnectParams);
dbclient.connect();

var app = express();

createApi(app, {
  dbclient: dbclient,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  organization: config.organization
});

app.use(express.static(__dirname + '/src'));

app.use('/assets', express.static(__dirname + '/src/assets'));
app.use('/js', express.static(__dirname + '/src/js'));
app.use('/sitemap.xml', express.static(__dirname + '/src/sitemap.xml'));


app.all('/*', function(req, res) {
  res.sendFile('index.html', { root: __dirname+'/src' });
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1', function() {
  console.log('%s: Node server started on %s:%s ...',
    Date(Date.now() ), process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1', process.env.OPENSHIFT_NODEJS_PORT || 8080);
});

module.exports = app;
