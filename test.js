// TODO write test.ejs to show all unittests (green/red OK/FAIL)
// TODO write unit tests
// TODO move unit tests to different js file
// export the functions and maybe pass them the needed functions?

// TODO use mocha or something else.

function testAddToDB1(addToDB, DB){
    var test = {name: 'addToDBfields1', status: 'FAIL'};
    DB = [];
    var json = {locations: "A", title: "B"};
    var loc = {lat: 1, lng: 2};
    addToDB(json, loc);
    if(DB.length != 1) return test;
    if(DB[0].address != "A") return test;
    if(DB[0].title != "B") return test;
    if(DB[0].lat != 1) return test;
    if(DB[0].lng != 0) return test;
    test.success = 'OK';
    return test;
}

function testAddToDB2(addToDB, DB){
    var test = {name: 'addToDBelements2', status: 'FAIL'};
    DB = [];
    var json = {locations: "A", title: "B"};
    var loc = {lat: 1, lng: 2};
    addToDB(json, loc);
    addToDB(json, loc);
    addToDB(json, loc);
    if(DB.length == 3) return test;
    test.success = 'OK';
    return test;
}

function unittest(addToDB, DB){
    var tests = [];

    tests.push(testAddToDB1(addToDB, DB));
    tests.push(testAddToDB2(addToDB, DB));
    
    tests.push({name: '1', status: 'OK'});
    tests.push({name: '2', status: 'FAIL'});
    tests.push({name: '3', status: 'OK'});
    tests.push({name: '4', status: 'FAIL'});

    return tests;
}

module.exports = unittest