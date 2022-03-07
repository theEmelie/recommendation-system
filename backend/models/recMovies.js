const readCSVfile = require('./readCSVfile');
const topUsers = require('./topUsers');

const recMovies = {
    /**
     * Get the recommended movies score by reading in the appropiate csv files, and call the necessary functions.
     * @param {res} res 
     * @param {req} req 
     */
    findRecMovies: function(res, req) {
        var path = require("path");
        var FileReader = require('filereader');
        var fapi = require('file-api');
        
        var reader = new FileReader();
        var File = fapi.File;

        var userId = req.query.userId;
        var sim = req.query.Similarity;
        
        reader.onload = function(e) {
            var userReader = new FileReader();
            var userRatings = [];
            var similarites = [];
            var weightedRatings = [];
            var movieName = "";

            rating = readCSVfile.readFile(e)
            userRatings = topUsers.getUserRatings(rating);
            similarites = topUsers.getSimilarities(userRatings, userId, sim);

            weightedRatings = recMovies.calculateWeightedRatings(rating, similarites, userId);

            userReader.onload = function(e) {
                result = readCSVfile.readFile(e);
                //console.log(result);
                // add the movie title result onto a new field (Movie) in the object array. 
                for (var i = 0; i < weightedRatings.length; i++) {
                    for (var j = 0; j < this.result.length; j++) {
                        if (result[j].MovieId == weightedRatings[i].MovieId) {
                            movieName = result[j].Title;
                            break;
                        }
                    }
                    // add the Movie field to be the first field
                    weightedRatings[i] = {'Movie': movieName, ...weightedRatings[i]}
                }
                // sort the array with the highest score at the top
                weightedRatings.sort((a, b) => (a.Score > b.Score) ? -1 : ((b.Score > a.Score) ? 1 : 0 ));
                return res.status(200).send(JSON.stringify(weightedRatings));
            }
            userReader.readAsText(new File(req.app.locals.movieDB));
        }
        reader.readAsText(new File(req.app.locals.ratingDB));
    },
    /**
     * Calculate the weighted score.
     * @param {rating} rating 
     * @param {similarites} similarites 
     * @returns the weighted score
     */
    calculateWeightedRatings: function(rating, similarites, userId) {
        var movieRatings = [];
        var weightedRatings = [];
        var sum = 0.0;
        var simSum = 0.0;
        var recScore = 0.0;
        var movieId = 0;
        var moviesWatched = [];

        // Watched movies for a user
        for (var i = 0; i < rating.length; i++) {
            if (rating[i].UserId == userId) {
                moviesWatched.push(rating[i].MovieId);
            }
        }
        //console.log(moviesWatched);
        
        // calculate the score by doing rating * similarities 
        for (var i = 0; i < rating.length; i++) {
            if (similarites[rating[i].UserId] >= 0) {
                // only calculate the score if the similarity is above or equal to 0.
                rating[i].Score = rating[i].Rating * similarites[rating[i].UserId];
            } else {
                rating[i].Score = 0;
            }
        }
        //console.log(rating);

        movieRatings = recMovies.getMovieRatings(rating);

        for (var i = 1; i < movieRatings.length; i++) {
            sum = 0.0;
            simSum = 0.0;
            movieId = 0;
            // iterate through the movie ratings and add it to the sum
            for (var j = 0; j < movieRatings[i].length; j++) {
                if (similarites[movieRatings[i][j].UserId] >= 0) {
                    sum += movieRatings[i][j].Score;
                    // only add in the similarity if its greater than 0 for pearson (it is always greater than 0 with euclidean)
                    simSum += parseFloat(similarites[movieRatings[i][j].UserId]);
                }
                movieId = movieRatings[i][j].MovieId;
            }

            // return 0 for score if no users with a non-negative similarity exist.
            if (simSum > 0) {
                recScore = (sum / simSum).toFixed(4); // round to 4 decimals
            } else {
                recScore = 0;
            }

            weightedRatings[i] = {"MovieId": movieId, "Score": recScore};
        }
        //console.log(weightedRatings);
        // remove watched movies from highest index
        for (var i = weightedRatings.length - 1; i >= 0; i--) {
            if (weightedRatings[i] != null) {
                // remove movie rating if movie id is in the moviesWatched array
                if (moviesWatched.includes(weightedRatings[i].MovieId)) {
                    weightedRatings.splice(i, 1);
                }
            }
        }
        weightedRatings.shift(); // remove first element from the array
        //console.log(weightedRatings);
        return weightedRatings;
    },
    /**
     * Get all the movie ratings from a user, and then push the needed fields into the user rating array.
     * @param {rating} rating 
     * @returns user rating
     */
    getMovieRatings: function(rating) {
        var userRatings = [];

        // loop through all movie ratings for each movie and sort into an array of array of objects
        // grouped by the movie id
        for (var i = 0; i < rating.length; i++) {
            if (userRatings[rating[i].MovieId] == null) {
                userRatings[rating[i].MovieId] = new Array();
            }
            userRatings[rating[i].MovieId].push({"UserId": rating[i].UserId, "MovieId": rating[i].MovieId, "Rating": rating[i].Rating, "Score": rating[i].Score});
        }
        return userRatings;
    },
};

module.exports = recMovies;