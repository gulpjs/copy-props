'use strict';

/* eslint max-statements: "off" */

var inspect = require('util').inspect;
var isPlainObject = require('lodash.isplainobject');
var eachProps = require('each-props');
var setDeep = require('lodash.set');

module.exports = function(src, dst, fromto, converter, reverse) {
  if (!isPlainObject(src)) {
    throw new TypeError('The source needs to be a plain object: ' +
      inspect(src));
  }

  if (!isPlainObject(dst)) {
    throw new TypeError('The destination needs to be a plain object: ' +
      inspect(dst));
  }

  switch (typeof fromto) {
    case 'boolean': {
      reverse = fromto;
      converter = noop;
      fromto = undefined;
      break;
    }
    case 'function': {
      reverse = converter;
      converter = fromto;
      fromto = undefined;
      break;
    }
    default: {
      if (fromto == null) {
        /*fromto = fromto;*/
      } else if (isPlainObject(fromto)) {
        /*fromto = fromto;*/
      } else if (Array.isArray(fromto)) {
        fromto = arrayToMap(fromto);
      } else {
        throw new TypeError('The from-to map needs to be a plain object: ' +
          inspect(fromto));
      }
      break;
    }
  }

  switch (typeof converter) {
    case 'function': {
      break;
    }
    case 'boolean': {
      reverse = converter;
      converter = noop;
      break;
    }
    default: {
      if (converter == null) {
        converter = noop;
      } else {
        throw new TypeError('The converter needs to be a function: ' +
          inspect(converter));
      }
    }
  }

  switch (typeof reverse) {
    case 'boolean': {
      break;
    }
    default: {
      if (reverse == null) {
        reverse = false;
      } else {
        throw new TypeError('The reverse flag needs to be a boolean: ' +
          inspect(reverse));
      }
    }
  }

  return copyProps(src, dst, fromto, converter, reverse);
};

function noop(v) {
  return v;
}

function invert(fromto) {
  var inverted = {};
  var keys = Object.keys(fromto);
  for (var i = 0, n = keys.length; i < n; i++) {
    var key = keys[i];
    var val = fromto[key];
    if (!inverted[val]) {
      inverted[val] = [];
    }
    inverted[val].push(key);
  }
  return inverted;
}

function arrayToMap(array) {
  var map = {};
  for (var i = 0, n = array.length; i < n; i++) {
    map[array[i]] = array[i];
  }
  return map;
}

function copyProps(src, dst, fromto, converter, reverse) {
  if (reverse) {
    var tmp = src;
    src = dst;
    dst = tmp;
  }

  if (isPlainObject(fromto)) {
    if (reverse) {
      fromto = invert(fromto);

      eachProps(src, function(value, keychain, opts) {
        if (isPlainObject(value)) {
          return;
        }
        var dstKeychains = fromto[keychain];
        if (dstKeychains == null) {
          return;
        }
        for (var i = 0, n = dstKeychains.length; i < n; i++) {
          var dstValue = converter(value, keychain, dstKeychains[i], opts);
          if (dstValue === undefined) {
            return;
          }
          setDeep(dst, dstKeychains[i], dstValue);
        }
      });
      return dst;
    }

    eachProps(src, function(value, keychain, opts) {
      if (isPlainObject(value)) {
        return;
      }
      var dstKeychain = fromto[keychain];
      if (!dstKeychain) {
        return;
      }
      var dstValue = converter(value, keychain, dstKeychain, opts);
      if (dstValue === undefined) {
        return;
      }
      setDeep(dst, dstKeychain, dstValue);
    });
    return dst;

  } else {
    eachProps(src, function(value, keychain, opts) {
      if (isPlainObject(value)) {
        return;
      }
      var dstValue = converter(value, keychain, keychain, opts);
      if (dstValue === undefined) {
        return;
      }
      setDeep(dst, keychain, dstValue);
    });
    return dst;
  }
}
