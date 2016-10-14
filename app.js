var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    port = 5000;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.render('index', {
        user: "mads"
    });
});

app.listen(port);
console.log("listening to port " + port);