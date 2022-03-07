const getUsers = require("../models/getUsers.js");

var express = require('express');
var router = express.Router();

router.get("/",
    (req, res) => getUsers.findAllUsers(res, req));

module.exports = router;