var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

plan(5);


/****************************************
WRITE CUSTOM INI PARSER BECAUSE THE ONE WE ARE USING SUCKS BALLS
****************************************/




test("test system load/parse and contents for one possible format", function(t) {
    var cini = config.ini;
    var conf = cini.loadFile('tests/conf/conf/conf.ini');
    t.plan(3)
    t.isNot(conf,undefined,'config loaded')
    t.is(conf['name'], 'TestApp', "toplevel key lookup succeeded" )
    t.is(conf['Component']['Controller::Foo']['foo'], 'bar', 'nested lookup succeeded')
    t.end()
});

test("test system load/parse and contents for another possible format", function(t) {
    var cini2 = config.ini;
    var conf2 = cini2.loadFile('tests/conf/conf/conf2.ini');
    t.plan(3)
    t.isNot(conf2,undefined,'config loaded')
    t.is(conf2['name'], 'TestApp', "toplevel key lookup succeeded" )
    t.is(conf2['Controller::Foo']['foo'], 'bar', 'nested lookup succeeded')
    t.end()
});

test("test no-map-space mode", function(t) {
    var cini3 = config.ini;
    var conf3 = cini3.loadFile('tests/conf/conf/conf.ini', { 'MAP_TO_KEY':false} );
    t.plan(3)
    t.isNot(conf3,undefined,'config loaded (no-space mode)')
    t.is(conf3['name'], 'TestApp', "toplevel key lookup succeeded" )
    t.is(conf3['Component Controller::Foo']['foo'], 'bar', 'unnested lookup succeeded')
    t.end()
});

test("test subsections", function(t) {
    var cini4 = config.ini;
    var conf4 = cini4.loadFile('tests/conf/conf/subsections.ini');
    var want = { section1: { a: 1 , subsection1: { b: 2 }, subsection2: { c: 3 }}};
    t.plan(2)
    t.isNot(conf4,undefined,"config loaded")
    t.isDeeply(conf4,want, 'subsections parsed properly')
    t.end()
});

test("test invalid config", function(t) {
    t.plan(1)
    t.throws( function() { config.ini.loadFile('tests/invalid/conf.ini') }, undefined,"error thrown" );
    t.end()
});

    
