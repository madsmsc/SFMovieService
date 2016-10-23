function unittest(){
    var tests = [];

    tests.push({name: 'test 1', status: 'OK'});
    tests.push({name: 'test 2', status: 'FAIL'});
    tests.push({name: 'test 3', status: 'OK'});
    tests.push({name: 'test 4', status: 'OK'});
    tests.push({name: 'test 5', status: 'FAIL'});

    return tests;
}

module.exports = unittest