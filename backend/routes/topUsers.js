const topUsers = require("../models/topUsers.js");

var express = require('express');
var router = express.Router();

router.get("/",
    (req, res) => topUsers.findUsers(res, req));

module.exports = router;