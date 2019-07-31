// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = module.exports = loopback();
// Create an instance of PassportConfigurator with the app instance
const PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
const passportConfigurator = new PassportConfigurator(app);

const SpotifyStrategy = require('passport-spotify').Strategy;

/*
 * body-parser is a piece of express middleware that
 *   reads a form's input and stores it as a javascript
 *   object accessible through `req.body`
 *
 */
const bodyParser = require('body-parser');

/**
 * Flash messages for passport
 *
 * Setting the failureFlash option to true instructs Passport to flash an
 * error message using the message given by the strategy's verify callback,
 * if any. This is often the best approach, because the verify callback
 * can make the most accurate determination of why authentication failed.
 */
const flash      = require('express-flash');

// Load the provider configurations
var config = {};
try {
 config = require('../providers.json');
} catch(err) {
 console.error('Please configure your passport strategy in `providers.json`.');
 console.error('Copy `providers.json.template` to `providers.json` and replace the clientID/clientSecret values with your own.');
 process.exit(1);
}

// Initialize passport
passportConfigurator.init();


app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};



// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json());
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

// The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.accessToken,
}));

app.middleware('session:before', cookieParser(app.get('cookieSecret')));
app.middleware('session', session({
  secret: 'kitty',
  saveUninitialized: true,
  resave: true,
}));
passportConfigurator.init();
// console.log(`passport configure: `, {
//   userModel: app.models.Account,
//   userIdentityModel: app.models.UserIdentity,
//   userCredentialModel: app.models.UserCredential
//  })
// Set up related models
passportConfigurator.setupModels({
  AccountModel: app.models.Account,
  UserIdentityModel: app.models.UserIdentity,
  UserCredentialModel: app.models.UserCredential
 });


 // Configure passport strategies for third party auth providers
 for(var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
 }
// We need flash messages to see passport errors
app.use(flash());
