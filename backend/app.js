const express = require("express");
const port = 3000;
const app = express();
var path = require("path");

// app.locals.movieDB = '../backend/movies_example/movies.csv';
// app.locals.userDB = '../backend/movies_example/users.csv';
// app.locals.ratingDB = '../backend/movies_example/ratings.csv';

app.locals.movieDB = '../backend/movies_large/movies.csv';
app.locals.userDB = '../backend/movies_large/users.csv';
app.locals.ratingDB = '../backend/movies_large/ratings.csv';

const recMoviesPost = require('./routes/recMovies');
const topUsersPost = require('./routes/topUsers');
const getUsers = require('./routes/getUsers');

app.use(express.json());
app.use(express.urlencoded());

app.use('/recMovies', recMoviesPost);
app.use('/topUsers', topUsersPost);
app.use('/users', getUsers);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../frontend/index.html'));
});

app.use('/frontend/css', express.static('../frontend/css'));
app.use('/frontend/js/', express.static('../frontend/js/'));

const server = app.listen(port, () => console.log(`Server is listening to ${port}!`));

module.exports = server;