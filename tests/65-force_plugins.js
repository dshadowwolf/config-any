var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

var result = config.load_files(
             { files: [ 't/conf/conf.pl' ], force_plugins: [ 'perl' ] } );

test("test force_plugins some more", function(t) {
  t.plan(1);
  t.ok( result, 'config loaded' );
  t.end();
});
