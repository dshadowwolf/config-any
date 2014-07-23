var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

test("test unsuppported formats", function(t) {
  t.plan(1);

  t.throws( function() { var result = config.load_files(
            { files: [ 'conf/conf.unsupported' ], use_ext: true } ); },
            undefined, 'error thrown' );

  t.end();
});
