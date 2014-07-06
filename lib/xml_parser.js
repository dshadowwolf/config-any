var sax = require('sax'),
    console = require('console'),
    fs = require('fs'),
    util = require('util');

var xmlparse = function() {
  this.blocks = new Array();
  this.bns = new Array();
  this.curblock = {};
  this.cbn = "";
};

xmlparse.prototype.parse = function( data, cb ) {
    if( typeof data != 'string' ) {
      cb(new Error('Data is not a string'), undefined );
      return;
    }

    var self = this;
    var parser = sax.parser(true, { trim: true, normalize: true } );

    parser.onerror = function(e) {
      self.error = true;
      cb(e, undefined);
    };

    parser.onopentag = function(node) {
      if( self.curblock != {} && self.curblock != undefined ) {
        self.blocks.push(self.curblock);
        self.curblock = {};
      }

      if( JSON.stringify(node.attributes) != "{}" )
        self.curblock['attrs'] = JSON.parse( JSON.stringify( node.attributes ) );
      else
        self.curblock = {};

      if( node.isSelfClosing ) {
        var t = self.blocks.pop();
        if( t[a] != undefined ) {
          t[a] = new Array( t[a] );
          t[a].push( self.curblock );
        } else {
          t[a] = self.curblock;
        }
        self.curblock = t;
      } else {
        self.bns.push(self.cbn);
        self.cbn = node.name;
      }
    };

    parser.ontext = function(t) {
      if( /^\s+$/m.test(t) == false ) {
        self.curblock['#TEXT'] = t;
      }
    };

    parser.onattribute = function(attr) {
      // leave blank for now...
    };

    parser.onclosetag = function(a) {
      if( self.cbn != a ) {
        cb(new Error("mis-nested closing tag?"), undefined);
      } else {
        var t = self.blocks.pop();
        var obn = self.bns.pop();
        if( t[a] != undefined ) {
          t[a] = new Array(t[a]);
          t[a].push(self.curblock);
        } else {
          t[a] = self.curblock;
        }
        self.curblock = t;
        self.cbn = obn;
      }
    };

    parser.onend = function() {
      if( self.blocks.length > 0 )
        cb(new Error("Malformatted input - unclosed tags at end of input"), undefined );

      self.coerce();
      cb(undefined, self.curblock);
    };

    parser.write(data).close();
  };

xmlparse.prototype.coerce = function()  {
  // scan for tags where the hash-ref contains a '#TEXT' key
  // then replace.
  var self = this;
  for( var k in Object.keys(self.curblock)) {
    var key = Object.keys(self.curblock)[k];
    var item = self.curblock[key];

    if( typeof item == 'object' ) {
      if( Object.keys(item).indexOf('#TEXT') > -1 ) {
        self.curblock[key] = item['#TEXT'].toString();
      } else if( Object.keys(item).length > 1 ) {
        self.blocks.push(self.curblock);
        self.curblock = item;
        self.coerce();
        self.curblock = self.blocks.pop();
      }
    }
  }

  for( var k in Object.keys(self.curblock) ) {
    var key = Object.keys(self.curblock)[k];
    var item = self.curblock[key];

    if( typeof item == 'object' ) {
      if( Object.keys(item).indexOf('attrs') != -1 ) {
        var xattr = item['attrs'];
        if( xattr['name'] != undefined ) {
          self.curblock[key]['attrs'] = undefined;
          var t = JSON.parse( "{ \""+xattr['name']+"\":"+JSON.stringify(item)+"}" );
          self.curblock[key] = t;
        } else {
          for( var ind in Object.keys(xattr) ) {
            var top = Object.keys(xattr)[ind];
            var titem = xattr[top];
            self.curblock[key][top] = titem;
          }
          self.curblock[key]['attrs'] = undefined;
          delete self.curblock[key]['attrs'];
        }
      }
    }
  }
  if( Object.keys(self.curblock).length == 1 ) {
    var k = Object.keys(self.curblock)[0];
    self.curblock = self.curblock[k];
  }
};


module.exports.parser = xmlparse;
