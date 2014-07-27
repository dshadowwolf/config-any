var fs = require('fs'),
    fu = require('./file-utils-limited.js'),
    exts = [ 'json', 'jsn' ];

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a filename");
    }

    var fdata, jdata;

    try {
	fdata = fu.getFile( file);
	jdata = JSON.parse(fdata);
    } catch(e) {
	throw e;
    }

    return jdata;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
