var express = require('express'),
    bodyParser = require('body-parser'),
    controller = require('./controllers/controller'),
    pointDAO = require('./model/pointDAO'),
    app = express(),
    port = 5000;

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
                apiKey: controller.getGoogleApiKey(),
                points: points
            });
            controller.setDB(points);
            console.log('Update database.');
            controller.updateDB();
        }
    );
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