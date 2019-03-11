const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//load User Model
const User = require("../../models/User");

//@route GET api/users/test
//@desc Tests users route
//@access Private
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

//@route POST api/users/register
//@desc Register user
//@access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  //mongoose to see if email exists
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      //return 400 status and object showing error
      return res.status(400).json({ email: "Email already exists" });
    } else {
      //create new user
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      //hash for password using bcryptjs
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          //if err
          if (err) throw err;
          //save plain password to hash
          newUser.password = hash;
          //mongoose method to save to DB
          newUser
            .save()
            //if success returns json with new user
            .then(user => res.json(user))
            //if failure returns err
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route POST api/users/login
//@desc Login User /returning JWT Token
//@access Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //generate token here
        //user matched
        const payload = { id: user.id, name: user.name, avatar: user.avatar }; //create JWT payload
        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

//@route GET api/users/current
//@desc return current user
//@access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
