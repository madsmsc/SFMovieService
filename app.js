var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    pg = require('pg'),
    controller = require('./controllers/controller')
    app = express(),
    port = 5000,
    DB = [],
    // googleApiKey = 'AIzaSyCCZIN6vc_KXWGHQ99NfNbUx1FoXl6Ec9o';
    googleApiKey = 'AIzaSyCEBJe5Y7LfEhQ23FTLkm0FaRBDoOhtpRw';

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res){
    console.log('Serve index.ejs');
    pointDAO.getPoints(
        function(points){
            res.render('index', {
                user: 'mads',
                apiKey: googleApiKey,
                points: points
            });
        }
    );

    console.log('Update database.');
    controller.updateDB();
});

// process.on('uncaughtException', function (err) {
//   console.log('exception: ' + err);
// });

// setTimeout(function () {
//   console.log('timeout 500ms');
// }, 500);

app.listen(process.env.PORT || port);
console.log('listening to port ' + process.env.PORT +
            ' or ' + port);