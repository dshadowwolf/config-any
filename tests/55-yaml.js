var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    glob = require("glob"),
    util = require('util'),
    config = require('../lib/config');


plan(2);

test("basic test", function(t) {
    t.plan(2);
    var config1 = config.yaml( 'conf/conf/conf.yml' );
    t.ok( config1 );
    t.is( config1.name, 'TestApp' );
    t.end()
});

test("invalid file", function(t) {
    var file = 'invalid/conf.yml';
    
    t.plan(1);
    t.throws( function() { var config2 = config.yaml( $file ); } );
    t.end();
});

