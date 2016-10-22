# SFMovieService

# San Francisco Movie Service 


## How it works
On every get request to the web server, update db:
make request to SF movie DB and for each movie,
check if it is in my DB,
if not, make request to google geocode api,
if the request fails or no location is returned,
ignore it and wait until next update.

The database is PostgreSQL and has the following structure.
Columns: title, address, lat, lng.


## Scaling
If this service was to be used by many users,
then instead of updating the db on each request,
I would probably update it every hour or so.
Given the nature of the service and the number
of updates to SF db, that should be fie.


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


## Security
* The API keys to SF DB and Googleapi are not yet restricted.
* Compromising the SF DB or Googleapi could inject code into my json objects.


## Borrowed
* The embedded google map is from their tutorial.
* The map style is from their tutorial.


## Errors
Errors in the code are not handled very gracefully. 
They are just ignored and logged.