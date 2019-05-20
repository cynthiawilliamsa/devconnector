const express = require('express');
const mongoose = require('mongoose');


const app = express();

//body parser middleware
app.use(express.json({extended: false}));

//dB config
const db = require('./config/keys', {useNewUrlParser: true}).mongoURI;

//connect to mongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));



//Define routes routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'))

//process.env is for heroku deploy
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));