/*
    POST /login -> authentificate in the system
    GET /       -> get to the login page

    The functions passport.use, passport.serializeUser, passport.deserializeUser are taken from the
    official documentation http://www.passportjs.org/docs and adapted to the User model of this system
*/

const express = require('express');
const router = express.Router();
const passport = require ('passport');
const LocalStrategy = require ('passport-local').Strategy;
const User = require('./../server/models/user.js');
var {rooms, Room} = require('./../server/models/rooms.js');
/*
    GET / -> get to the login page
*/
router.get("/availability", (req, res) => {
    Room.find({}, null, { sort: { name: 1 } })
      .then((rooms) => {
        var roomsJSON = {};
        // rooms is an array with all rooms
        for (var i = 0; i < rooms.length; ++i) {
          roomsJSON[rooms[i].name] = rooms[i].availability;
        }
  
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(roomsJSON));
      })
      .catch((err) => {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.status(400).send(JSON.stringify({ noroom: false }));
      });
  });
  
  router.get("/login", (req, res) => {
    res.status(200).render("login", { layout: false });
  });

  router.get("/detailedavailability", (req, res) => {
    res.status(200).render("detailedAvailability", { layout: false });
  });
  
  router.get("/", (req, res) => {
    Room.find({}, null, { sort: { name: 1 } })
      .then((rooms) => {
        res.status(200).render("mainpage", { layout: false, rooms: rooms });
      })
      .catch((err) => {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.status(400).send(JSON.stringify({ noroom: false }));
      });
  });
  

/*
    POST /login -> authentificate the user
*/
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/app',
        failureRedirect: '/',
        failureFlash: true
    }), function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        res.redirect('/app');
    }
);


// the Middleware for authetification -> provided by the passport library
passport.use(new LocalStrategy(
  function(username, password, done) {
      User.getUserByUsername(username, function(err, user) {
          if (err) {
              throw err;
          }
          if (! user) {
              //     done(error, found the user)
              return done(null, false, {message: "Unknown User"});
          }

          User.comparePassword(password, user.password, function (err, isMatch) {
              if (err) {
                  throw err;
              }
              if (isMatch) {
                  return done(null, user);
              } else {
                  return done(null, false, 'Invalid password');
              }
          });
      });
  }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
});

module.exports = router;
