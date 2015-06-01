#!/usr/bin/env node
var express = require('express'); 
var app = express();

app.use(express.static(__dirname + '/src'));

app.use('/assets', express.static(__dirname + '/src/assets'));
app.use('/js', express.static(__dirname + '/src/js'));
app.use('/sitemap.xml', express.static(__dirname + '/src/sitemap.xml'));


app.all('/*', function(req, res) {
  res.sendFile('index.html', { root: __dirname+'/src' });
});

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP, function() {
  console.log('%s: Node server started on %s:%d ...',
    Date(Date.now() ), process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP);
});

module.exports = app;
