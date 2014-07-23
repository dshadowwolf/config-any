var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

var cfg_file = 'conf/conf.foo';

var conf = config.ini(cfg_file);
var struct;

plan(3);

test("test force_plugins", function(t) {
  var res = config.load_files( { files: [ cfg_file ],
                                 force_plugins: [ "ini" ] } );
  var first;
  t.plan(8);
  t.ok( res, "load file with parser forced" );
  t.ok( Array.isArray(res), "load_files returns an arrayref" );
  first = res[0];
  struct = first;
  t.ok( typeof first == 'object', "load_files arrayref contains a ref");
  var name = Object.keys(first)[0];
  var cfg = first[name];
  t.is( name, cfg_file, "filenames match" );
  var cfg_t = (typeof cfg == 'object')?(Array.isArray(cfg)?'array':'hash'):'badness';
  t.is( cfg_t, 'hash', 'hashref cfg');
  t.is( cfg.name, 'TestApp', 'appname parses' );
  t.is( cfg.Component['Controller::Foo'].foo, 'bar', 'component->cntrlr->foo = bar' );
  t.is( cfg.Model['Model::Baz'].qux, 'xyzzy', 'model->model::baz->qux = xyzzy' );
  t.end();
});

test("flatten_to_hash", function(t) {
  var res2 = config.load_files(
    { files: [ cfg_file ],
      force_plugins: [ 'ini' ],
      flatten_to_hash: true } );

  t.plan(4);
  t.ok( res2, 'load files with parser forced, flatten to hash' );
  t.ok( typeof res2 == 'object', 'load_files hashref contains a ref' );
  var res_t = (typeof res2 == 'object')?(Array.isArray(res2)?'array':'hash'):'badness';
  t.is( res_t, 'hash', 'hashref' );
  t.isDeeply( res2, struct, 'load_files returns a hashref (flatten_to_hash)' );
  t.end();
});

test("use_ext", function(t) {
  var res3 = config.load_files(
    { files: [ cfg_file ],
      force_plugins: [ 'ini' ],
      use_ext: true } );

  t.plan(1);
  t.ok( res3, "load file with parser forced" );
  t.end();
});
