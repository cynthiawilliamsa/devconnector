const express = require('express');
const router = express.Router();

//@route POST api/auth
//@desc Tests auth route
//@access Private
router.get("/", (req, res) => res.send('auth route'));

module.exports = router;