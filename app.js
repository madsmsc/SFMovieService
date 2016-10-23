var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    pg = require('pg'),
    unittest = require('./test'),
    app = express(),
    port = 5000,
    DB = [],
    googleApiKey='AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw';

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function movieCallback(error, response, body){
    if(!error && response.statusCode == 200){
        var movies = JSON.parse(body);
        console.log('Found ' + movies.length + ' SF movie api rows');
        var missing = [];
        for(i = 0; i < movies.length; i++){
            if(!rowInDB(movies[i])){
                // console.log(i+': Added movie to missing. '+movies[i].locations);
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

var localMovie;

function getMissingLocations(missing){
    // console.log('Missing movies in DB: '+missing.length);
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
            // console.log('adding movie: ' + missing[i]);
            localMovie = missing[i];
            request(options, geoCallback);
        }
        else{
            console.log('missing['+i+'] is undefined');
        }
    }
}

function geoCallback(error, response, body){
    // console.log('geoCB [start]');
    if(!error && response.statusCode == 200){
        var result = JSON.parse(body).results[0];
        if(result == undefined){
            // console.log('Result from googleapi undefined');
            return;
        }
        var loc = result.geometry.location;
        // console.log('geo: lat='+loc.lat+', lng='+loc.lng);
        addToDB(localMovie, loc);
    }
    else{
        // console.log('Call to google api failed. ' + 
        //             'Error: ' + JSON.stringify(error));
    }
}

function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}

function rowInDB(json){
    for(x = 0; x < DB.length; x++){
        if(DB[x].address == json.locations &&
           DB[x].title == json.title){
            // console.log('point==json: ' + DB[x].address + ', ' +
            //             DB[x].title + ', ' + json.locations + ', ' +
            //             json.title);
            return true;
        }
    }
    return false;
}

function addToDB(json, loc){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var title = "'"+json.title.split("'").join("''")+"'";
        var address = "'"+json.locations.split("'").join("''")+"'";
        var sql = 'insert into points (title, address, lat, lng) '+
                  'values ('+title+', '+address+', '+
                  loc.lat+', '+loc.lng+');';
        console.log('sql='+sql);
        client.query(sql, function(err, result) {
            done();
            if(err){ 
                console.error('addToDB err: '+err); 
            }else{ 
                console.log('Added row to DB. '+json.title+
                        ' @ '+loc.lat+', '+loc.lng);
            }
        });
    });
}

function updateDB(){
    var movieOptions = {
        url: 'https://data.sfgov.org/resource/wwmu-gmzc.json',
        headers: {'limit': '5000'}
    }
    request(movieOptions, movieCallback);
}

function point2string(point){
    return 'title: ' + point.title + 
           ', address: ' + point.address + 
           ', lat: ' + point.lat + 
           ', lng: ' + point.lng;
}

function json2string(point){
    return 'title: ' + point.title + 
           ', locations: ' + point.locations + 
           ', lat: ' + point.lat + 
           ', lng: ' + point.lng;
}

function servePoints(res){
    var points = [];
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = 'select * from points;';
        client.query(sql, function(err, result) {
            done();
            if(err){ 
                console.log('getPoints err: '+err);  
            }else{ 
                console.log('updateList: result.rows = ' + result.rows.length)
                for(row = 0; row < result.rows.length; row++){
                    points.push({
                        address: result.rows[row].address,
                        title: result.rows[row].title,
                        lat: result.rows[row].lat,
                        lng: result.rows[row].lng
                    });
                    // console.log('new point: ' + point2string(points[row]));
                }
                DB = points;
                res.render('index', {
                    user: 'mads',
                    apiKey: googleApiKey,
                    DB: points
                });
            }
        });
    });
}

app.get('/', function(req, res){
    console.log('Serve index.ejs');
    servePoints(res);
    console.log('Update database.');
    updateDB();
});

app.get('/test', function(req, res){
    res.render('test', {
        tests: unittest()
    });
});

// process.on('uncaughtException', function (err) {
//   console.log('exception: ' + err);
// });

// setTimeout(function () {
//   console.log('timeout set');
// }, 500);

app.listen(process.env.PORT || port);
console.log('listening to port ' + process.env.PORT +
            ' or ' + port);