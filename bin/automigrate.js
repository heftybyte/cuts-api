var path = require('path');

var app = require(path.resolve(__dirname, '../server/server.js'));
var ds = app.datasources.db;
ds.automigrate()
