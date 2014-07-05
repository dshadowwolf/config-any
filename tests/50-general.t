var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

// plan(6);
plan(5); // this is temporary until I actually add the feature needed for the 'single element array' test to work

test("Test Config::General loader/parser", function(t) {
    var conf = config.general.loadFile( 'tests/conf/conf/conf.conf' );
    t.ok( conf )
    t.is( conf['name'], 'TestApp' )
    t.ok( conf['Component'] != undefined )
});

test("Test LowerCaseNames option", function(t) {
    var conf = config.general.loadFile( 'tests/conf/conf/conf.conf', { LowerCaseNames: true } );
    t.ok( conf['component'] != undefined )
});
/*
 * there are a number of features of Config::General that would be extremely difficult to port over
 * at this time. I will be working on implementing some of them, including the ability to directly
 * include arrays and things like the <<include [filename/directory/glob]>> directive, but for now
 * these features will have to wait.

test("Test extended data types", function(t) {
    var conf = config.general.loadFile( 'tests/conf/conf/single_element_arrayref.conf' );
    t.isDeeply( conf['foo'], ['bar'], "single element array" )
});
*/

test("Test invalid config", function(t) {
    t.throws( function() { config.general.loadFile('tests/invalid/conf.conf'); } )
});
