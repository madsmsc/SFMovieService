# SFMovieService

# San Francisco Movie Service 
url: http://mysterious-dawn-70243.herokuapp.com/

## How it works
On every get request to the web server, first serve the index page with a list of all the points saved in the database.
Then make a request to the SF movie api and for each movie, check if it is in my database.
If not, make a request to Google geocode api. If the request fails or no location is returned, ignore it and wait until next update.
If the request goes well, insert the row into my database.

The database is PostgreSQL and has the following structure.
Columns: title, address, lat, lng.
Unique index on the tuple (title, address).

## My experience
When I started this app, I didn't have a lot of experience with Nodejs and event driven frameworks in general. 
I found the callback structure a little cumbersome at first because all calls had to be chained and so the logic of the code 
was a bit challenging for me to follow, even though I do see the point of asynchronous calls for web apps.

I chose Javascript because I was told that using a language other than Java would be a good idea and I've always wanted to 
do something more with Nodejs than a simple hello world example.

The code was all written with Emacs and Visual Studio Code.

## Scaling
If this service was to be used by many users, then instead of updating the db on each request, I would probably update it every hour or so.
That should be fine, given the nature of the service and the number of updates to the SF movie api.

## Test
Instead of using a unit test framework I made my own very simple version that shows each unit test on the /test route.
Unfortunately I didn't have time to write any unit tests.

## Stack
* Node.js
* Expressjs
* ejs
* Request.
It is deployed on Heroku.

## Borrowed
* The embedded google map is from their tutorial.
* The map style is from their tutorial.
* partial function in app.js, used for passing function references with set parameters.

## Concerns
* The API keys to SF movie api and Google api are not yet restricted.
* Errors in the code are not handled very gracefully. They are just ignored and logged.
* The title autocompletion doesn't seem to work in FF. (HTML5)
* I couldn't figure out how to bind variables for function referenes, so I declared localMovie to be able to use it in the callback.
* Missing unit tests. And use a test framework like Mocha.
* Sql injection. I should sanitize the input from SF movie api.
* The Google api has an upper limit of 2500 requests per day. 
Throughout the development of this app, I've hit the limit multiple 
times but when the table stops being deleted due to development 
each row of the SF movie api should only need to be looked up once.
