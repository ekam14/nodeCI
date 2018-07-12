const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');   //used for authentication
const bodyParser = require('body-parser');
const keys = require('./config/keys');

require('./models/User');
require('./models/Blog');
require('./services/passport');
require('./services/cache');

mongoose.Promise = global.Promise;   /*we want default callbacks to be promises */
mongoose.connect(keys.mongoURI, { useMongoClient: true });  /* for connection to the mongoDB database */

const app = express();

app.use(bodyParser.json());    /*we want the browser to parse data in JSON form */
app.use(
  cookieSession({   // this will automatically attach the session property to the req
    maxAge: 30 * 24 * 60 * 60 * 1000,   // expire time for the cookie  i.e 30 days
    keys: [keys.cookieKey]  // for session and session-sig
  })
);
app.use(passport.initialize());    //to use passport in your app
app.use(passport.session());       //for login sessions

require('./routes/authRoutes')(app);
require('./routes/blogRoutes')(app);

if (['production','ci'].includes(process.env.NODE_ENV)) {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port`, PORT);
});
