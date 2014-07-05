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
//var liner = require('./liner');

var open_tag = /^(?:\s*)?<(?=[^/])(")?(.+?)(?:\s+(.*?)(?:))?(")?>(?:\s*#.*)?$/;
var close_tag = /^(?:\s*)?<\/(")?(.+?)(?:\s+(.*?)(?:))?(")?>(?:\s*#.*)?$/;

var comment_open = /\/\*.*/;
var comment_close = /.*\*\//;
var sline_comment = /^(?:\s*)?#(?:.*)?$/;
// key-value pair where the value ends with the multi-line split marker
var key_value_ml = /^\s*([\w\d_]+?)\s+(?:=\s*)?(.+?)\s*\\$/;
// non-multiline key-value pairs with or without trailing comments
var key_value_sl = /^\s*(\S+?)\s+(?:=\s*)?(.+?)\s*(?:#.*)?$/;
var ml_continues = /^\s*(.+?)\s*\\$/;
var here_doc_open = /^(\S+?)\s+<<\s*(\S+?)\s*$/;

var lcn = false;

var block = function(blockName) {
    this.id = blockName;
    this.cbStore = {};
    this.dataStore = {};
    this.hasChildBlocks = function() {
	if( this.cbStore.length > 0 ) {
	    return true;
	}
	return false;
    };
    this.appendChild = function(childBlock) {
	this.cbStore[lcn?childBlock.id.toLowerCase():childBlock.id] = childBlock;
    };
    this.addData = function(keyname,value) {
      var kn = lcn?keyname.toLowerCase():keyname;
	if( this.dataStore[kn] ) {
	    if( !Array.isArray(this.dataStore[kn]) ) {
		var tdsi = this.dataStore[kn];
		if( typeof tdsi === 'number' ) {
		    tdsi = tdsi.toString();
		}
		this.dataStore[keyname] = JSON.parse("[\""+tdsi+"\"]");
	    }
	    this.dataStore[kn].push(value);
	} else {
	    this.dataStore[kn] = value;
	}
    };
};

function createData( blockStore ) {
  var myData, k, t;

  myData = {};

  if( blockStore.dataStore != [] ) {
    for( var x in blockStore.dataStore ) {
      var t = blockStore.dataStore[x];
      var arr = [];
      var rv;
      if( /^\[.*\]$/.test(t) ) {
        var m = t.match(/^\[(.*)\]$/)[1];
        var items = m.split(',');
        items.forEach( function( el, ind, arx ) {
          arr.push( el.trim() );
        });
        rv = arr;
      } else {
        rv = t;
      }

      myData[x] = rv;
    }
  }

  if( blockStore.cbStore != [] ) {
    for( var x in blockStore.cbStore ) {
        myData[x] = createData(blockStore.cbStore[x]);
    }
  }

  return myData;
}

var input_data = [];
var curline = 0;

/*
 * parse routine:
 *   read line
 *   match against known line types
 *   call handler for block-types
 */

function load_and_prep_input( filename ) {
    var d = fs.readFileSync( filename, 'utf8' );
    input_data = d.split('\n');
}

function read_tag_block( ) {
  // first to make sure we haven't hit a strange error
  Assert.equal( open_tag.test( input_data[curline] ), true, "section parse called but section start not found" );
  // now for preliminary work.
  // when called the current line in the input pointed at should be an opening tag
  // syntax:
  //    <block_type block_name>
  //        OR:
  //    <"block_type">
  //        OR:
  //    <block_type>
  // in the first case, the 'key' in the config system will be the given name
  // in the other two, it will be the type, stripped of quotes.
  var l = input_data[curline].match(open_tag);
  var block_name;
  var block_type;
  curline++;
  if( l[1] == undefined ) { // we've not got quotes
    block_type = l[2];
    if( l[3] == undefined ) { // no name
      block_name = block_type;
    } else {
      block_name = l[3];
    }
  } else {
    block_name = [ l[2], l[3] ].join(' ');
    block_type = block_name;
  }


  var t, cb;

  if( block_type != block_name ) {
    t = new block(block_type);
    cb = new block(block_name);
    t.appendChild(cb);
  } else {
    t = cb = new block(block_name);
  }

  var cl;
  while( curline < input_data.length ) {
    cl = input_data[curline];
    if( close_tag.test(cl) ) {
      var ctm = cl.match(close_tag);

      if( block_name == block_type &&
          (block_name == ctm[2] ||
           block_name == [ ctm[2], ctm[3] ].join(' ')) ) {
        curline++;
        return t;
      } else if( block_type == ctm[2] ) {
        curline++;
        return t;
      } else {
        Assert.equal( true, true, "Mis-nested end-of-block found at line:"+curline );
      }
    } else if( open_tag.test(cl) ) {
      cb.appendChild(read_tag_block());
    } else if( sline_comment.test( cl ) ) {
      curline++;
    } else if( here_doc_open.test( cl ) ) {
      var nv = read_heredoc();
      cb.addData(nv[0],nv[1]);
    } else if( key_value_ml.test( cl ) ) {
      var tml = read_continued_line();
      cb.addData(tml[0],tml[1]);
      curline++;
    } else if( key_value_sl.test( cl ) ) {
      var tsl_m = cl.match( key_value_sl );
      var keyname = tsl_m[1];
      var value = tsl_m[2];
      cb.addData(keyname,value);
      curline++;
    } else if( comment_open.test(cl)) {
      skip_comment_block();
    } else if( /^\s*$/.test(cl) ) {
      curline++;
    } else {
      throw new Error('bad format');
    }
  }

  // sanity-check - did we run into the end-of-file while parsing a block ?
  Assert.notEqual( curline < input_data.length, false, "end of input while parsing block named "+ [block_type, block_name][(block_type!=block_name)?0:1] );
}

function skip_comment_block( ) {
  Assert.equal( comment_open.test(input_data[curline]), true, "told to skip comment block, start of comment block not found at:"+curline+": parser error?" );

  while( !comment_close.test(input_data[curline]) ) {
    curline++;
    if( curline > input_data.length ) {
      throw new Error('bad format');
      console.info( "end of data inside a comment" );
      break;
    }
  }

  if( comment_close.test(input_data[curline]) ) curline++;
}

function read_heredoc( ) {
  Assert.equal( here_doc_open.test(input_data[curline]), true, "called to read-in heredoc style entry starting at line:"+curline+": start of heredoc not found." );
  var hdm = input_data[curline].match(here_doc_open);
  var ent_name = hdm[1];
  var close = new RegExp("^"+hdm[2]+"$");
  var bd = "";

  curline++;
  while( curline < input_data.length ) {
    var t = input_data[curline];
    curline++;
    if( close.test(t) ) {
      curline++;
      return [ent_name,bd];
    } else {
      if( bd != "" ) bd += " ";
      bd += t.trim();
    }
  }

  Assert.notEqual( curline > input_data.length, true, "reached end of input while parsing a here-doc" );
}

function read_continued_line( ) {
  Assert.equal( key_value_ml.test(input_data[curline]), true, "called to parse a continued line, continued line not found" );

  var kvm = input_data[curline].match(key_value_ml);
  var name = kvm[1];
  var bd = [kvm[2]];

  curline++;

  while( curline < input_data.length ) {
    var t = input_data[curline];
    curline++;
    if( ml_continues.test(t) ) {
      bd.push(t.match(ml_continues)[1].trim());
    } else {
      bd.push(t.trim());
      curline++;
      return [name,bd.join(' ')];
    }
  }
  Assert.notEqual( curline > input_data.length, true, "reached end of input while parsing continued line" );
}

function parse_it() {
  var cb  = new block('-X-x-X-root-block-X-x-X-');
  var cl;

  while( curline < input_data.length ) {
    cl = input_data[curline];
    if( open_tag.test(cl) ) {
      cb.appendChild(read_tag_block());
    } else if( sline_comment.test( cl ) ) {
      curline++;
    } else if( here_doc_open.test( cl ) ) {
      var nv = read_heredoc();
      cb.addData(nv[0],nv[1]);
    } else if( key_value_ml.test( cl ) ) {
      var tml = read_continued_line();
      cb.addData(tml[0],tml[1]);
    } else if( key_value_sl.test( cl ) ) {
      var tsl_m = cl.match( key_value_sl );
      var keyname = tsl_m[1];
      var value = tsl_m[2];
      cb.addData(keyname,value);
      curline++;
    } else if( comment_open.test(cl)) {
      skip_comment_block();
    } else if( /^\s*$/.test(cl) ) {
      curline++;
    } else {
      throw new Error('bad format');
    }
  }
  return cb;
}

function loadFile( filename, options ) {
  lcn = false;
  if( options != undefined ) {
    lcn = options['LowerCaseNames']!=undefined?options['LowerCaseNames']:false;
  }

  curline = 0;
  input_data = [];

  load_and_prep_input(filename);
  return createData(parse_it());
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return [ 'cfg', 'conf' ]; };
