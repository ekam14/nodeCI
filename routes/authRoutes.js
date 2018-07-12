const passport = require('passport');

module.exports = app => {
  app.get(    // on click (a href)first redirect the user to google.com after authorization it will get redirected to /auth/google/callback
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']   // want only profile and email for verification
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {   // will only succeed if authentication is valid
      res.redirect('/blogs');
    }
  );

  app.get('/auth/logout', (req, res) => {   // on logout button //
    req.logout();
    res.redirect('/');    // to home page
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
