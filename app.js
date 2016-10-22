var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    pg = require('pg'),
    unittest = require('./test'),
    app = express(),
    port = 5000,
    googleApiKey='AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw';
// TODO MPE: set google api key restricted
// TODO what about the sf movie db key?

// TODO the title autocompletion doesn't work in FF

// TODO make the title input look nicer.

// TODO figure out how to make the map 100% width, 90% height.

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
        if(missing[i].locations == undefined){
            console.log('Could not find location for '+missing[i].title);
            continue;
        }
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
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        // locations eller address?
        var sql = 'insert into points (title, address, lat, lng) '+
                  'values ('+json.title+', '+json.locations+', '+
                  json.lat+', '+json.lng+')';
        client.query(sql, function(err, result) {
        done();
        if(err){ 
            console.error(err); 
            response.send("Error " + err); 
        }else{ 
            console.log('pg: ' + result.rows); 
        }
        });
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

function updateList(){
    DB = [];
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = 'select * from points';
        client.query(sql, function(err, result) {
        done();
        if(err){ 
            console.error(err); 
            response.send("Error " + err); 
        }else{ 
            for(row = 0; row < result.rows.length; row++){
                DB.push({
                    address: result.rows[row].address,
                    title: result.rows[row].title,
                    lat: result.rows[row].lat,
                    lng: result.rows[row].lng
                });
            }
            console.log('pg: ' + result.rows); 
        }
        });
    });
}

app.get('/', function(req, res){
    console.log('Update database.');
    updateDB();
    console.log('Update DB list');
    updateList();
    console.log('Serve index.ejs');
    res.render('index', {
        user: 'mads',
        apiKey: googleApiKey,
        DB: DB
    });
});

app.get('/test', function(req, res){
    res.render('test', {
        tests: unittest(addToDB, DB)
    });
});

app.listen(process.env.PORT || port);
console.log('listening to port ' + process.env.PORT +
            ' or ' + port);