/* jshint node: true */
var fs = require('fs'),
    cons = require('console'),
    util = require('util'),
    fu = require('./file-utils-limited.js'),
    exts = [ "ini" ];

function fixup_data( input ) {
  var data, nbn, nbbn, temp, matches, rets, k, key;

  rets = {};

  if( Array.isArray(input) ) {
    cons.log(input);
    process.exit();
  }
  for( k in Object.keys(input) ) {
    key = Object.keys(input)[k];
    if( /^(\w+)\s+(.+)$/.test(key) ) {
      matches = key.match(/^(\w+)\s+(.+)$/);
      if( typeof input[key] == 'object' )
        data = fixup_data(input[key]);
      else
        data = input[key];
      nbn = matches[1];  // new block name
      nbbn = matches[2]; // new blocks block name
      temp = {};
      temp[nbbn] = data;
      if( rets[nbn] !== undefined ) {
        rets[nbn][nbbn] = data;
      } else {
        rets[nbn] = temp;
      }
    } else {
      if( typeof input[key] == 'object' ) {
        data = fixup_data(input[key]);
        rets[key] = data;
      } else {
        rets[key] = input[key];
      }
    }
  }
  return rets;
}

function Parser(file) {
  this.filename = (file!==undefined)?file:'';
  this.current_line = 0;
  this.data = [];
  this.options = { fix_data: true };
  this.current_section = 'toplevel';
  this.line_parse =  function() {
    if( this.current_line > this.data.length ) return false;
    var curline = this.data[this.current_line];
    this.current_line++;
      var m;
    if( /^\s*(\w+)\s*=\s*(.+)\s*$/.test(curline)) {
      m = curline.match(/^\s*(\w+)\s*=\s*(.+)\s*$/);
      return [ 'keyvalue', m[1], m[2] ];
    } else if( /^\s*\[(.*)(?:\s+(.*)?)\]\s*$/.test(curline) ) {
      m = curline.match(/^\s*\[(.*)(?:\s+(.*))\]\s*$/);
      return [ 'section', m[1], m[2] ];
    } else if( /^\s*\[(.*)\]\s*$/.test(curline) ) {
      m = curline.match(/^\s*\[(.*)\]\s*$/);
      return [ 'section', m[1], '' ];
    } else if( /^\s+$/.test(curline) || /^$/.test(curline) ) {
      return this.line_parse();
    } else {
      if( this.current_line > this.data.length ) return false;
      else throw new Error('Error parsing file - unrecognized line at line#'+ this.current_line + ' : '+curline);
    }
  };
  this.open = function(filen) {
    if( filen !== undefined ) {
      this.filename = filen;
      var f = fu.getFile( filen );
      this.data = f.split('\n');
    } else if( this.filename !== undefined ) {
      var fd = fu.getFile( this.filename );
      this.data = fd.split('\n');
    } else {
      throw new Error('Asked to load a file but not told which one!');
    }
  };
  this.parse = function() {
    var t;
    var d = {};

    t = this.line_parse();
    while( t !== false ) {
      if( t === undefined ) {
        cons.log( util.inspect( this, { depth: 100 } ) );
        process.exit();
      }
      switch( t[0] ) {
        case 'keyvalue':
        if( this.current_section == 'toplevel' )
          d[t[1]] = t[2];
        else
          d[this.current_section][t[1]] = t[2];
        break;
        case 'section':
        this.current_section = [ t[1], t[2] ].join(' ').trim();
        d[this.current_section] = {};
        break;
        default:
        throw new Error( 'unknown result in parse: '+t[0] );
      }
      t = this.line_parse();
    }
    if( this.options.fix_data )
      return fixup_data(d);
    else
      return d;
  };
}

function loadFile( file, options ) {
    if( !file ) {
	throw new Error("loadFile called without a file to load");
    }
  var mparser = new Parser(file);

  if( options !== undefined )
    mparser.options.fix_data = options.MAP_TO_KEY!==undefined?options.MAP_TO_KEY:true;

  var inidata;
  mparser.open();
  try {
    inidata = mparser.parse();
  } catch(e) {
    throw e;
  }
  return inidata;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
