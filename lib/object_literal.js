/* we use eval here in controlled conditions */
/*jshint evil:true */
var fs = require('fs'),
    exts = [ 'jsol', 'jsl' ];

function makeid( len ) {
  var leng = (len!=undefined)?len:5;
  var text = "Aa";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < (leng-2); i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a file to load");
    }

    var jdata;

    try {
      var tnn = ""+makeid(24)+" = ";
      var d = fs.readFileSync(file, 'utf8');
      if( d.charAt(0) != '{' ) {
        // this isn't a JSOL file
        throw new Error( 'not a javascript object literal' );
      }
      jdata = eval(tnn+d);
    } catch( e ) {
	throw e;
    }

    return jdata;
}

function extsr() { return exts; }

module.exports.loadFile = loadFile;
module.exports.extensions = extsr;
