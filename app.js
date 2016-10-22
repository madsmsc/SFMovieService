var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    pg = require('pg'),
    unittest = require('./test'),
    app = express(),
    port = 5000,
    DB = [],
    googleApiKey='AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw';

// TODO MPE: set google api key restricted
// TODO what about the sf movie db key?

// TODO the title autocompletion doesn't work in FF

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function movieCallback(error, response, body){
    if(!error && response.statusCode == 200){
        var movies = JSON.parse(body);
        console.log('Found ' + movies.length + ' rows');
        var missing = [];
        for(i = 0; i < movies.length; i++){
            if(!rowInDB(movies[i])){
                console.log(i+': Added movie to missing. '+movies[i].locations);
                missing.push(movies[i]);
            }
            else{
                // console.log(i+': Movie already in DB. '+movies[i].title);
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
    console.log('Missing movies in DB: '+missing.length);
    for(i = 0; i < missing.length; i++){
        if(missing[i].locations == undefined){
            // console.log('Could not find location for '+missing[i].title);
            continue;
        }
        var add = missing[i].locations.split(' ').join('+');
        var options = {
            url: 'https://maps.googleapis.com/maps/api/geocode/' +
                    'json?address=' + add + '&key=' + googleApiKey
        }
        if(missing[i] != undefined){
            request(options, geoCallback.bind({movie: missing[i]}));
        }
    }
}

function geoCallback(error, response, body){
    if(!error && response.statusCode == 200){
        var result = JSON.parse(body).results[0];
        if(result == undefined){
            // console.log('Result from googleapi undefined');
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
    // for(x = 0; x < DB.length; x++){
    //     if(DB[x].address == json.locations){
    //         // TODO THIS might have to be commented in again
    //      //&& DB[i].title == json.title){
    //         // console.log('Row found in DB.'+json.title);
    //         return true;
    //     }
    // }
    return false;
}

function addToDB(json, loc){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = 'insert into points (title, address, lat, lng) '+
                  'values ('+json.title+', '+json.locations+', '+
                  json.lat+', '+json.lng+');';
        client.query(sql, function(err, result) {
        done();
        if(err){ 
            console.error(err); 
            response.send("Error " + err); 
        }else{ 
            console.log('added to pg: ' + result.rows.length); 
        }
        });
    });

    console.log('Added row to DB. '+json.title+' @ '+loc.lat+', '+loc.lng);
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

function getPoints(){
    var points = [];
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = 'select * from points;';
        client.query(sql, function(err, result) {
        done();
        if(err){ 
            console.error(err); 
            response.send("getPoints Error " + err); 
        }else{ 
            console.log('updateList: result.rows = ' + result.rows.length)
            for(row = 0; row < result.rows.length; row++){
                points.push({
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

    points.push({
        address: '1',
        title: '2',
        lat: '3',
        lng: '4'
    });
    return points;
}

app.get('/', function(req, res){
    console.log('Update database.');
    updateDB();
    console.log('Setting DB');
    DB = getPoints();
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

// http://stackoverflow.com/questions/4213351/make-node-js-not-exit-on-error
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

setTimeout(function () {
  console.log('This will still run.');
}, 500);

app.listen(process.env.PORT || port);
console.log('listening to port ' + process.env.PORT +
            ' or ' + port);