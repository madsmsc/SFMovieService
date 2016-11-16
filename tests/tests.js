var chai = require('chai'),
    expect = chai.expect,
    controller = require('../controllers/controller'),
    points = require('../model/points');

describe('Controller', function(){
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

describe('points', function(){
    it('setPos(pos) simple version',
        function() {
            var point = new points.Point('a', 't', 0, 0);
            var pos = new points.Point('x', 'y', 1, 2);
            point.setPos(pos);
            var samePos = pos.lat == point.lat && pos.lng == point.lng;
            expect(samePos).to.equal(true);
        });

    it('setPos(pos) same address and title',
        function() {
            var point = new points.Point('a', 't', 0, 0);
            var pos = new points.Point('x', 'y', 34.1, -76.2);
            point.setPos(pos);
            var samePos = pos.lat == point.lat && pos.lng == point.lng;
            var original = point.address == 'a' && point.title == 't';
            expect(samePos && original).to.equal(true);
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
