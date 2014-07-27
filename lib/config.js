var console = require('console');
var path = require('path');
var util = require('util');
var fs = require('fs');

var ini = require("./ini.js"),
    xml = require("./xml.js"),
    json = require("./json.js"),
    gen = require("./general.js"),
    perl = require("./perl.js"),
    yaml = require("./yaml.js");

function try_force_loading( filename, plist ) {
  var res;
  var ldrs = [];
  plist.forEach( function( e, i, a ) {
    switch(e.toLowerCase()) {
      case 'ini':
      ldrs.push(ini.loadFile);
      break;
      case 'xml':
      ldrs.push(xml.loadFile);
      break;
      case 'general':
      case 'config::general':
      ldrs.push(gen.loadFile);
      break;
      case 'json':
      ldrs.push(json.loadFile);
      break;
      case 'perl':
      ldrs.push(perl.loadFile);
      break;
      case 'yaml':
      ldrs.push(yaml.loadFile);
      break;
      default:
      throw new Error("unknown loader "+e);
    }
  });

  var exres;

  ldrs.forEach( function( e, i, a ) {
    try {
      res = e(filename);
    } catch(ex) {
      // do nothing;
    }

    if( res !== undefined &&
        !/^\s+$/.test(res) &&
        res !== {} &&
        res !== [] &&
        exres === undefined )
      exres = new Object(res);
  });

  return exres===undefined?{}:exres;
}

function try_to_load( filename, use_ext, force_plugins ) {
  if( force_plugins !== undefined )
    return try_force_loading(filename, force_plugins);

  var ploads = [ini,xml,json,gen,perl,yaml];

  if( use_ext ) {
    var ext = path.extname( filename ).slice(1,path.extname(filename).length);
    var l = '';

    ploads.forEach( function( e, i, a ) {
      if( e.extensions().indexOf( ext ) != -1 )
       l = e;
    });

    if( l !== '' ) { return l.loadFile(filename); }

  } else {
    var rv;
    for( var i in ploads ) {
      try {
        rv = ploads[i].loadFile(filename);
        if( JSON.stringify(rv) != {} ) {
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
  var filt, use_ext = false, fth = false, fp;
  var td;

  if( options === undefined ) {
    throw new Error("No files specified!");
  }

  if( typeof options == 'object' && options.files !== undefined ) {
    flist = options.files;
  } else {
    throw new Error("No files specified!");
  }

  if( options.filter !== undefined ) filt = options.filter;
  if( options.use_ext !== undefined ) use_ext = options.use_ext;
  if( options.flatten_to_hash !== undefined ) fth = options.flatten_to_hash;
  if( options.force_plugins !== undefined) fp = options.force_plugins;

  var t = {};
  flist.forEach( function( e, i, a ) {
    if( fth === true ) {
      if( td === undefined ) {
        td = {};
      }
      td[e] = try_to_load( e, use_ext, fp );
      if( td[e] === undefined )
        throw new Error('no results - file '+e+' empty or unsupported');
    } else {
      if( td === undefined ) {
        td = [];
      }
      t[e] = try_to_load( e, use_ext, fp );
      if( t[e] === undefined )
        throw new Error('no results - file '+e+' empty or unsupported');
      td.push( new Object(t) );
      t = {};
    }
  });

  if( filt !== undefined ) {
    filt( td );
  }

  return td;
}

function loadStems( options ) {
  var flist;
  var nopts = { files: [], use_ext: false, flatten_to_hash: false, filter: undefined, force_plugins: [] };

  if( options === undefined ) {
    throw new Error("No files specified!");
  }

  if( typeof options == 'object' && options.stems !== undefined ) {
    flist = options.stems;
  } else {
    throw new Error("No files specified!");
  }

  if( options.filter !== undefined ) nopts.filter = options.filter;
  if( options.use_ext !== undefined ) nopts.use_ext = options.use_ext;
  if( options.flatten_to_hash !== undefined ) nopts.flatten_to_hash = options.flatten_to_hash;
  if( options.force_plugins !== undefined ) nopts.force_plugins = options.force_plugins;

  var ex = extensions();
  for( var i in flist ) {
    for( var ins in ex ) {
      var fn = flist[i] + "." + ex[ins];
      if( fs.existsSync(fn) ) {
        nopts.files.push(fn);
      }
    }
  }

  return loadFiles( nopts );
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

  gen.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  perl.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  yaml.extensions().forEach( function( i, e, a ) {
    exlist.push( i );
  });

  return exlist;
}

module.exports.ini = ini.loadFile;
module.exports.xml = xml.loadFile;
module.exports.json = json.loadFile;
module.exports.general = gen.loadFile;
module.exports.yaml = yaml.loadFile;
module.exports.perl = perl.loadFile;
module.exports.extensions = extensions;
module.exports.load_files = loadFiles;
module.exports.load_stems = loadStems;
