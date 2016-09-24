'use strict';

var inspect = require('util').inspect;
var isPlainObject = require('lodash.isplainobject');
var copyProps = require('./lib/copy-props');

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

    return copyProps(src, dst, map);
  }

  return copyProps(src, dst);
};
