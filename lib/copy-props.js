'use strict';

var setDeep = require('lodash.set');
var foreachProps = require('./foreach-props');

module.exports = function(src, dst, fromTo, converter, opts) {
  converter = converter || noop;

  opts = opts || {};
  if (opts.rejectNull !== false) {
    opts.rejectNull = true;
  }

  if (opts.reverse) {
    var tmp = dst;
    dst = src;
    src = tmp;
  }

  var callback;
  if (!fromTo) {
    callback = function(value, keychain) {
      var dstValue = converter(value, keychain);
      if (dstValue == null && opts.rejectNull) {
        return;
      }
      setDeep(dst, keychain, dstValue);
    };

  } else if (Array.isArray(fromTo)) {
    callback = function(value, keychain) {
      if (fromTo.indexOf(keychain) < 0) {
        return;
      }
      var dstValue = converter(value, keychain);
      if (dstValue == null && opts.rejectNull) {
        return;
      }
      setDeep(dst, keychain, dstValue);
    };

  } else if (!opts.reverse) {
    callback = function(value, keychain) {
      var dstKeychain = fromTo[keychain];
      if (dstKeychain == null) {
        return;
      }
      var dstValue = converter(value, keychain);
      if (dstValue == null && opts.rejectNull) {
        return;
      }
      setDeep(dst, dstKeychain, dstValue);
    };

  } else {
    fromTo = invert(fromTo);

    callback = function(value, keychain) {
      var dstKeychainArray = fromTo[keychain];
      if (dstKeychainArray == null) {
        return;
      }
      var dstValue = converter(value, keychain);
      if (dstValue == null && opts.rejectNull) {
        return;
      }
      dstKeychainArray.forEach(function(dstKeychain) {
        setDeep(dst, dstKeychain, dstValue);
      });
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

