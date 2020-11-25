const serverless = require('serverless-http');
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var onHeaders = require('on-headers');

// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    consumerKey: process.env.twitterAppKey,
    consumerSecret: process.env.twitterAppSecret,
    callbackURL: 'https://f6n7ljiyh2.execute-api.us-east-2.amazonaws.com/dev/oauth/callback',
    proxy: false
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ 
  secret: 'keyboard cat', 
  resave: true, 
  saveUninitialized: true, 
  cookie: { 
    secure: true ,
    sameSite: 'Lax'
  }
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

function responseDebugger() {
  const redirectUrl = this.getHeader('location');

  console.log(redirectUrl);
//  this.removeHeader('location');

//  this.setHeader('x-goto', redirectUrl);
//  this.body = redirectUrl;
}

var middlewareExample = function(req, res, next){
  onHeaders(res, responseDebugger);
  next();
};

app.get('/oauth',
  middlewareExample,
  passport.authenticate('twitter'));

export const main = serverless(app);
