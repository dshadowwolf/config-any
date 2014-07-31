/* jshint node: true */
var cgp = require('config-general');
var console = require('console');
var util = require('util');

/* we're going to make two assumptions about things - one, that
 * people want variable interpolation (including the environment)
 * and two: that people want the names in their files to have the
 * specific cases they have.
 */

var my_default_opts = {
    LowerCaseNames: false,
    InterPolateVars: true,
    InterPolateEnv: true
};

module.exports.loadFile = function ( filename, options ) {
  var opts = (options !== undefined)?options:my_default_opts;

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
