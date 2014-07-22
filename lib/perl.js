var fs = require('fs'), console = require('console'),
    exts = [ 'pl' ];

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a filename");
    }

    var fdata, jdata;

    try {
	fdata = fs.readFileSync( file, 'utf-8' );
	var t = fdata.replace(/\B\'([\w\s\d\(\)\-\'\:]+)\'\B/gm, '"$1"' ).replace(/\s*=>\s*/gm, ': ');
        if( /\w:/.test(t) )
          t = t.replace(/\s([\w\s\d\(\)\-]+)(\B|\:)/gm, function(match,p1,p2) { return '"'+p1.trim()+'"'+p2; });

      jdata = JSON.parse(t);
    } catch(e) {
	throw e;
    }

    return jdata;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
