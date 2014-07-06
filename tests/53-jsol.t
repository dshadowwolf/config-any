var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    glob = require("glob"),
    util = require('util'),
    config = require('../lib/config');

plan(2);

test( "test basic load and parse", function(t) {
    t.plan(2)
    var conf = config.jsol.loadFile("tests/conf/conf/conf.jsol");
    t.ok( conf != undefined, "loaded config" )
    t.is( conf['name'], 'TestApp', 'top-level lookup works' )
    t.end()
});

test("test invalid config", function(t) {
    t.plan(1)
    t.throws( function() {config.jsol.loadFile('tests/invalid/conf.jsol')}, undefined, 'throws an exception on an invalid file' )
    t.end()
});
