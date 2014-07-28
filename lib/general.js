/* jshint node: true */
var cgp = require('config-general');
var console = require('console');
var util = require('util');

module.exports.loadFile = function ( filename, options ) {
  var opts = (options !== undefined)?options:{LowerCaseNames: false};

  if( filename === undefined )
    throw new Error( 'loadFile called without a filename' );

  var parser;
  try {
    opts.ConfigFile = filename;
    parser = new cgp.parser(opts);
  } catch(e) {
    throw e;
  }

  return parser.getall();
};

module.exports.extensions = function() { return [ 'cfg', 'conf' ]; };
