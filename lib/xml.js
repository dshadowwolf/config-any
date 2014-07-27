var fs = require('fs'),
    xmlp = require('./xml_parser.js'),
    cons = require('console'),
    util = require('util'),
    fu = require('./file-utils-limited.js'),
    exts = [ "xml" ];


function loadFile( filename ) {
  if( !filename ) {
    throw new Error("loadFile called without a file to load");
  }

  var xmldata;
  var parser = new xmlp.parser();
  var filedata;

  try {
    if( typeof filename != 'string' )
      throw new Error('filename passed in: '+filename+' is not a string!');

    filedata = fu.getFile( filename.toString() );
    parser.parse( filedata, function( err, data ) {
      if( err !== undefined )
        throw err;
      else if( data !== undefined )
        xmldata = data;
    });

  } catch( e ) {
    throw e;
  }

  return xmldata;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
