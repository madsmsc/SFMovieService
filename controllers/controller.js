var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    pg = require('pg'),
    pointDAO = require('../model/pointDAO'),
    DB = [],
    // googleApiKey = 'AIzaSyCCZIN6vc_KXWGHQ99NfNbUx1FoXl6Ec9o';
    googleApiKey = 'AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw',
    exports = module.exports = {};

exports.setDB = function(points){
    DB = points;
}

exports.getGoogleApiKey = function(){
    return googleApiKey;
}

exports.movieCallback = function(error, response, body){
    if(!error && response.statusCode == 200){
        var movies = JSON.parse(body);
        console.log('Found ' + movies.length + ' SF movie api rows');
        var missing = [];
        for(var i = 0; i < movies.length; i++){ 
            // console.log('movie: '+movies[i].title);
            if(!exports.rowInDB(movies[i])){
                // console.log(i+': Added movie to missing. '+movies[i].locations);
                missing.push(movies[i]);
            }
            else{
                // console.log(i+': Movie already in DB. '+movies[i].title);
            }
        }
        exports.getMissingLocations(missing);
    }
    else{
        // console.log('Call to SF movie api failed. ' + 
        //             'Error: ' + JSON.stringify(error));
    }
}

exports.getMissingLocations = function(missing){
    // console.log('Missing movies in DB: '+missing.length);
    for(var i = 0; i < missing.length; i++){
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
            request(options, exports.geoCallback.bind({movie: missing[i]}));
        }
        else{
            // console.log('missing['+i+'] is undefined');
        }
    }
}

exports.geoCallback = function(error, response, body){
    if(!error && response.statusCode == 200){
        var result = JSON.parse(body).results[0];
        if(result == undefined){
            // console.log('Result from googleapi undefined');
            return;
        }
        var loc = result.geometry.location;
        // console.log('geo: lat='+loc.lat+', lng='+loc.lng);
        pointDAO.addPoint(this.movie, loc);
    }
    else{
        // console.log('Call to google api failed. ' + 
        //             'Error: ' + JSON.stringify(error));
    }
}

exports.rowInDB = function(json){
    for(var i = 0; i < DB.length; i++){
        // console.log('db.address=' + DB[i].address + 
        //             ', db.title=' + DB[i].title + 
        //             ', json.locations=' + json.locations + 
        //             ', json.title=' + json.title);
        if(DB[i].address == json.locations &&
           DB[i].title == json.title){
            return true;
        }
    }
    return false;
}

exports.updateDB = function(){
    var movieOptions = {
        url: 'https://data.sfgov.org/resource/wwmu-gmzc.json',
        headers: {'limit': '5000'}
    }
    request(movieOptions, exports.movieCallback);
}

exports.point2string = function(point){
    return 'title: ' + point.title + 
           ', address: ' + point.address + 
           ', lat: ' + point.lat + 
           ', lng: ' + point.lng;
}

exports.json2string = function(point){
    if(point == null)
        return null;
    return 'title: ' + point.title + 
           ', locations: ' + point.locations + 
           ', lat: ' + point.lat + 
           ', lng: ' + point.lng;
}

function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}