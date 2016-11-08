var chai = require('chai'),
    expect = chai.expect,
    controller = require('../controllers/controller'),
    pointDAO = require('../model/pointDAO');

describe('Controller', function(){
    it('json2string(point) should return null when given null', 
        function(){
            expect(controller.json2string(null)).to.equal(null); 
        });

    it('point2string(point) should handle floats', 
        function(){
            var point = {
                address: 'address_123',
                title: 'title_123',
                lat: -12.87, lng: 25.92
            };
            var str = 'title: title_123, '+
                      'address: address_123, '+
                      'lat: -12.87, lng: 25.92';
            expect(controller.point2string(point)).to.equal(str); 
        });

    it('json2string(point) should handle floats', 
        function(){
            var point = {
                locations: 'locations_123',
                title: 'title_123',
                lat: -12.87, lng: 25.92
            };
            var str = 'title: title_123, '+
                      'locations: locations_123, '+
                      'lat: -12.87, lng: 25.92';
            expect(controller.json2string(point)).to.equal(str); 
        });

    it('rowInDB(json) empty doesnt have the row',
        function(){
            var json = {
                locations: 'locations_123',
                title: 'title_123',
                lat: 11, lng: 22
            };
            controller.setDB([]);
            expect(controller.rowInDB(json)).to.equal(false);
        });

    it('rowInDB(json) not empty doesnt have the row',
        function(){
            var point = {
                address: 'locations_123',
                title: 'title_123',
                lat: 12, lng: 22
            };
            var json = {
                locations: 'locations_123',
                title: 'title_123',
                lat: 11, lng: 22
            };
            controller.setDB([]);
            expect(controller.rowInDB(json)).to.equal(false);
        });

    it('rowInDB(json) does have the row',
        function(){
            var point = {
                address: 'locations_123',
                title: 'title_123',
                lat: 11, lng: 22
            };
            var json = {
                locations: 'locations_123',
                title: 'title_123',
                lat: 11, lng: 22
            };
            controller.setDB([point]);
            expect(controller.rowInDB(json)).to.equal(true);
        });
});

describe('PointDAO', function(){
    it('addPointSql(json, loc) simple version',
        function(){
            var json = {title: 'title_123', locations: 'locations_123'};
            var loc = {lat: '23.8', lng: '18.2'};
            var str = 'insert into points (title, address, lat, lng) '+
                      "values ('title_123', 'locations_123', 23.8, 18.2);"; 
            expect(pointDAO.addPointSql(json, loc)).to.equal(str);
        });


    it('addPointSql(json, loc) with spaces',
        function(){
            var json = {title: 'title 123', locations: 'locations 123'};
            var loc = {lat: '23.8', lng: '18.2'};
            var str = 'insert into points (title, address, lat, lng) '+
                      "values ('title 123', 'locations 123', 23.8, 18.2);"; 
            expect(pointDAO.addPointSql(json, loc)).to.equal(str);
        });

    it('addPointSql(json, loc) with fancy symbols',
        function(){
            var json = {title: '#(@!&#!<<\'', locations: '?><{(--'};
            var loc = {lat: '23.8', lng: '18.2'};
            var str = 'insert into points (title, address, lat, lng) '+
                      "values ('#(@!&#!<<\'\'', '?><{(--', 23.8, 18.2);"; 
            expect(pointDAO.addPointSql(json, loc)).to.equal(str);
        });
});
