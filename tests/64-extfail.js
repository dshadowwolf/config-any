var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');


test("test use_ext not finding a valid handler", function(t) {
  t.plan(1);
  t.throws( function() { var res = config.load_files(
    { files: [ 'conf/conf.extfail' ], use_ext: true } ); },
            undefined, 'error thrown' );
  t.end();
});
