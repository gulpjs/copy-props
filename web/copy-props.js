(function (f) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = f();
  } else if (typeof define === 'function' && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== 'undefined') {
      g = window;
    } else if (typeof global !== 'undefined') {
      g = global;
    } else if (typeof self !== 'undefined') {
      g = self;
    } else {
      g = this;
    }
    g.copyProps = f();
  }
})(function () {
  var define, module, exports;
  return (function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = 'function' == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw ((a.code = 'MODULE_NOT_FOUND'), a);
          }
          var p = (n[i] = { exports: {} });
          e[i][0].call(
            p.exports,
            function (r) {
              var n = e[i][1][r];
              return o(n || r);
            },
            p,
            p.exports,
            r,
            e,
            n,
            t
          );
        }
        return n[i].exports;
      }
      for (
        var u = 'function' == typeof require && require, i = 0;
        i < t.length;
        i++
      )
        o(t[i]);
      return o;
    }
    return r;
  })()(
    {
      1: [
        function (require, module, exports) {
          'use strict';

          var eachProps = require('each-props');
          var isPlainObject = require('is-plain-object').isPlainObject;

          module.exports = function (src, dst, fromto, converter, reverse) {
            if (!isObject(src)) {
              src = {};
            }

            if (!isObject(dst)) {
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
              setParentEmptyObject(dst, fromto);
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
            delete nodeInfo.fromto[keyChain];

            if (!Array.isArray(dstKeyChains)) {
              dstKeyChains = [dstKeyChains];
            }

            var srcInfo = {
              keyChain: keyChain,
              value: value,
              key: nodeInfo.name,
              depth: nodeInfo.depth,
              parent: nodeInfo.parent,
            };

            for (var i = 0, n = dstKeyChains.length; i < n; i++) {
              setDeep(
                nodeInfo.dest,
                dstKeyChains[i],
                function (parent, key, depth) {
                  var dstInfo = {
                    keyChain: dstKeyChains[i],
                    value: parent[key],
                    key: key,
                    depth: depth,
                    parent: parent,
                  };

                  return nodeInfo.convert(srcInfo, dstInfo);
                }
              );
            }
          }

          function copyWithoutFromto(value, keyChain, nodeInfo) {
            if (isPlainObject(value)) {
              for (var k in value) {
                return;
              }
              setDeep(nodeInfo.dest, keyChain, newObject);
              return;
            }

            var srcInfo = {
              keyChain: keyChain,
              value: value,
              key: nodeInfo.name,
              depth: nodeInfo.depth,
              parent: nodeInfo.parent,
            };

            setDeep(nodeInfo.dest, keyChain, function (parent, key, depth) {
              var dstInfo = {
                keyChain: keyChain,
                value: parent[key],
                key: key,
                depth: depth,
                parent: parent,
              };

              return nodeInfo.convert(srcInfo, dstInfo);
            });
          }

          function newObject() {
            return {};
          }

          function noop(srcInfo) {
            return srcInfo.value;
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

          function setDeep(obj, keyChain, valueCreator) {
            _setDeep(obj, keyChain.split('.'), 1, valueCreator);
          }

          function _setDeep(obj, keyElems, depth, valueCreator) {
            var key = keyElems.shift();
            if (isPossibilityOfPrototypePollution(key)) {
              return;
            }

            if (!keyElems.length) {
              var value = valueCreator(obj, key, depth);
              if (value === undefined) {
                return;
              }
              if (isPlainObject(value)) {
                // value is always an empty object.
                if (isPlainObject(obj[key])) {
                  return;
                }
              }
              obj[key] = value;
              return;
            }

            if (!isPlainObject(obj[key])) {
              obj[key] = {};
            }
            _setDeep(obj[key], keyElems, depth + 1, valueCreator);
          }

          function setParentEmptyObject(obj, fromto) {
            for (var srcKeyChain in fromto) {
              var dstKeyChains = fromto[srcKeyChain];
              if (!Array.isArray(dstKeyChains)) {
                dstKeyChains = [dstKeyChains];
              }

              for (var i = 0, n = dstKeyChains.length; i < n; i++) {
                setDeep(obj, dstKeyChains[i], newUndefined);
              }
            }
          }

          function newUndefined() {
            return undefined;
          }

          function isObject(v) {
            return Object.prototype.toString.call(v) === '[object Object]';
          }

          function isPossibilityOfPrototypePollution(key) {
            return key === '__proto__' || key === 'constructor';
          }
        },
        { 'each-props': 4, 'is-plain-object': 8 },
      ],
      2: [
        function (require, module, exports) {
          /*!
           * array-each <https://github.com/jonschlinkert/array-each>
           *
           * Copyright (c) 2015, 2017, Jon Schlinkert.
           * Released under the MIT License.
           */

          'use strict';

          /**
           * Loop over each item in an array and call the given function on every element.
           *
           * ```js
           * each(['a', 'b', 'c'], function(ele) {
           *   return ele + ele;
           * });
           * //=> ['aa', 'bb', 'cc']
           *
           * each(['a', 'b', 'c'], function(ele, i) {
           *   return i + ele;
           * });
           * //=> ['0a', '1b', '2c']
           * ```
           *
           * @name each
           * @alias forEach
           * @param {Array} `array`
           * @param {Function} `fn`
           * @param {Object} `thisArg` (optional) pass a `thisArg` to be used as the context in which to call the function.
           * @return {undefined}
           * @api public
           */

          module.exports = function each(arr, cb, thisArg) {
            if (arr == null) return;

            var len = arr.length;
            var idx = -1;

            while (++idx < len) {
              var ele = arr[idx];
              if (cb.call(thisArg, ele, idx, arr) === false) {
                break;
              }
            }
          };
        },
        {},
      ],
      3: [
        function (require, module, exports) {
          /*!
           * array-slice <https://github.com/jonschlinkert/array-slice>
           *
           * Copyright (c) 2014-2017, Jon Schlinkert.
           * Released under the MIT License.
           */

          'use strict';

          module.exports = function slice(arr, start, end) {
            var len = arr.length;
            var range = [];

            start = idx(len, start);
            end = idx(len, end, len);

            while (start < end) {
              range.push(arr[start++]);
            }
            return range;
          };

          function idx(len, pos, end) {
            if (pos == null) {
              pos = end || 0;
            } else if (pos < 0) {
              pos = Math.max(len + pos, 0);
            } else {
              pos = Math.min(pos, len);
            }

            return pos;
          }
        },
        {},
      ],
      4: [
        function (require, module, exports) {
          'use strict';

          var isPlainObject = require('is-plain-object');
          var defaults = require('object.defaults/immutable');

          module.exports = function (obj, fn, opts) {
            if (!isObject(obj)) {
              return;
            }

            if (typeof fn !== 'function') {
              return;
            }

            if (!isPlainObject(opts)) {
              opts = {};
            }

            forEachChild(obj, '', fn, 0, opts);
          };

          function forEachChild(node, baseKey, fn, depth, opts) {
            var keys = Object.keys(node);
            if (typeof opts.sort === 'function') {
              var sortedKeys = opts.sort(keys);
              if (Array.isArray(sortedKeys)) {
                keys = sortedKeys;
              }
            }

            depth += 1;

            for (var i = 0, n = keys.length; i < n; i++) {
              var key = keys[i];
              var keyChain = baseKey + '.' + key;
              var value = node[key];

              var nodeInfo = defaults(opts);
              nodeInfo.name = key;
              nodeInfo.index = i;
              nodeInfo.count = n;
              nodeInfo.depth = depth;
              nodeInfo.parent = node;

              var notDigg = fn(value, keyChain.slice(1), nodeInfo);
              if (notDigg || !isPlainObject(value)) {
                continue;
              }

              forEachChild(value, keyChain, fn, depth, opts);
            }
          }

          function isObject(v) {
            return Object.prototype.toString.call(v) === '[object Object]';
          }
        },
        { 'is-plain-object': 5, 'object.defaults/immutable': 10 },
      ],
      5: [
        function (require, module, exports) {
          /*!
           * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
           *
           * Copyright (c) 2014-2017, Jon Schlinkert.
           * Released under the MIT License.
           */

          'use strict';

          var isObject = require('isobject');

          function isObjectObject(o) {
            return (
              isObject(o) === true &&
              Object.prototype.toString.call(o) === '[object Object]'
            );
          }

          module.exports = function isPlainObject(o) {
            var ctor, prot;

            if (isObjectObject(o) === false) return false;

            // If has modified constructor
            ctor = o.constructor;
            if (typeof ctor !== 'function') return false;

            // If has modified prototype
            prot = ctor.prototype;
            if (isObjectObject(prot) === false) return false;

            // If constructor does not have an Object-specific method
            if (prot.hasOwnProperty('isPrototypeOf') === false) {
              return false;
            }

            // Most likely a plain Object
            return true;
          };
        },
        { isobject: 9 },
      ],
      6: [
        function (require, module, exports) {
          /*!
           * for-in <https://github.com/jonschlinkert/for-in>
           *
           * Copyright (c) 2014-2017, Jon Schlinkert.
           * Released under the MIT License.
           */

          'use strict';

          module.exports = function forIn(obj, fn, thisArg) {
            for (var key in obj) {
              if (fn.call(thisArg, obj[key], key, obj) === false) {
                break;
              }
            }
          };
        },
        {},
      ],
      7: [
        function (require, module, exports) {
          /*!
           * for-own <https://github.com/jonschlinkert/for-own>
           *
           * Copyright (c) 2014-2017, Jon Schlinkert.
           * Released under the MIT License.
           */

          'use strict';

          var forIn = require('for-in');
          var hasOwn = Object.prototype.hasOwnProperty;

          module.exports = function forOwn(obj, fn, thisArg) {
            forIn(obj, function (val, key) {
              if (hasOwn.call(obj, key)) {
                return fn.call(thisArg, obj[key], key, obj);
              }
            });
          };
        },
        { 'for-in': 6 },
      ],
      8: [
        function (require, module, exports) {
          'use strict';

          Object.defineProperty(exports, '__esModule', { value: true });

          /*!
           * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
           *
           * Copyright (c) 2014-2017, Jon Schlinkert.
           * Released under the MIT License.
           */

          function isObject(o) {
            return Object.prototype.toString.call(o) === '[object Object]';
          }

          function isPlainObject(o) {
            var ctor, prot;

            if (isObject(o) === false) return false;

            // If has modified constructor
            ctor = o.constructor;
            if (ctor === undefined) return true;

            // If has modified prototype
            prot = ctor.prototype;
            if (isObject(prot) === false) return false;

            // If constructor does not have an Object-specific method
            if (prot.hasOwnProperty('isPrototypeOf') === false) {
              return false;
            }

            // Most likely a plain Object
            return true;
          }

          exports.isPlainObject = isPlainObject;
        },
        {},
      ],
      9: [
        function (require, module, exports) {
          /*!
           * isobject <https://github.com/jonschlinkert/isobject>
           *
           * Copyright (c) 2014-2017, Jon Schlinkert.
           * Released under the MIT License.
           */

          'use strict';

          module.exports = function isObject(val) {
            return (
              val != null &&
              typeof val === 'object' &&
              Array.isArray(val) === false
            );
          };
        },
        {},
      ],
      10: [
        function (require, module, exports) {
          'use strict';

          var slice = require('array-slice');

          var defaults = require('./mutable');

          /**
           * Extends an empty object with properties of one or
           * more additional `objects`
           *
           * @name .defaults.immutable
           * @param  {Object} `objects`
           * @return {Object}
           * @api public
           */

          module.exports = function immutableDefaults() {
            var args = slice(arguments);
            return defaults.apply(null, [{}].concat(args));
          };
        },
        { './mutable': 11, 'array-slice': 3 },
      ],
      11: [
        function (require, module, exports) {
          'use strict';

          var each = require('array-each');
          var slice = require('array-slice');
          var forOwn = require('for-own');
          var isObject = require('isobject');

          /**
           * Extends the `target` object with properties of one or
           * more additional `objects`
           *
           * @name .defaults
           * @param  {Object} `target` The target object. Pass an empty object to shallow clone.
           * @param  {Object} `objects`
           * @return {Object}
           * @api public
           */

          module.exports = function defaults(target, objects) {
            if (target == null) {
              return {};
            }

            each(slice(arguments, 1), function (obj) {
              if (isObject(obj)) {
                forOwn(obj, function (val, key) {
                  if (target[key] == null) {
                    target[key] = val;
                  }
                });
              }
            });

            return target;
          };
        },
        { 'array-each': 2, 'array-slice': 3, 'for-own': 7, isobject: 9 },
      ],
    },
    {},
    [1]
  )(1);
});
