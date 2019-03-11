const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());


//dB config
const db = require('./config/keys', {useNewUrlParser: true}).mongoURI;

//connect to mongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);

//User routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

//process is for heroku deploy
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));