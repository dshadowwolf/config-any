var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

var file   = 'conf/conf/conf.pl';
var conf = config.perl( file );

test("test perl-format parse", function(t) {
  t.plan(3);
  t.ok( conf );
  t.is( conf.name, 'TestApp' );

  var config_load2 = config.perl( file );
  t.isDeeply( config_load2, conf, 'multiple loads of the same file' );
  t.end();
});

test("test invalid config", function(t) {
  var f = 'invalid/conf.pl';
  t.plan(1);
  t.throws( function() {   var conf2 = config.perl( f ); },undefined,'config load failed');
  t.end();
});
