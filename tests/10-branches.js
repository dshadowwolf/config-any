var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    glob = require("glob"),
    console = require('console'),
    config = require('../lib/config');


var testfiles = glob.sync("supported/conf.*");
var astems = testfiles.map(function(d) { return d.match(/(.*)\.(?:\w+)$/)[1] }).filter( function(e,p,s) { return s.indexOf(e) == p; });

function filt(data) {}

plan(2)

test("Check to make sure proper errors are returned", function(t) {
    t.plan(4)
    t.throws( function() {config.load_files()}, undefined, "load_files expects args")
    t.throws( function() {config.load_files({})}, undefined, "load_files expects files")
    t.throws( function() {config.load_stems()}, undefined, "load_stems expects args")
    t.throws( function() {config.load_stems({})}, undefined, "load_stems expects stems")
    t.end()
});

test("Test various loading scenarios", function(t) {
    t.plan(5)
    var c1 = config.load_files( { files: testfiles, use_ext: false } );
    t.ok( c1, "use_ext false works" )
    var c2 = config.load_files( { files: testfiles, use_ext: true } );
    t.ok( c2, "use_ext true works" )
    var c3 = config.load_files( { files: testfiles, use_ext: true, filter: filt } );
    t.ok( c3, "filter works" )
    t.throws( function(){config.load_files( { files: testfiles, use_ext: true, filter: function(data) { throw new Error("test"); } } ) }, undefined, "filter breaks" )
    var c4 = config.load_stems( { stems: astems, use_ext: true } );
    t.ok( c4, "load_stems with stems works" );
    t.end()
});
