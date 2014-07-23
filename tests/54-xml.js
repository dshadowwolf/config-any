var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    glob = require("glob"),
    util = require('util'),
    config = require('../lib/config');

plan(3);

test("basic parsing and loading", function(t) {
    var conf = config.xml('conf/conf.xml');
    t.plan(2)
    t.ok( conf != undefined, "loaded file" )
    t.is( conf['name'], 'TestApp', "top-level lookup works" )
    t.end()
});

test("test trying to load invalid xml", function(t) {
    t.plan(1)
    t.throws( function() { config.xml( "invalid/conf.xml" ) }, undefined, "throws an error on invalid xml" )
    t.end()
});

test("check loading multiple tags of the same type as an array", function(t) {
    var conf = config.xml('conf/conf_arrayref.xml');
    t.plan(2)
    t.ok( conf != undefined, "loaded fine" )
    t.ok( Array.isArray(conf['elements']), "multiple <elements> tags loaded as an array" )
    t.end()
});
