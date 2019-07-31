var oauth2 = require('loopback-component-oauth2');

var options = {
  dataSource: app.dataSources.db, // Data source for oAuth2 metadata persistence
  loginPage: '/login', // The login page URL
  loginPath: '/login' // The login form processing URL
};

oauth2.oAuth2Provider(
  app, // The app instance
  options // The options
);