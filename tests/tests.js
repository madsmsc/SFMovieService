var chai = require('chai'),
    expect = chai.expect,
    requireNew = require('require-new');

describe('controller', function() {
    var controller, points;
    beforeEach(function(done) {
        controller = requireNew('../controllers/controller');
        points = requireNew('../model/points');
        done();
    });

    it('geoCallback(error, response, body) simple override',
        function() {
            controller.point = new points.Point(
                'a', 't', 8, 9);
            controller.getPoints().addPoint = function(pointToAdd) {
                expect(pointToAdd.lat).to.not.equal(8);
                expect(pointToAdd.lng).to.not.equal(9);
            };
            var res = {statusCode: 200};
            var body = '{"results": [{'+
                        '"geometry": {'+
                        '"location": {'+
                        '"lat": "10", "lng": "20"}}}]}';
            controller.geoCallback(null, res, body);
        });

    it('geoCallback(error, response, body) all values correct',
        function() {
            controller.point = new points.Point(
                'a', 't', 8, 9);
            controller.getPoints().addPoint = function(pointToAdd) {
                expect(pointToAdd.address).to.equal('a');
                expect(pointToAdd.title).to.equal('t');
                expect(pointToAdd.lat).to.equal('10');
                expect(pointToAdd.lng).to.equal('20');
            };
            var res = {statusCode: 200};
            var body = '{"results": [{'+
                        '"geometry": {'+
                        '"location": {'+
                        '"lat": "10", "lng": "20"}}}]}';
            controller.geoCallback(null, res, body);
        });

    it('movieCallback(error, response, body) simple length test',
        function() {
            controller.rowInDB = function(point) {
                return false;
            };
            controller.getMissingLocations = function(missing) {
                expect(missing.length).to.equal(1);
            };
            var res = {statusCode: 200};
            var body = '[{"address": "a", "title": "t",'+
                         '"lat": "10", "lng": "20"}]';
            controller.movieCallback(null, res, body);
        });

    it('movieCallback(error, response, body) test contents',
        function() {
            controller.rowInDB = function(point) {
                return false;
            };
            controller.getMissingLocations = function(missing) {
                expect(missing.length).to.equal(2);
                expect(missing[0].address).to.equal('a');
                expect(missing[0].title).to.equal('b');
                expect(missing[0].lat).to.equal('10');
                expect(missing[0].lng).to.equal('20');
                expect(missing[1].address).to.equal('c');
                expect(missing[1].title).to.equal('d');
                expect(missing[1].lat).to.equal('30');
                expect(missing[1].lng).to.equal('40');
            };
            var res = {statusCode: 200};
            var body = '[{"address": "a", "title": "b",'+
                         '"lat": "10", "lng": "20"},'+
                         '{"address": "c", "title": "d",'+
                         '"lat": "30", "lng": "40"}]';
            controller.movieCallback(null, res, body);
        });

    it('rowInDB(point) empty doesnt have the row',
        function() {
            var point = new points.Point(
                'locations_123', 'title_123', 11, 22);
            controller.setDB([]);
            expect(controller.rowInDB(point)).to.equal(false);
        });

    it('rowInDB(point) not empty doesnt have the row',
        function() {
            var point = new points.Point(
                'locations_123', 'title_123', 12, 22);
            var point2 = new points.Point(
                'locations_123', 'title_1234', 12, 22);
            controller.setDB([point]);
            expect(controller.rowInDB(point2)).to.equal(false);
        });

    it('rowInDB(point) does have the row',
        function() {
            var point = new points.Point(
                'locations_123', 'title_123', 12, 22);
            controller.setDB([point]);
            expect(controller.rowInDB(point)).to.equal(true);
        });
});

describe('points', function() {
    var points;
    beforeEach(function(done) {
        points = requireNew('../model/points');
        done();
    });

    it('setPos(pos) simple version',
        function() {
            var point = new points.Point('a', 't', 0, 0);
            var pos = new points.Point('x', 'y', 1, 2);
            point.setPos(pos);
            expect(pos.lat).to.equal(point.lat);
            expect(pos.lng).to.equal(point.lng);
        });

    it('setPos(pos) same address and title',
        function() {
            var point = new points.Point('a', 't', 0, 0);
            var pos = new points.Point('x', 'y', 34.1, -76.2);
            point.setPos(pos);
            expect(pos.lat).to.equal(point.lat);
            expect(pos.lng).to.equal(point.lng);
            expect(point.address).to.equal('a');
            expect(point.title).to.equal('t');
        });

    it('addPointSql(point) simple version',
        function() {
            var point = new points.Point(
                'locations_123', 'title_123', 23.8, 18.2);
            var str = 'insert into points (title, address, lat, lng) '+
                      'values (\'title_123\', \'locations_123\', 23.8, 18.2);';
            expect(points.addPointSql(point)).to.equal(str);
        });

    it('addPointSql(point) with spaces',
        function() {
            var point = new points.Point(
                'locations 123', 'title 123', 23.8, 18.2);
            var str = 'insert into points (title, address, lat, lng) '+
                      'values (\'title 123\', \'locations 123\', 23.8, 18.2);';
            expect(points.addPointSql(point)).to.equal(str);
        });

    it('addPointSql(point) with fancy symbols',
        function() {
            var point = new points.Point(
                '?><{(--', '#(@!&#!<<\'', 23.8, 18.2);
            var str = 'insert into points (title, address, lat, lng) '+
                      'values (\'#(@!&#!<<\'\'\', \'?><{(--\', 23.8, 18.2);';
            expect(points.addPointSql(point)).to.equal(str);
        });
});
