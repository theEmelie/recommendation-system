const readCSVfile = require('./readCSVfile');

const getUsers = {
    /**
     * Read in the user csv file to get all the users.
     * @param {res} res 
     * @param {req} req 
     */
    findAllUsers: function(res, req) {
        var path = require("path");
        var FileReader = require('filereader');
        var fapi = require ('file-api');
        
        var reader = new FileReader();
        var File = fapi.File;
        
        reader.onload = function(e) {
            result = readCSVfile.readFile(e);
            //console.log(JSON.stringify(result));
            return res.status(200).send(JSON.stringify(result));
        }
        reader.readAsText(new File(req.app.locals.userDB));
    }
};

module.exports = getUsers;