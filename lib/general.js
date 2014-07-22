/*
 * This is not as full-featured as Perls Config::General
 * as I do not have the time to directly translate that code
 * and am instead writing this to cover the most direct of
 * known use-cases.
 */

var cgp = require('config-general');
var console = require('console');
var util = require('util');

module.exports.loadFile = function ( filename, options ) {
  var opts = options!==undefined?options:{LowerCaseNames: false};

  if( filename == undefined )
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
