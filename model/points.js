var pg = require('pg'),
    exports = module.exports = {}; 

exports.Point = function(address, title, lat, lng) {
    this.address = address;
    this.title = title;
    this.lat = lat;
    this.lng = lng;
};

exports.Point.prototype.setPos = function(pos) {
    this.lat = pos.lat;
    this.lng = pos.lng;
};

exports.getPoints = function(callback) {
    var points = [];
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = 'select * from points;';
        if(client == null || client == undefined){
            console.log('servePoints: pg.connect failed');
            return points;
        }
        client.query(sql, function(err, result) {
            done();
            if(err) {
                // console.log('getPoints err: '+err);
            } else {
                // console.log('updateList: result.rows = ' +
                //             result.rows.length)
                for(var i = 0; i < result.rows.length; i++) {
                    var point = new exports.Point(
                        result.rows[i].address, result.rows[i].title,
                        result.rows[i].lat, result.rows[i].lng);
                    points.push(point);
                    // console.log('new point: ' + point2string(points[i]));
                }
                callback(points);
            }
        });
    });
};

exports.addPointSql = function(point) {
    var title = '\''+point.title.split('\'').join('\'\'')+'\'';
    var address = '\''+point.address.split('\'').join('\'\'')+'\'';
    var sql = 'insert into points (title, address, lat, lng) values ('+
              title+', '+address+', '+point.lat+', '+point.lng+');';
    return sql;
};

exports.addPoint = function(point) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var sql = exports.addPointSql(point);
        // console.log('sql='+sql);
        if(client == null || client == undefined) {
            console.log('addToDB: pg.connect failed');
            return;
        }
        client.query(sql, function(err, result){
            done();
            if(err) {
                console.log('addToDB err: '+err+'\nsql='+sql); 
            } else {
                console.log('Added row to DB. '+point.title+
                            ' @ '+point.lat+', '+point.lng+
                            '\nresult:'+result);
            }
        });
    });
};
