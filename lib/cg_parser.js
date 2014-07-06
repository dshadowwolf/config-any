var fs = require('fs'),
    console = require('console'),
    util = require('util'),
    glob = require('glob'),
    tokens = require('./token_source.js');

function cfgparser() {
  this.blocks = [];
  this.curblock = {};
  this.bns = [];
  this.cbn = "";
  this.end_run = false;
  this.token_source = new tokens();
  this.end_cb = null;
  this.lower_case = false;

  var self = this;
  this.token_source.on('includereq', function(data) {
    var flist = glob.sync(data.toString());
    flist.forEach( function( elem, index, arr ) {
      var p = new cfgparser();
      p.open(elem);
      p.parse( function(d) {
        if( self.curblock[self.cbn] == undefined )
          self.curblock[self.cbn] = [];

        self.curblock[self.cbn].push( d );
      });
    });
  });
  this.token_source.on('tagopen', function(data) {
    if( JSON.stringify(self.curblock) != '{}' ) {
      self.blocks.push( self.curblock );
      self.bns.push(self.cbn);
    }
    self.curblock = {};
    self.cbn = self.lower_case?data['name'].toLowerCase():data['name'];
    if( data['specname'] != undefined ) {
      self.curblock['sn'] = self.lower_case?data['specname'].toLowerCase():data['specname'];
    }
  } );
  this.token_source.on('tagclose', function(data) {
    if( self.cbn != (self.lower_case?data.toLowerCase():data) )
      throw new Error("mis-nested blocks - found close tag for "+data+" when we needed to find "+self.cbn );

    var t, tp;
    if( self.blocks.length > 0 ) {
      t = self.blocks.pop();
      tp = self.bns.pop();
    } else {
      t = {};
      tp = "";
    }

    if( self.curblock['sn'] != undefined ) {
      var nbn = self.curblock['sn'];
      self.curblock['sn'] = undefined;
      delete self.curblock['sn'];
      var nb = self.curblock;
      var nbb = {};
      nbb[nbn] = nb;
      if( t[self.cbn] != undefined ) {
        t[self.cbn].push(nbb);
      } else {
        t[self.cbn] = [nbb];
      }
    } else {
      if( t[self.cbn] != undefined ) {
        t[self.cbn].push(self.curblock);
      } else {
        t[self.cbn] = [self.curblock];
      }
    }
    self.curblock = t;
    self.cbn = tp;
  } );

  this.token_source.on('keyvalue', function(data) {
    if( data['name'] == 'include' ) {
      var flist = glob.sync(data['value']);
      flist.forEach( function( elem, ind, arr ) {
        var p = new cfgparser();
        p.open(elem);
        p.parse( function(d) {
          self.curblock[elem] = d;
        });
      });
    } else {
      var dat;
      var nam;

      if( /^\[(.+)\]$/.test(data['value']) ) {
        dat = data['value'].match(/^\[(.*)\]$/)[1].split(',').map( function(d) { return d.trim(); } );
      } else if( /^\[\s*\]$/.test(data['value']) ) {
        dat = [];
      } else {
        dat = data['value'];
      }

      nam = self.lower_case?data['name'].toLowerCase():data['name'];
      if( self.curblock[nam] == undefined )
        self.curblock[nam] = [];

      self.curblock[data['name']].push( dat );
    }
  } );
  this.token_source.on('end', function() {
    self.end_run = true;
    self.curblock = self.replace_single_value_arrays();
    self.end_cb( self.curblock );
  } );

}

cfgparser.prototype.replace_single_value_arrays = function(d) {
  var w = (d==undefined)?this.curblock:d;

  for( var k in Object.keys( w ) ) {
    var key = Object.keys(w)[k];
    var val = w[key];

    if( w[key].length == 1 )
      w[key] = w[key][0];

    if( JSON.stringify(w[key]).charAt(0) == '{' &&
        JSON.stringify(w[key]) != '{}' )
      w[key] = this.replace_single_value_arrays(w[key]);

    if( Array.isArray(w[key]) ) {
      var self = this;
      w[key].map( function(d) {
        if( typeof d == 'object' )
          return self.replace_single_value_arrays(d);
        else
          return d;
      });
    }

  }
  return w;
};

cfgparser.prototype.open = function(filename) {
  try {
    this.token_source.open(filename);
  } catch(e) {
    throw e;
  }
};

cfgparser.prototype.setLowerCaseNames = function( bool ) {
  this.lower_case = bool;
};

cfgparser.prototype.parse = function( cb ) {
  var self = this;
  self.end_cb = cb;

  while( !self.end_run ) {
    self.token_source.next();
  }
};

module.exports = cfgparser;
