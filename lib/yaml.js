var fs = require('fs'),
    yaml = require('yaml-js'),
    cons = require('console'),
    exts = [ "yml", "yaml" ];

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a file to load");
    }

    var ydata = [];
    var base = fs.readFileSync( file, 'utf8' );
    try {
      ydata = yaml.load_all( base );
    } catch( e ) {
      throw e;
    }

  if( ydata.length == 1 )
    return ydata[0];
  else
    return ydata;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
