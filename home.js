const serverless = require('serverless-http');
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var axios = require('axios');
var cors = require('cors');

const twitterApiKey = process.env.twitterApiKey;

axios.defaults.headers.common['Authorization'] = `Bearer ${twitterApiKey}`;

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
    callbackURL: 'https://api.i1729.com/oauth/callback',
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
app.use(cors());
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));

var session = require('express-session');
var DynamoDBStore = require('connect-dynamodb')(session);

var options = {
    AWSConfigJSON: {
        accessKeyId: process.env.awAccessKey,
        secretAccessKey: process.env.awwSecretKey,
        region: 'us-east-2'
    }
};

app.use(session(({
  store: new DynamoDBStore(options),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: new Date(Date.now() + 3600000)
  }
})));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/home',
  function(req, res) {
    let user = req.user._json;
    res.redirect('https://credential.i1729.com/' + user.id_str);
/*
    Object.assign(user, {member1729: false});

    axios({ method: 'get', url: 'https://api.twitter.com/1.1/lists/members.json?count=5000&list_id=1327835085010313219' })
    .then(res => {
      Promise.all(
        res.data.users.map(apiUser => {
          if (apiUser.id === user.id) {
            user.member1729 = true;
          }
        })
      );
    })
    .then(() => {
      res.json({ user: user });
    })
    .catch(err => {
      return err;
    });
*/
  });

export const main = serverless(app);
