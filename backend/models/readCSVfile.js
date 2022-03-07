const readCSVfile = {
    /**
     * Read a file and turn it into a json structure.
     * @param {e} e 
     * @returns 
     */
    readFile: function(e) {
        var csv = e.target.result;
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(";");

        // loop through each line in file and split the line where there is a semicolon.
        for (var i = 1; i < lines.length; i++) {
            if (lines[i].length > 0) {
                var obj = {};
                var currentline = lines[i].split(";");
        
                // add the splitted line into an object of arrays aka a json structure.
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j];
                }
                result.push(obj); // push the result
            }
        }
        return result;
    }
};

module.exports = readCSVfile;