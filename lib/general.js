/*
 * This is not as full-featured as Perls Config::General
 * as I do not have the time to directly translate that code
 * and am instead writing this to cover the most direct of
 * known use-cases.
 */

var fs = require('fs');
var console = require('console');
var util = require('util');
var Assert = require('assert');

var open_tag = /^(?:\s*)?<(?=[^/])(")?(.+)\s+(.*)?(")?>(?:\s*#.*)?$/;
var close_tag = /^(?:\s*)?<\/(")?(.+)?\s*(.*)?(")?>(?:\s*#.*)?$/;

var comment_open = /\/\*.*/;
var comment_close = /.*\*\//;
var sline_comment = /^(?:\s*)?#(?:.*)?$/;
// key-value pair where the value ends with the multi-line split marker
var key_value_ml = /^\s*([\w\d_]+?)\s+(?:=\s*)?(.+?)\s*\\$/;
// non-multiline key-value pairs with or without trailing comments
var key_value_sl = /^\s*(\S+?)\s+(?:=\s*)?(.+?)\s*(?:#.*)?$/;
var ml_continues = /^\s*(.+?)\s*\\$/;
var here_doc_open = /^(\S+?)\s+<<\s*(\S+?)\s*$/;

function genParser( filename, options ) {
  this.filename = (filename!=undefined)?filename:'';
  this.options = (options!=undefined)?options:{ LowerCaseNames: false };
  this.current_line = 0;
  this.data = [];
  this.open = function( filen ) {
    var raw;
    if( filen != undefined ) {
      raw = fs.readFileSync( filen, 'utf-8' );
    } else if( this.filename != '' ) {
      raw = fs.readFileSync( this.filename, 'utf-8' );
    } else {
      throw new Error( 'Config::General parser asked to load a file, but not given a filename' );
    }

    this.data = raw.split('\n').map( function( d ) { return d.trim(); } );
  };
  this.private = {};
  this.private.keyvalues = {};
  this.private.blocks = {};
  this.private.current_block = {};

  this.makeName = function( n ) {
    if(this.options.LowerCaseNames)
      return n.toLowerCase();
    else
      return n;
  };

  this.setData = function( bl, tn, tv ) {
    if( typeof bl[tn] == 'string' ) {
      var temp = JSON.parse( "[\""+bl[tn]+"\"]" );
      bl[tn] = temp;
      bl[tn].push(tv);
    } else if( Array.isArray(bl[tn]) ) {
      bl[tn].push(tv);
    } else if( typeof bl == 'object' ) {
      if( bl[tn] != undefined )
        bl[tn] = tv;
      else
        bl[tn] = tv;
    } else {
      throw new Error('something unexpected has happened');
    }
  };

  this.interpolate = function( d ) {
    var arr_m = /^\s*\[(.*)\]\s*$/;
    var mm, temp;

    if( arr_m.test(d) ) {
      temp = d.match(arr_m)[1].split(',');
      mm = temp.map( function( v ) {
        return v.trim();
      });
      return mm;
    } else {
      return d;
    }
  };

  this.read_tag_block = function() {
    var curline = this.data[this.current_line];
    var l = curline.match(open_tag);
    var block_name;
    var block_type;

    this.current_line++;

    if( l[1] == undefined ) { // we've not got quotes
      block_type = this.makeName(l[2]);
      if( l[3] == undefined ) { // no name
        block_name = block_type;
      } else {
        block_name = this.makeName(l[3]);
      }
    } else {
      block_name = this.makeName([ l[2], l[3] ].join(' '));
      block_type = block_name;
    }


    var t = {}, cb;

    if( block_type != block_name ) {
      cb = {};
      t[block_name] = cb;
    } else {
      t[block_type] = cb = {};
    }


    var cl = this.data[this.current_line];
    while( this.current_line < this.data.length ) {
      if( close_tag.test(cl) ) {
        var ctm = cl.match(close_tag);
        if( block_name == block_type ) {
          if( block_name == this.makeName( ctm[2] ) ) {
            this.current_line++;
            t[block_name] = cb;
            return [ block_type, cb ];
          } else if( ctm[1] != undefined &&
                     block_name == this.makeName( [ ctm[2], ctm[3] ].join(' ').trim() ) ) {
            this.current_line++;
            t[block_name] = cb;
            return [block_name,cb];
          }
        } else if( block_type == this.makeName(ctm[2]) ) {
          this.current_line++;
          t[block_name] = cb;
          return [ block_type, t ];
        } else {
          Assert.equal( true, true, "Mis-nested end-of-block found at line:"+curline );
        }
      } else if( open_tag.test(cl) ) {
        var tt = this.read_tag_block();
        this.setData( cb, this.makeName( tt[0] ), tt[1] );
      } else if( sline_comment.test( cl ) ) {
        this.current_line++;
      } else if( here_doc_open.test( cl ) ) {
        var nv = this.read_heredoc();
        var nn = this.makeName(nv[0]);
        var dat = this.interpolate( nv[1] );
        if( cb[nn] != undefined ) {
          this.setData( cb, nn, dat );
        } else {
          cb[nn] = dat;
        }
      } else if( key_value_ml.test( cl ) ) {
        var tml = this.read_continued_line();
        var nn = this.makeName(tml[0]);
        var dat = this.interpolate( tml[1] );
        if( cb[nn] != undefined )
          this.setData(cb, nn, dat);
        else
          cb[nn] = dat;

        this.current_line++;
      } else if( key_value_sl.test( cl ) ) {
        var tsl_m = cl.match( key_value_sl );
        var keyname = this.makeName(tsl_m[1]);
        var value = this.interpolate(tsl_m[2]);
        if( cb[keyname] != undefined )
          this.setData(cb, keyname, value );
        else
          cb[keyname] = value;

        this.current_line++;
      } else if( comment_open.test(cl)) {
        this.skip_comment_block();
      } else if( /^\s*$/.test(cl) ) {
        this.current_line++;
      } else {
        throw new Error('bad format');
      }
      cl = this.data[this.current_line];
    }

    t[block_type] = cb;
    return t;
  };

  this.skip_comment_block = function( ) {
    var cl = this.data[this.current_line];
    while( !comment_close.test(cl) ) {
      this.curline++;
      if( this.curline > this.data.length ) {
        throw new Error('bad format');
        console.info( "end of data inside a comment" );
        break;
      }
      cl = this.data[this.current_line];
    }

    if( comment_close.test(cl) ) curline++;
  };

  this.read_heredoc = function() {
    var hdm = this.data[this.current_line].match(here_doc_open);
    var ent_name = hdm[1];
    var close = new RegExp("^"+hdm[2]+"$");
    var bd = "";

    this.current_line++;
    while( this.current_line < this.data.length ) {
      var t = this.data[this.current_line];
      this.current_line++;
      if( close.test(t) ) {
        this.current_line++;
        return [ent_name,bd];
      } else {
        if( bd != "" ) bd += " ";
        bd += t.trim();
      }
    }

  };

  this.read_continued_line = function() {
    var kvm = this.data[this.current_line].match(key_value_ml);
    var name = kvm[1];
    var bd = [kvm[2]];

    this.current_line++;

    while( this.current_line < this.data.length ) {
      var t = this.data[this.current_line];
      this.current_line++;
      if( ml_continues.test(t) ) {
        bd.push(t.match(ml_continues)[1].trim());
      } else {
        bd.push(t.trim());
        this.current_line++;
        return [name,bd.join(' ')];
      }
    }
  };

  this.parse_it = function() {
    var cb  = {};
    var cl;

    while( this.current_line < this.data.length ) {
      cl = this.data[this.current_line];
      if( open_tag.test(cl) ) {
        var tt = this.read_tag_block();
        this.setData(cb, this.makeName(tt[0]), tt[1]);
      } else if( sline_comment.test( cl ) ) {
        this.current_line++;
      } else if( here_doc_open.test( cl ) ) {
        var nv = this.read_heredoc();
        var nn = this.makeName(nv[0]);
        var dat = this.interpolate( nv[1] );
        if( cb[nn] != undefined ) {
          this.setData( cb, nn, dat );
        } else {
          cb[nn] = dat;
        }
      } else if( key_value_ml.test( cl ) ) {
        var tml = this.read_continued_line();
        var nn = this.makeName(tml[0]);
        var dat = this.interpolate( tml[1] );
        if( cb[nn] != undefined )
          this.setData(cb, nn, dat);
        else
          cb[nn] = dat;

        this.current_line++;
      } else if( key_value_sl.test( cl ) ) {
        var tsl_m = cl.match( key_value_sl );
        var keyname = this.makeName(tsl_m[1]);
        var value = this.interpolate(tsl_m[2]);
        if( cb[keyname] != undefined )
          this.setData(cb, keyname, value );
        else
          cb[keyname] = value;

        this.current_line++;
      } else if( comment_open.test(cl)) {
        this.skip_comment_block();
      } else if( /^\s*$/.test(cl) ) {
        this.current_line++;
      } else {
        throw new Error('bad format');
      }
    }
    return cb;
  };
}

function loadFile( filename, options ) {
  if( filename == undefined )
    throw new Error( 'loadFile called without a filename' );

  var parser = new genParser( filename, options );
  parser.open();
  return parser.parse_it();
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return [ 'cfg', 'conf' ]; };
