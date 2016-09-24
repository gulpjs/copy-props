'use strict';

var setDeep = require('lodash.set');
var foreachProps = require('./foreach-props');

module.exports = function(src, dst, map, converter) {
  converter = converter || noop;

  var callback;
  if (map) {
    callback = function(value, keychain) {
      var dstKeychain = map[keychain];
      if (dstKeychain) {
        setDeep(dst, dstKeychain, converter(value, keychain));
      }
    };
  } else {
    callback = function(value, keychain) {
      setDeep(dst, keychain, converter(value, keychain));
    };
  }

  foreachProps(src, callback);
  return dst;
};

function noop(v) {
  return v;
}
