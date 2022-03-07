const readCSVfile = require('./readCSVfile');

const topUsers = {
    /**
     * Read in two files, call the similarity function to get the similarity result.
     * @param {res} res 
     * @param {req} req 
     */
    findUsers: function(res, req) {
        var path = require("path");
        var FileReader = require('filereader');
        var fapi = require('file-api');
        
        var reader = new FileReader();
        var File = fapi.File;
        
        var userId = req.query.userId; // access url parameters with userId
        var sim = req.query.Similarity; // access url parameters with Similarity
        var index = -1;

        reader.onload = function(e) {
            var userReader = new FileReader();

            rating = readCSVfile.readFile(e)
            //console.log(JSON.stringify(rating));
            similarityResult = topUsers.similarity(rating, userId, sim);
            
            userReader.onload = function(e) {
                result = readCSVfile.readFile(e);
                //console.log(JSON.stringify(result));
                //console.log(similarityResult);
                // add the similarity result onto a new field (Similarity) in the object array. 
                for (var i = 0; i < result.length; i++) {
                    result[i].Similarity = similarityResult[result[i].UserId];
                    if (result[i].UserId == userId) {
                        index = i;
                    }
                }
                // take the user (selected user) out of the result set
                if (index > -1) {
                    result.splice(index, 1);
                }
                
                // sort the array with the highest similarity at the top
                result.sort((a, b) => (a.Similarity > b.Similarity) ? -1 : ((b.Similarity > a.Similarity) ? 1 : 0 ));
                return res.status(200).send(JSON.stringify(result));
            }
            userReader.readAsText(new File(req.app.locals.userDB));
        }
        reader.readAsText(new File(req.app.locals.ratingDB));
    },
    /**
     * Call two functions to get the similarity for a user.
     * @param {rating} rating 
     * @param {userId} userId 
     * @param {sim} sim 
     * @returns the similarity
     */
    similarity: function(rating, userId, sim) {
        var userRatings = [];
        var similarity = [];
        
        userRatings = topUsers.getUserRatings(rating);
        similarity = topUsers.getSimilarities(userRatings, userId, sim);

        return similarity;
    },
    /**
     * Get all the movie ratings from a user
     * @param {rating} rating 
     * @returns the rating of a movie by a user
     */
    getUserRatings: function(rating) {
        var userRatings = [];
        // loop through all movie ratings for one user
        for (var i = 0; i < rating.length; i++) {
            if (userRatings[rating[i].UserId] == null) {
                // create a new array if there is no previous movie rating for a user
                userRatings[rating[i].UserId] = new Array();
            }
            userRatings[rating[i].UserId].push({"UserId": rating[i].UserId, "MovieId": rating[i].MovieId, "Rating": rating[i].Rating});
        }
        return userRatings;
    },
    /**
     * Return the similarity for a user with either the pearson or euclidean algorithm.
     * @param {userRatings} userRatings 
     * @param {userId} userId 
     * @param {sim} sim 
     * @returns the similarity
     */
    getSimilarities: function(userRatings, userId, sim) {
        var similarity = [];
        //console.log(sim);
        // iterate through all user ratings and then call either pearson or euclidean.
        for (var i = 1; i < userRatings.length; i++) {
            if (i != userId) {
                if (sim == "pearson") {
                    similarity[i] = topUsers.pearson(userRatings[userId], userRatings[i]).toFixed(4); // round to 4 decimals
                } else {
                    // call euclidean if anything but pearson is selected.
                    similarity[i] = topUsers.euclidean(userRatings[userId], userRatings[i]).toFixed(4); // round to 4 decimals
                }
            } else {
                // the similarity for the user itself is 1.0.
                similarity[i] = 1.0;
            }
        }
        return similarity;
    },
    /**
     * Calculate the euclidean score.
     * @param {userA} userA 
     * @param {userB} userB 
     * @returns the score
     */
    euclidean: function(userA, userB) {
        // Init variables
        var sim = 0
        // Counter for number of matching products
        var n = 0
        // Iterate over all rating combination
        for (var i = 0; i < userA.length; i++) {
            for (var j = 0; j < userB.length; j++) {
                if (userA[i].MovieId == userB[j].MovieId) {
                    sim += (userA[i].Rating - userB[j].Rating)**2;
                    n += 1;
                }
            }
        }
        // No ratings in common – return 0
        if (n == 0) {
            return 0;
        }
        // Return and calculate inverted score
        return (inv = 1 / (1 + sim));
    },
    /**
     * Calculate the pearson score.
     * @param {userA} userA 
     * @param {userB} userB 
     * @returns the score 
     */
    pearson: function(userA, userB) {
        // Init variables
        var sumA = 0.0;
        var sumB = 0.0;
        var sumAsq = 0.0;
        var sumBsq = 0.0;
        var pSum = 0.0;
        var num = 0.0;
        var den = 0.0;
        // Counter for number of matching products
        var n = 0;
        // Iterate over all rating combinations
        for (var i = 0; i < userA.length; i++) {
            for (var j = 0; j < userB.length; j++) {
                if (userA[i].MovieId == userB[j].MovieId) {
                    var raScore = parseFloat(userA[i].Rating);
                    var rbScore = parseFloat(userB[j].Rating);
                    
                    sumA += raScore; // sum of ratings for user A
                    sumB += rbScore; // sum of ratings for user B
                    sumAsq += raScore**2; // sum of squared ratings for A
                    sumBsq += rbScore**2; // sum of squared ratings for B
                    pSum +=  raScore * rbScore; // product of ratings from A and B
                    n += 1; // number of ratings in common
                }
            }
        }
        // No ratings in common – return 0
        if (n == 0) {
            return 0.0;
        }
        // Calculate Pearson
        if (n > 0) {
            var prod = (sumAsq - sumA**2 / n) * (sumBsq - sumB**2 / n);
            num = pSum - (sumA * sumB / n);
            if (prod < 0) {
                return 0;
            }
            den = Math.sqrt(prod);
            if (den > 0) {
                return num / den;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
};

module.exports = topUsers;