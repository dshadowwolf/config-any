/*
 * This is not as full-featured as Perls Config::General
 * as I do not have the time to directly translate that code
 * and am instead writing this to cover the most direct of
 * known use-cases.
 */

var cgp = require('./cg_parser');
var console = require('console');
var util = require('util');

function loadFile( filename, options ) {
  if( filename == undefined )
    throw new Error( 'loadFile called without a filename' );

  try {
    var parser = new cgp();
    parser.open(filename);
    var res;
    parser.setLowerCaseNames( (options!=undefined)?((options['LowerCaseNames']!=undefined)?options['LowerCaseNames']:false):false );
    parser.parse( function(d) { res = d; } );
  } catch(e) {
    throw e;
  }

  return res;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return [ 'cfg', 'conf' ]; };
