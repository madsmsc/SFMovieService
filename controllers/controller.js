var request = require('request'),
    points = require('../model/points'),
    DB = [],
    // googleApiKey = 'AIzaSyCCZIN6vc_KXWGHQ99NfNbUx1FoXl6Ec9o';
    googleApiKey = 'AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw',
    exports = module.exports = {};

exports.setDB = function(points) {
    DB = points;
};

exports.getGoogleApi = function() {
    return 'https://maps.googleapis.com/maps/api/js?key='+
           googleApiKey + '&callback=initMap';
};

exports.movieCallback = function(error, response, body) {
    if(!error && response.statusCode == 200) {
        var movies = JSON.parse(body);
        console.log('Found ' + movies.length + ' SF movie api rows');
        var missing = [];
        for(var i = 0; i < movies.length; i++) {
            var point = new points.Point(
                movies[i].address, movies[i].title,
                movies[i].lat, movies[i].lng);
            if(!exports.rowInDB(point)) {
                // console.log(i+': Added movie to missing. '+
                //             movies[i].locations);
                missing.push(point);
            } else {
                // console.log(i+': Movie already in DB. '+movies[i].title);
            }
        }
        exports.getMissingLocations(missing);
    } else {
        // console.log('Call to SF movie api failed. ' + 
        //             'Error: ' + JSON.stringify(error));
    }
};

exports.getMissingLocations = function(missing) {
    // console.log('Missing movies in DB: '+missing.length);
    for(var i = 0; i < missing.length; i++) {
        if(missing[i].locations == undefined) {
            // console.log('Could not find location for '+missing[i].title);
            continue;
        }
        var add = missing[i].locations.split(' ').join('+');
        var options = {
            url: 'https://maps.googleapis.com/maps/api/geocode/' +
                    'json?address=' + add + '&key=' + googleApiKey,
        };
        if(missing[i] != undefined) {
            // console.log('adding movie: ' + missing[i]);
            request(options, exports.geoCallback.bind({point: missing[i]}));
        } else {
            // console.log('missing['+i+'] is undefined');
        }
    }
};

exports.geoCallback = function(error, response, body) {
    if(!error && response.statusCode == 200) {
        var result = JSON.parse(body).results[0];
        if(result == undefined){
            // console.log('Result from googleapi undefined');
            return;
        }
        this.point.setPos(result.geometry.location);
        // console.log('geo: lat='+loc.lat+', lng='+loc.lng);
        points.addPoint(this.point);
    } else {
        // console.log('Call to google api failed. ' +
        //             'Error: ' + JSON.stringify(error));
    }
};

exports.rowInDB = function(point) {
    for(var i = 0; i < DB.length; i++) {
        if(DB[i].address == point.address &&
           DB[i].title == point.title) {
            return true;
        }
    }
    return false;
};

exports.updateDB = function() {
    var movieOptions = {
        url: 'https://data.sfgov.org/resource/wwmu-gmzc.json',
        headers: {'limit': '5000'},
    };
    request(movieOptions, exports.movieCallback);
};
