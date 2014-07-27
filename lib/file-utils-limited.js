var fs = require('fs'),
    Iconv = require('iconv').Iconv,
    charDet = require('node-icu-charset-detector');

function read_and_recode(filename) {
  var c = fs.readFileSync(filename);
  var charset = charDet.detectCharset(c);
  var ic = new Iconv(charset,'UTF-8');
  var b = ic.convert(c);
  return b.toString('utf8');
}

module.exports.getFile = read_and_recode;
