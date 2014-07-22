var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

plan(4);

test("Test Config::General loader/parser", function(t) {
    var conf = config.general( 'conf/conf/conf.conf' );
    t.plan(3)
    t.isNot( conf, undefined, "file loaded" )
    t.is( conf['name'], 'TestApp', "name field defined" )
    t.isNot( conf['Component'], undefined, "Component block defined" )
    t.end()
});

test("Test LowerCaseNames option", function(t) {
    var conf2 = config.general( 'conf/conf/conf.conf', { LowerCaseNames: true } );
    t.plan(1)
    t.isNot( conf2.component, undefined, "Component block defined but lower-case" )
    t.end()
});

/*
 * there are a number of features of Config::General that would be extremely difficult to port over
 * at this time. I will be working on implementing some of them, including the ability to directly
 * include arrays and things like the <<include [filename/directory/glob]>> directive, but for now
 * these features will have to wait.
 */
test("Test extended data types", function(t) {
    var conf = config.general(
'conf/conf/single_element_arrayref.conf', { ForceArray: true } );
    t.plan(1)
    t.isDeeply( conf['foo'], ['bar'], "single element array" )
    t.end()
});


test("Test invalid config", function(t) {
    t.plan(1)
    t.throws( function() { config.general('invalid/conf.conf'); }, undefined, "invalid file causes an exception" )
    t.end()
});
