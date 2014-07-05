var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    glob = require("glob"),
    config = require('../lib/config');


var testfiles = glob.sync("tests/conf/test.*");
var astems = testfiles.map(function(d) { d.match(/(.*)\.(?:\w+)$/)[1] }).filter( function(e,p,s) { return s.indexOf(e) == p; });
function filt(data) {}

test("Check to make sure proper errors are returned", function(t) {
    t.throws( function() {config.load_files()}, { name: 'Error', message: "No files specified!" }, "load_files expects args")
    t.throws( function() {config.load_files({})}, { name: 'Error', message: "No files specified!" }, "load_files expects files")
    t.throws( function() {config.load_stems()}, { name: 'Error', message: "No files specified!" }, "load_stems expects args")
    t.throws( function() {config.load_stems({})}, { name: 'Error', message: "No files specified!" }, "load_stems expects stems")
    t.end()
});

test("Test various loading scenarios", function(t) {
    t.ok( config.load_files( { files: testfiles, use_ext: false } ), "use_ext false works" )
    t.ok( config.load_files( { files: testfiles, use_ext: true } ), "use_ext true works" )
    t.ok( config.load_files( { files: testfiles, use_ext: true, filter: filt } ), "filter works" )
    t.throws( function(){config.load_files( { files: testfiles, use_ext: true, filter: function(data) { throw new Error("test"); } } ) }, undefined, "filter breaks" )
    t.ok( config.load_stems( { stems: astems, use_ext: true } ), "load_stems with stems works" );
    t.end()
});
