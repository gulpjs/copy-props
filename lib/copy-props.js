'use strict';

var setDeep = require('lodash.set');
var foreachProps = require('./foreach-props');

module.exports = function(src, dst, fromTo, converter, isReversed) {
  converter = converter || noop;

  if (isReversed) {
    var tmp = dst;
    dst = src;
    src = tmp;
  }

  var callback;
  if (!fromTo) {

    callback = function(value, keychain) {
      setDeep(dst, keychain, converter(value, keychain));
    };

  } else if (Array.isArray(fromTo)) {

    callback = function(value, keychain) {
      if (fromTo.indexOf(keychain) >= 0) {
        setDeep(dst, keychain, converter(value, keychain));
      }
    };

  } else if (!isReversed) {

    callback = function(value, keychain) {
      var dstKeychain = fromTo[keychain];
      if (dstKeychain) {
        setDeep(dst, dstKeychain, converter(value, keychain));
      }
    };

  } else {
    fromTo = invert(fromTo);

    callback = function(value, keychain) {
      var dstKeychainArray = fromTo[keychain];
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

function invert(fromTo) {
  var tmpMap = {};
  Object.keys(fromTo).forEach(function(key) {
    var val = fromTo[key];
    if (!tmpMap[val]) {
      tmpMap[val] = [];
    }
    tmpMap[val].push(key);
  });
  return tmpMap;
}
