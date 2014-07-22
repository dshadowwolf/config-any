var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    glob = require("glob"),
    util = require('util'),
    config = require('../lib/config');

var ext_list = [ 'conf', 'ini', 'json', 'xml', 'yml' ];

plan(5);
ext_list.map( function(d) { return [ "conf/conf/conf", d ].join('.')  } ).forEach( function( elem, index, array ) {
    test( "Make sure loading works and we get what we expect", function(t) {
        t.plan(6)
	var c_arr;
	t.ok( c_arr = config.load_files( { files: [ elem ], use_ext: true } ), "load_files with use_ext works ["+elem+"]" )
	t.ok( Array.isArray(c_arr), "load_files returns an array" )
	var c = c_arr[0];	
        t.ok( typeof c == 'object', "load_files array contains an object" )
	t.is( c['name'], 'TestApp', "appname parses" )
	t.is( c['Component']['Controller::Foo']['foo'], 'bar', "component->cntrlr->foo = bar" )
	t.is( c['Model']['Model::Baz']['qux'], 'xyzzy', "model->model::baz->qux = xyzzy" )
	t.end() } );
});
 
