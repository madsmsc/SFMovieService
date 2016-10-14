var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    port = 5000,
    googleApiKey='AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw';

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var movieOptions = {
    url: 'https://data.sfgov.org/resource/wwmu-gmzc.json',
    headers: {
        'limit': '5000'
    }
}

function movieCallback(error, response, body){
    if(!error && response.statusCode == 200){
        var json = JSON.parse(body);
        console.log('json.length = '+json.length);
        console.log('10 first titles:');
        for(i = 0; i < 10; i++){
            console.log('title '+(i+1)+': '+json[i].title+
                        '\nlocation: '+json[i].locations);
        }
    }
}

var geoOptions = {
    url: 'https://maps.googleapis.com/maps/api/geocode/' +
         'json?address='+
         '1600+Amphitheatre+Parkway,+Mountain+View,+CA'+
         '&key='+googleApiKey
}

function geoCallback(error, response, body){
    if(!error && response.statusCode == 200){
        var json = JSON.parse(body);
        console.log(json);
        // var loc = json.results.geometry.location;
        // console.log('lat: '+loc.lat+', '+
        //             'lng: '+loc.lng);
    }
}

app.get('/', function(req, res) {
    request(geoOptions, geoCallback);
    request(movieOptions, movieCallback);
    res.render('index', {
        user: 'mads',
        apiKey: googleApiKey,
        loc: {lat: -25.363, lng: 131.044}
    });
});

app.listen(process.env.PORT || port);
console.log('listening to port ' + process.env.PORT +
            ' or ' + port);