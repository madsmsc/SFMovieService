# SFMovieService

# San Francisco Movie Service 
url: http://mysterious-dawn-70243.herokuapp.com/

## How it works
On every get request to the web server, update db:
make request to SF movie DB and for each movie,
check if it is in my DB,
if not, make request to google geocode api,
if the request fails or no location is returned,
ignore it and wait until next update.

The database is PostgreSQL and has the following structure.
Columns: title, address, lat, lng.
Unique index on the tuple (title, address).

## Scaling
If this service was to be used by many users,
then instead of updating the db on each request,
I would probably update it every hour or so.
Given the nature of the service and the number
of updates to SF db, that should be fine.

## Test
Instead of using a unit test framework
I made my own very simple version that shows each
unit test on the /test route.

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
* The API keys to SF DB and Googleapi are not yet restricted.
* Errors in the code are not handled very gracefully. They are just ignored and logged.
* The title autocompletion doesn't seem to work in FF. (HTML5)
* I couldn't figure out how to bind variables for function referenes, so I declared localMovie to be able to use it in the callback.
* Missing unit tests. And use a test framework like Mocha.
