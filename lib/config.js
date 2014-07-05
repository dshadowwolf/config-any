//var Assert = require('assert');
var console = require('console');
var path = require('path');
var util = require('util');
var fs = require('fs');

var ini = require("./ini.js"),
    xml = require("./xml.js"),
    json = require("./json.js"),
    jsol = require("./object_literal.js"),
    gen = require("./general.js"),
    yaml = require("./yaml.js");

function try_to_load( filename, use_ext ) {
  var ploads = [ini,xml,json,jsol,gen,yaml];

  if( use_ext ) {
    var ext = path.extname( filename ).slice(1,path.extname(filename).length);
    var l = '';

    ploads.forEach( function( i, e, a ) {
      if( i.extensions().indexOf( ext ) != -1 )
       l = i;
    });

    if( l != '' ) { return l.loadFile(filename); }

  } else {
    var rv;
    for( var i in ploads ) {
      try {
        rv = ploads[i].loadFile(filename);
        var l = Object.keys(rv).length;
        if( l > 0 ) {
          return rv;
        }
      } catch(e) {
        // do nothing
      }
    }

    return {};
  }
}

function loadFiles( options ) {
  var flist;
  var filt, use_ext = false, fth = false;
  var td = [];

  if( options == undefined ) {
    throw new Error("No files specified!");
  }

  if( typeof options == 'object' && options['files'] != undefined ) {
    flist = options['files'];
  } else {
    throw new Error("No files specified!");
  }

  if( options['filter'] != undefined ) filt = options['filter'];
  if( options['use_ext'] != undefined ) use_ext = options['use_ext'];
  if( options['flatten_to_hash'] != undefined ) fth = options['flatten_to_hash'];

  flist.forEach( function( i, e, a ) {
    if( fth ) {
      td[i] = try_to_load( i, use_ext );
    } else {
      td.push( try_to_load( i, use_ext ) );
    }
  } );

  if( filt != undefined ) {
    filt( td );
  }
  return td;
}

function loadStems( options ) {
  var flist;
  var nopts = { files: [], use_ext: false, flatten_to_hash: false, filter: undefined };

  if( options == undefined ) {
    throw new Error("No files specified!");
  }

  if( typeof options == 'object' && options['stems'] != undefined ) {
    flist = options['stems'];
  } else {
    throw new Error("No files specified!");
  }

  if( options['filter'] != undefined ) nopts['filter'] = options['filter'];
  if( options['use_ext'] != undefined ) nopts['use_ext'] = options['use_ext'];
  if( options['flatten_to_hash'] != undefined ) nopts['flatten_to_hash'] = options['flatten_to_hash'];

  var ex = extensions();
  for( var i in flist ) {
    for( var ins in ex ) {
      var fn = flist[i] + "." + ex[ins];
      if( fs.existsSync(fn) ) {
        nopts['files'].push(fn);
      }
    }
  }

  return load_files( nopts );
}

function extensions() {
  var exlist = [];

  ini.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  xml.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  json.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  jsol.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  gen.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  yaml.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  return exlist;
}

exports.ini = ini;
exports.xml = xml;
exports.json = json;
exports.jsol = jsol;
exports.general = gen;
exports.yaml = yaml;
exports.extensions = extensions;
exports.load_files = loadFiles;
exports.load_stems = loadStems;

/*
 * The "object literal" stores the data as straight javascript code.
 * Unless you actually have a *NEED* for the one feature it has over
 * JSON (it can have functions) I suggest it go unused.
 */
