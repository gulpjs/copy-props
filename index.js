'use strict';

var eachProps = require('each-props');
var isPlainObject = require('is-plain-object');

module.exports = function(src, dst, fromto, converter, reverse) {

  if (!isPlainObject(src)) {
    src = {};
  }

  if (!isPlainObject(dst)) {
    dst = {};
  }

  if (isPlainObject(fromto)) {
    fromto = onlyValueIsString(fromto);
  } else if (Array.isArray(fromto)) {
    fromto = arrayToObject(fromto);
  } else if (typeof fromto === 'boolean') {
    reverse = fromto;
    converter = noop;
    fromto = null;
  } else if (typeof fromto === 'function') {
    reverse = converter;
    converter = fromto;
    fromto = null;
  } else {
    fromto = null;
  }

  if (typeof converter !== 'function') {
    if (typeof converter === 'boolean') {
      reverse = converter;
      converter = noop;
    } else {
      converter = noop;
    }
  }

  if (typeof reverse !== 'boolean') {
    reverse = false;
  }

  if (reverse) {
    var tmp = src;
    src = dst;
    dst = tmp;

    if (fromto) {
      fromto = invert(fromto);
    }
  }

  var opts = {
    dest: dst,
    fromto: fromto,
    convert: converter,
  };

  if (fromto) {
    eachProps(src, copyWithFromto, opts);
  } else {
    eachProps(src, copyWithoutFromto, opts);
  }

  return dst;
};

function copyWithFromto(value, keyChain, nodeInfo) {
  if (isPlainObject(value)) {
    return;
  }

  var dstKeyChains = nodeInfo.fromto[keyChain];
  if (!dstKeyChains) {
    return;
  }

  if (!Array.isArray(dstKeyChains)) {
    dstKeyChains = [dstKeyChains];
  }

  for (var i = 0, n = dstKeyChains.length; i < n; i++) {
    var dstValue = nodeInfo.convert(value, keyChain, dstKeyChains[i]);
    if (dstValue !== undefined) {
      setDeep(nodeInfo.dest, dstKeyChains[i], dstValue);
    }
  }
}

function copyWithoutFromto(value, keyChain, nodeInfo) {
  if (isPlainObject(value)) {
    for (var k in value) {
      return;
    }
    setDeep(nodeInfo.dest, keyChain, {});
    return;
  }

  var dstValue = nodeInfo.convert(value, keyChain, keyChain);
  if (dstValue !== undefined) {
    setDeep(nodeInfo.dest, keyChain, dstValue);
  }
}

function noop(v) {
  return v;
}

function onlyValueIsString(obj) {
  var newObj = {};
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'string') {
      newObj[key] = val;
    }
  }
  return newObj;
}

function arrayToObject(arr) {
  var obj = {};
  for (var i = 0, n = arr.length; i < n; i++) {
    var elm = arr[i];
    if (typeof elm === 'string') {
      obj[elm] = elm;
    }
  }
  return obj;
}

function invert(fromto) {
  var inv = {};
  for (var key in fromto) {
    var val = fromto[key];
    if (!inv[val]) {
      inv[val] = [];
    }
    inv[val].push(key);
  }
  return inv;
}

function setDeep(obj, keyChain, value) {
  _setDeep(obj, keyChain.split('.'), value);
}

function _setDeep(obj, keyElems, value) {
  var key = keyElems.shift();
  if (!keyElems.length) {
    obj[key] = value;
    return;
  }

  if (!isPlainObject(obj[key])) {
    obj[key] = {};
  }
  _setDeep(obj[key], keyElems, value);
}
