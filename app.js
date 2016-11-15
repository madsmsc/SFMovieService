var express = require('express'),
    bodyParser = require('body-parser'),
    controller = require('./controllers/controller'),
    points = require('./model/points'),
    app = express(),
    port = 5000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res){
    console.log('Serve index.ejs');
    points.getPoints(callback(res));
});

function callback(res){
    return function(pointList){
        res.render('index', {
            user: 'mads',
            apiKey: controller.getGoogleApiKey(),
            points: pointList
        });
        controller.setDB(pointList);
        console.log('Update database.');
        controller.updateDB();
    }
}

// process.on('uncaughtException', function (err) {
//   console.log('exception: ' + err);
// });

// setTimeout(function () {
//   console.log('timeout 500ms');
// }, 500);

app.listen(process.env.PORT || port);
console.log('listening to port ' + process.env.PORT +
            ' or ' + port);