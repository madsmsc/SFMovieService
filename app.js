var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    port = 5000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var options = {
    url: 'https://data.sfgov.org/resource/wwmu-gmzc.json',
    headers: {
        'limit': '5000'
    }
}

function callback(error, response, body){
    if(!error && response.statusCode == 200){
        var json = JSON.parse(body);
        console.log("json.length = "+json.length);
        console.log("10 first titles:");
        for(i = 0; i < 10; i++){
            console.log('title '+(i+1)+': '+json[i].title+
                        '\nlocation: '+json[i].locations);
        }
    }
}

app.get('/', function(req, res) {
    request(options, callback);
    res.render('index', {
        user: "mads"
    });
});

app.listen(process.env.PORT || port);
console.log("listening to port " + process.env.PORT +
            "or " + port);