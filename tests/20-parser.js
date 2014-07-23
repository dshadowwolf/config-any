var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    glob = require("glob"),
    util = require('util'),
    config = require('../lib/config');

var ext_list = [ 'conf', 'ini', 'json', 'xml', 'yml' ];

plan(5);
ext_list.map( function(d) { return [ "conf/conf", d ].join('.')  } ).forEach( function( elem, index, array ) {
    test( "Make sure loading works and we get what we expect", function(t) {
        t.plan(9)
	var c_arr;
	t.ok( c_arr = config.load_files( { files: [ elem ], use_ext: true } ), "load_files with use_ext works ["+elem+"]" )
	t.ok( Array.isArray(c_arr), "load_files returns an array" )
	var c = c_arr[0];
        t.ok( typeof c == 'object', "load_files array contains an object" )
        var c_t = (typeof c == 'object')?(Array.isArray(c)?'array':'hash'):'badness';
        t.is( c_t, 'hash', 'hashref' )
        var name = Object.keys(c)[0];
        var cfg = c[name];
        t.is( name, elem, 'filename matches' )
        var cfg_t = (typeof cfg == 'object')?(Array.isArray(cfg)?'array':'hash'):'badness';
        t.is( cfg_t, 'hash', 'hashref cfg' )
        t.is( cfg.name, 'TestApp', "appname parses" )
	t.is( cfg.Component['Controller::Foo'].foo, 'bar', "component->cntrlr->foo = bar" )
	t.is( cfg.Model['Model::Baz'].qux, 'xyzzy', "model->model::baz->qux = xyzzy" )
	t.end() } );
});
