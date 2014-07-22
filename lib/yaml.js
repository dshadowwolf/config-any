var fs = require('fs'),
    yaml = require('yaml-js'),
    cons = require('console'),
    exts = [ "yml", "yaml" ];

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a file to load");
    }

    var ydata;
    var base = fs.readFileSync( file );
    try {
	ydata = yaml.load( base.toString('utf8') );
    } catch( e ) {
	throw e;
    }

    return ydata;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
