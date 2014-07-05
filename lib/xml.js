var fs = require('fs'),
    xml2js = require('xml2js'),
    cons = require('console'),
    util = require('util'),
    exts = [ "xml" ];

function fixup_data( input ) {
  var data, nbn, nbbn, temp, matches, rets, i, j, key, k, temp2, temp3, temp4, work;


  rets = {};

  for( i in Object.keys(input) ) {
    key = Object.keys(input)[i];
    work = input[key][0];
    if( typeof work == 'string') rets[key] = work;
    else {
      temp = work;

      if( typeof temp == 'object' ) {
        if( Object.keys(temp).length > 1 && Object.keys(temp).indexOf('$') != -1 ) {
          nbn = temp['$']['name'];
          data = {};
          for( j in Object.keys(temp) ) {
            k = Object.keys(temp)[j];
            if( k != '$' ) {
              temp2 = temp[k];
              temp3 = {};
              if( typeof temp2[0] == 'string' ) {
                temp3[k] = temp2[0];
                data[nbn] = temp3;
                rets[key] = data;
              } else {
                temp3[k] = fixup_data(temp2);
                data[nbn] = temp3;
                rets[key] = data;
              }
            }
          }
        }
      } else {
        rets[key] = fixup_data(temp);
      }
    }
  }
  return rets;
}

function loadFile( file ) {
    if( !file ) {
	throw new Error("loadFile called without a file to load");
    }

    var fdata;
    var xmldata;
    var parser = new xml2js.Parser();

    try {
	fdata = fs.readFileSync( file, 'utf-8' );
	parser.parseString( fdata, function( err, result ) {
	    if(err) {
		throw(err);
            }
	    xmldata = result;
	});

      if( xmldata == {} ) {
        throw new Error("not an xml file");
      }

      if( Object.keys(xmldata).length == 1 ) {
        var t = Object.keys(xmldata)[0];
        var r = fixup_data(xmldata[t]);
        xmldata = r;
      }
    } catch( e ) {
	throw e;
    }

    return xmldata;
}

module.exports.loadFile = loadFile;
module.exports.extensions = function() { return exts; };
