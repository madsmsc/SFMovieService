var pg = require('pg'),
    exports = module.exports = {};

exports.getPoints = function(callback){
    var points = [];
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = 'select * from points;';
        if(client == null || client == undefined){
            console.log('servePoints: pg.connect failed');
            return points;
        }
        client.query(sql, function(err, result) {
            done();
            if(err){ 
                // console.log('getPoints err: '+err);  
            }else{ 
                // console.log('updateList: result.rows = ' + result.rows.length)
                for(var i = 0; i < result.rows.length; i++){
                    points.push({
                        address: result.rows[i].address,
                        title: result.rows[i].title,
                        lat: result.rows[i].lat,
                        lng: result.rows[i].lng
                    });
                    // console.log('new point: ' + point2string(points[i]));
                }
                callback(points);
            }
        });
    });
}

exports.addPointSql = function(json, loc){
    var title = "'"+json.title.split("'").join("''")+"'";
    var address = "'"+json.locations.split("'").join("''")+"'";
    var sql = 'insert into points (title, address, lat, lng) '+
                'values ('+title+', '+address+', '+
                loc.lat+', '+loc.lng+');';
    return sql;
}

exports.addPoint = function(json, loc){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = addPointSql(json, loc);
        // console.log('sql='+sql);
        if(client == null || client == undefined){
            console.log('addToDB: pg.connect failed');
            return;
        }
        client.query(sql, function(err, result) {
            done();
            if(err){ 
                console.log('addToDB err: '+err);
                console.log('sql='+sql); 
            }else{ 
                console.log('Added row to DB. '+json.title+
                        ' @ '+loc.lat+', '+loc.lng);
            }
        });
    });
}