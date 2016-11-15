var chai = require('chai'),
    expect = chai.expect,
    controller = require('../controllers/controller'),
    points = require('../model/points');

describe('Controller', function(){
    it('rowInDB(point) empty doesnt have the row',
        function(){
            var point = new points.Point(
                'locations_123', 'title_123', 11, 22);
            controller.setDB([]);
            expect(controller.rowInDB(point)).to.equal(false);
        });

    it('rowInDB(point) not empty doesnt have the row',
        function(){
            var point = new points.Point(
                'locations_123', 'title_123', 12, 22);
            var point2 = new points.Point(
                'locations_123', 'title_1234', 12, 22);
            controller.setDB([point]);
            expect(controller.rowInDB(point2)).to.equal(false);
        });

    it('rowInDB(point) does have the row',
        function(){
            var point = new points.Point(
                'locations_123', 'title_123', 12, 22);
            controller.setDB([point]);
            expect(controller.rowInDB(point)).to.equal(true);
        });
});

describe('points', function(){
    it('addPointSql(point) simple version',
        function(){
            var point = new points.Point(
                'locations_123', 'title_123', 23.8, 18.2);
            var str = 'insert into points (title, address, lat, lng) '+
                      "values ('title_123', 'locations_123', 23.8, 18.2);"; 
            expect(points.addPointSql(point)).to.equal(str);
        });

    it('addPointSql(point) with spaces',
        function(){
            var point = new points.Point(
                'locations 123', 'title 123', 23.8, 18.2);
            var str = 'insert into points (title, address, lat, lng) '+
                      "values ('title 123', 'locations 123', 23.8, 18.2);"; 
            expect(points.addPointSql(point)).to.equal(str);
        });

    it('addPointSql(point) with fancy symbols',
        function(){
            var point = new points.Point(
                '?><{(--', '#(@!&#!<<\'', 23.8, 18.2);
            var str = 'insert into points (title, address, lat, lng) '+
                      "values ('#(@!&#!<<\'\'', '?><{(--', 23.8, 18.2);"; 
            expect(points.addPointSql(point)).to.equal(str);
        });
});
