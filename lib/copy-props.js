'use strict';

var setDeep = require('lodash.set');
var foreachProps = require('./foreach-props');

module.exports = function(src, dst, map, converter, isReversed) {
  converter = converter || noop;

  if (isReversed) {
    var tmp = dst;
    dst = src;
    src = tmp;
  }

  var callback;
  if (!map) {

    callback = function(value, keychain) {
      setDeep(dst, keychain, converter(value, keychain));
    };

  } else if (!isReversed) {

    callback = function(value, keychain) {
      var dstKeychain = map[keychain];
      if (dstKeychain) {
        setDeep(dst, dstKeychain, converter(value, keychain));
      }
    };

  } else {
    map = invert(map);

    callback = function(value, keychain) {
      var dstKeychainArray = map[keychain];
      if (dstKeychainArray) {
        var val = converter(value, keychain);
        dstKeychainArray.forEach(function(dstKeychain) {
          setDeep(dst, dstKeychain, val);
        });
      }
    };
  }

  foreachProps(src, callback);
  return dst;
};

function noop(v) {
  return v;
}

function invert(map) {
  var tmpMap = {};
  Object.keys(map).forEach(function(key) {
    var val = map[key];
    if (!tmpMap[val]) {
      tmpMap[val] = [];
    }
    tmpMap[val].push(key);
  });
  return tmpMap;
}
