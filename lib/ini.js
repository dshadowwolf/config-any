var fs = require('fs'),
    ini = require('node-ini'),
    cons = require('console'),
    util = require('util'),
    exts = [ "ini" ];

ini.encoding = 'utf-8';

function fixup_data( input ) {
  var data, nbn, nbbn, temp, matches, rets, k, key;

  rets = {};

  if( Array.isArray(input) ) {
    cons.log(input);
    process.exit();
  }
  for( k in Object.keys(input) ) {
    key = Object.keys(input)[k];
    if( /^(\w+)\s+(.+)$/.test(key) ) {
      matches = key.match(/^(\w+)\s+(.+)$/);
      if( typeof input[key] == 'object' )
        data = fixup_data(input[key]);
      else
        data = input[key];
      nbn = matches[1];  // new block name
      nbbn = matches[2]; // new blocks block name
      temp = {};
      temp[nbbn] = data;
      rets[nbn] = temp;
    } else {
      if( typeof input[key] == 'object' ) {
        data = fixup_data(input[key]);
        rets[key] = data;
      } else {
        rets[key] = input[key];
      }
    }
  }
  return rets;
}

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a file to load");
    }

    var inidata;

    try {
      inidata = ini.parseSync( file );
    } catch( e ) {
      cons.log( "caught "+e );
	throw e;
    }
  var l = Object.keys(inidata).length;
  if( l > 0 ) {
    return fixup_data(inidata);
  } else {
    throw new Error("not an ini file");
  }
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
