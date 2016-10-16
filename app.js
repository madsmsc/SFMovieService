var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    port = 5000,
    googleApiKey='AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw';
// TODO MPE: set google api key restricted
// TODO what about the sf movie db key?

// TODO check out ways to make maps and forms to look really nice.
// class up the UI

// TODO move to actual database
// columns: title, address, lat, lng
var DB = [];

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function movieCallback(error, response, body){
    if(!error && response.statusCode == 200){
        var movies = JSON.parse(body);
        console.log('Found ' + movies.length + ' rows');
        var missing = [];
        for(i = 0; i < 0; i++){ // TODO  movies.length
            if(!rowInDB(movies[i])){
                // console.log(i+': Added movie to missing. '+movies[i].locations);
                missing.push(movies[i]);
            }
        }
        getMissingLocations(missing);
    }
    else{
        console.log('Call to SF movie api failed. ' + 
                    'Error: ' + JSON.stringify(error));
    }
}

function getMissingLocations(missing){
    // console.log('Missing movies in DB: '+missing.length);
    for(i = 0; i < missing.length; i++){
        if(missing[i].locations == undefined)
            continue; // no location for this movie - throw in log?
        var add = missing[i].locations.split(' ').join('+');
        var options = {
            url: 'https://maps.googleapis.com/maps/api/geocode/' +
                    'json?address=' + add + '&key=' + googleApiKey
        }
        request(options, geoCallback.bind({movie: missing[i]}));
    }
}

function geoCallback(error, response, body){
    if(!error && response.statusCode == 200){
        var result = JSON.parse(body).results[0];
        if(result == undefined){
            console.log('Result from googleapi undefined');
            return;
        }
        var loc = result.geometry.location;
        // console.log('geo: lat='+loc.lat+', lng='+loc.lng);
        addToDB(movie, loc);
    }
    else{
        console.log('Call to google api failed. ' + 
                    'Error: ' + JSON.stringify(error));
    }
}

function rowInDB(json){
    for(x = 0; x < DB.length; x++){
        if(DB[x].address == json.locations){
            // TODO THIS might have to be commented in again
         //&& DB[i].title == json.title){
            // console.log('Row found in DB.'+json.title);
            return true;
        }
    }
    return false;
}

function addToDB(json, loc){
    DB.push({
        address: json.locations,
        title: json.title,
        lat: loc.lat,
        lng: loc.lng
    });
    // console.log('Added row to DB. '+json.title+' @ '+loc.lat+', '+loc.lng);
}

function updateDB(){
    var movieOptions = {
        url: 'https://data.sfgov.org/resource/wwmu-gmzc.json',
        headers: {
            'limit': '5000'
            // SF movie api token
        }
    }
    request(movieOptions, movieCallback);
}

app.get('/', function(req, res){
    // TODO test data - remove this stuff and just use the DB
    DB = [];
    DB.push({ address: 'address', title: 'title 1', lat: 20, lng: 20 });
    DB.push({ address: 'address', title: 'title 2', lat: 15, lng: 20 });
    DB.push({ address: 'address', title: 'title 3', lat: 20, lng: 15 });
    DB.push({ address: 'address', title: 'title 4', lat: 19, lng: 18 });

    console.log('Update database.');
    updateDB();
    console.log('Serve index.ejs');
    res.render('index', {
        user: 'mads',
        apiKey: googleApiKey,
        DB: DB
    });
});

// TODO write unit tests
// TODO move unit tests to different js file
// export the functions and maybe pass them the needed functions?

function testAddToDB(){
    var test = {name: 'testAddToDB', status: ''};
    return test;
}

function unittest(){
    var tests = [];
    tests.push(testAddToDB());
    return tests;
};

app.get('/test', function(req, rest){
    res.render('test', {
        tests: unittest()
    });
});

app.listen(process.env.PORT || port);
console.log('listening to port ' + process.env.PORT +
            ' or ' + port);