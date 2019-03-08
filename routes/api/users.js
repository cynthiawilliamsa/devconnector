const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

//load User Model
const User = require("../../models/User");

//@route GET api/users/test
//@desc Tests users route
//@access Private
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

//@route GET api/users/register
//@desc Register user
//@access Public
router.post("/register", (req, res) => {
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

//@route GET api/users/login
//@desc Login User /returning JWT Token
//@access Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }
    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //generate token here
        //user matched
        const payload = {id: user.id, name: user.name, avatar: user.avatar} //create JWT payload
        //sign token
        jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
            res.json({
                success: true,
                token: 'Bearer ' + token
            })
        });
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});

module.exports = router;
