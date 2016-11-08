# SFMovieService

(San Francisco Movie Service)

URL: http://mysterious-dawn-70243.herokuapp.com/

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

## Stack
* Node.js
* Expressjs
* ejs
* Request.

It is deployed on Heroku.  
Structure is based on MVC.  
The routing is seperated from the logic (controllers).  
The domain layer is structured using a DAO/DTO.

## Borrowed
* The embedded google map is from their tutorial.  
* The map style is from their tutorial.  
* partial function in app.js, used for passing function 
references with set parameters.

## TODO
* The API key for the Google api is not yet restricted. It should be.
* Errors in the code are not handled very gracefully. 
They are just ignored and logged.
* The title autocompletion doesn't seem to work in FF. 
Maybe it just doesn't support some of the new HTML5 features.
* Sql injection. I should sanitize the input from SF movie api.
* Implement DTOs as well.
* Use stubs to do testing of DOA methods. Maybe use Sinon framework.

## Testing
The unittests are written and run using the mocha framework and
the chai framework for assertions.  
The output from running the tests should look something like the below:  
```    
$ mocha tests  

  Controller  
    √ json2string(point) should return null when given null    
    √ point2string(point) should handle floats  
    √ json2string(point) should handle floats  
    √ rowInDB(json) empty doesnt have the row  
    √ rowInDB(json) not empty doesnt have the row  
    √ rowInDB(json) does have the row  
  
  PointDAO  
    √ addPointSql(json, loc) simple version  
    √ addPointSql(json, loc) with spaces  
    √ addPointSql(json, loc) with fancy symbols  
  
  9 passing (29ms)
```