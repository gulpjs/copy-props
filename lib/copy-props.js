'use strict';

var inspect = require('util').inspect;
var setDeep = require('lodash.set');
var isPlainObject = require('lodash.isplainobject');
var foreachProps = require('./foreach-props');

module.exports = function(src, dst, map, converter) {
  if (!isPlainObject(src)) {
    throw new TypeError('The 1st argument need to be a plain object: ' +
      inspect(src));
  }

  if (!isPlainObject(dst)) {
    throw new TypeError('The 2nd argument need to be a plain object: ' +
      inspect(dst));
  }

  if (converter) {
    if (typeof converter !== 'function') {
      throw new TypeError('The 4th argument need to be a function: ' +
        inspect(converter));
    }

    if (map != null && !isPlainObject(map)) {
      throw new TypeError('The 3th argument need to be a plain object: ' +
        inspect(map));
    }

    return copyProps(src, dst, map, converter);
  }

  if (map) {
    if (typeof map === 'function') {
      return copyProps(src, dst, undefined, map);
    }

    if (!isPlainObject(map)) {
      throw new TypeError('The 3th argument need to be a plain object or ' +
        'a function: ' + inspect(map));
    }

    return copyProps(src, dst, map, noop);
  }

  return copyProps(src, dst, undefined, noop);
};

function copyProps(src, dst, map, converter) {
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
}

function noop(v) {
  return v;
}
