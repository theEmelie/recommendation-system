var usersForm  = document.getElementById("topUsersForm");
var moviesForm = document.getElementById("recMoviesForm");
var selectedUser = "";
var selectedSimilarity = "euclidean";
var numOfResults = -1;

document.getElementById("topUsersButton").addEventListener("click", function (e) {
    e.preventDefault();
    var url = 'http://localhost:3000/topUsers?userId=' + selectedUser + "&Similarity=" + selectedSimilarity;
    
    fetch(url, {
        method: 'get',
    })
    .then(response => response.json())
    .then(data => displayTable(data));
});

document.getElementById("recMoviesButton").addEventListener("click", function (e) {
    e.preventDefault();
    var url = 'http://localhost:3000/recMovies?userId=' + selectedUser + "&Similarity=" + selectedSimilarity;
    
    fetch(url, {
        method: 'get',
    })
    .then(response => response.json())
    .then(data => displayTable(data));
});

document.getElementById("users").addEventListener("change", function (e) {
    selectedUser = document.getElementById("users").value;
});

document.getElementById("results").addEventListener("change", function (e) {
    numOfResults = document.getElementById("results").value;
    //console.log(numOfResults);
});

document.getElementById("similarity").addEventListener("change", function (e) {
    selectedSimilarity = document.getElementById("similarity").value;
    //console.log(selectedSimilarity);
});

function displayTable(data) {
    var tBody = document.getElementById("movies-table").getElementsByTagName("tbody")[0];
    var tHead = document.getElementById("movies-table").getElementsByTagName("thead")[0];
    var keys = Object.keys(data[1]);
    var numOfRows = 0;
    //console.log(keys);
    //console.log(data);
   
    tBody.innerHTML = ""; // clear the table body
    tHead.innerHTML = ""; // clear the table head

    var row = tHead.insertRow(0);

    // iterate through all of the keys (headers) and add them onto the table.
    for (var i = 0; i < keys.length; i++) {
        var cell = document.createElement("th");
        var text = document.createTextNode(keys[i]);
        cell.appendChild(text);
        row.appendChild(cell);
    }

    if (numOfResults <= -1) {
        // if result text has not been set or is negative display all of the data
        numOfRows = data.length;
    } else if (numOfResults > data.length) {
        // if result text is greater than the data, display all of the data
        numOfRows = data.length;
    } else {
        // display the number of rows depending on the user input
        numOfRows = numOfResults;
    }

    // iterate through all of the rows a user has entered and insert them into the table.
    for (var i = 0; i < numOfRows; i++) {
        if (data[i] != null) {
            // add row into table with the movie title
            var row = tBody.insertRow(-1);
            //console.log(data[i]);
    
            for (var j = 0; j < keys.length; j++) {
                var cell = document.createElement("td");
                var text = document.createTextNode(data[i][keys[j]]);
                cell.appendChild(text);
                row.appendChild(cell);
            }
        }
    }
}

/* Make sure everything is loaded before displaying all users */
window.addEventListener("load", afterLoaded, false);

function afterLoaded() {
    populateUsers();
}

/**
 * fetch all users and call displayUsers(data) to display them.
 */
function populateUsers() {
    fetch('http://localhost:3000/users', {
        method: 'get',
    })
    .then(response => response.json())
    .then(data => displayUsers(data));
}

/**
 * Add option text and value for select to display all users.
 * @param {data} data 
 */
function displayUsers(data) {
    //console.log(data);
    var option;
    var select = document.getElementById("users");
    select.innerHTML = ""; // clear the table body

    for (let i = 0; i < data.length; i++) {
        option = document.createElement('option');
        option.text = data[i].Name;
        option.value = data[i].UserId;
        select.add(option);

        if (i == 0) {
            selectedUser = data[i].UserId;
        }
    }
}

