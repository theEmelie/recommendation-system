const recMovies = require("../models/recMovies.js");

var express = require('express');
var router = express.Router();

router.get("/",
    (req, res) => recMovies.findRecMovies(res, req));

module.exports = router;