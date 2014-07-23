var console = require('console'),
    util = require('util'),
    tap = require('tap'),
    test = tap.test,
    plan = tap.plan,
    config = require('../lib/config');

var file   = 'multi/conf.yml';
var expect = [
    {   name: 'TestApp',
        'Model': { 'Model::Baz': { qux: 'xyzzy' } }
    },
    {   name2: 'TestApp2',
        'Model2': { 'Model::Baz2': { qux2: 'xyzzy2' } }
    },
];

var results = config.yaml( file );
console.log( util.inspect(results,false,100,true));
test("test multi-stream YAML files", function(t) {
    t.plan(3);
    t.is( results.length, 2, '2 documents' );
    t.isDeeply( results, expect, 'structures ok' );

    var returnv = config.load_files( { use_ext: true, files: [ file ] } );
    var x2 = {};
    x2[file] = expect;
    t.isDeeply(returnv, [ x2 ], 'config-any structures ok' );
    t.end();
});
