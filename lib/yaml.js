var fs = require('fs'),
    yaml = require('libyaml'),
    cons = require('console'),
    exts = [ "yml", "yaml" ];

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a file to load");
    }

    var ydata;

    try {
	ydata = yaml.readFileSync( file );
    } catch( e ) {
	throw e;
    }

    return ydata[0];
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
