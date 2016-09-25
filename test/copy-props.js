'use strict';

var assert = require('assert');
var testrun = require('testrun').mocha;
var assign = require('lodash.assign');
var copyProps = require('../');

function testfn(testcase) {
  var src = testcase.src;
  var dst = testcase.dst;
  var srcBak = assign({}, testcase.src);
  var dstBak = assign({}, testcase.dst);

  var ret = copyProps(testcase.src, testcase.dst, testcase.map, testcase.fn,
    testcase.rev);

  assert.strictEqual(src, testcase.src);
  assert.strictEqual(dst, testcase.dst);

  if (testcase.rev === true ||
      testcase.fn  === true ||
      testcase.map === true) {
    assert.strictEqual(ret, testcase.src);
    assert.deepEqual(dst, dstBak);
  } else {
    assert.strictEqual(ret, testcase.dst);
    assert.deepEqual(src, srcBak);
  }

  return ret;
}

testrun('copyProps', testfn, [
  {
    name: 'When only src and dst are defined',
    cases: [
      {
        name: 'And src is {} and dst is {}',
        src: {},
        dst: {},
        expected: {},
      },
      {
        name: 'And dst is empty',
        src: { a: 1, b: 'b', c: true },
        dst: {},
        expected: { a: 1, b: 'b', c: true },
      },
      {
        name: 'And dst is empty and src is a nested object',
        src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
        dst: {},
        expected: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
      },
      {
        name: 'And src is empty',
        src: {},
        dst: { a: 1, b: 'b', c: true },
        expected: { a: 1, b: 'b', c: true },
      },
      {
        name: 'And src is empty and dst is a nested object',
        src: {},
        dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
        expected: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
      },
      {
        name: 'And src and dst are same compositions',
        src: { a: 1, b: 'b', c: true },
        dst: { a: 2, b: 'x', c: false },
        expected: { a: 1, b: 'b', c: true },
      },
      {
        name: 'And src and dst are same compositions and nested objects',
        src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
        dst: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
        expected: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
      },
      {
        name: 'And src has more properties than dst',
        src: { a: 1, b: 2, c: 3 },
        dst: { a: 9 },
        expected: { a: 1, b: 2, c: 3 },
      },
      {
        name: 'And src has more properties than dst and an nested object',
        src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
        dst: { a: { a1: 3 },  },
        expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
      },
      {
        name: 'And dst has more properties than src',
        src: { a: 9 },
        dst: { a: 1, b: 2, c: 3 },
        expected: { a: 9, b: 2, c: 3 },
      },
      {
        name: 'And dst has more properties than src and an nested object',
        src: { a: { a1: 3 },  },
        dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
        expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
      },
    ],
  },
  {
    name: 'When only src, dst and map are defined',
    cases: [
      {
        name: 'And both src and dst are empty',
        src: {},
        dst: {},
        map: { a: 'x.y.z', b: 'x.y.w' },
        expected: {},
      },
      {
        name: 'And map contains all src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        map: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
        expected: { x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true } },
      },
      {
        name: 'And map does not contains any of src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And overwrite dst properties contained by map',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And not overwrite dst properties not contained by map',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        map: { 'a.b1': 'x.y.w', },
        expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
      },
      {
        name: 'And not overwrite dst properties if associated src properties' +
        ' are not\n\tundefined',
        src: { a: {} },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
      },
      {
        name: 'And map is an array',
        src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        dst: { x: { y: { z: 1 }, }, },
        map: ['x.y.z', 'o.p'],
        expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
      },
    ],
  },
  {
    name: 'When only src, dst and converter are defined',
    cases: [
      {
        name: 'And covert all of src property values',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        fn: function(value) {
          return value * 2;
        },
        expected: { a: 2, b: { c: 4, d: 6 } },
      },
      {
        name: 'And covert src property values by their keychains',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        fn: function(value, keychain) {
          if (keychain === 'a') {
            return value * 2;
          } else if (keychain === 'b.c') {
            return 'x';
          } else if (keychain === 'b.d') {
            return value * 10;
          }
        },
        expected: { a: 2, b: { c: 'x', d: 30 } },
      },
    ],
  },
  {
    name: 'When only src, dst and isReversed are defined',
    cases: [
      {
        name: 'And isReversed is false',
        cases: [
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            rev: false,
            expected: {},
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true },
            dst: {},
            rev: false,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: {},
            rev: false,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true },
            rev: false,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            rev: false,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 1, b: 'b', c: true },
            dst: { a: 2, b: 'x', c: false },
            rev: false,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src and dst are same compositions and nested objects',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
            rev: false,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src has more properties than dst',
            src: { a: 1, b: 2, c: 3 },
            dst: { a: 9 },
            rev: false,
            expected: { a: 1, b: 2, c: 3 },
          },
          {
            name: 'And src has more properties than dst and an nested object',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            rev: false,
            expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 9 },
            dst: { a: 1, b: 2, c: 3 },
            rev: false,
            expected: { a: 9, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and an nested object',
            src: { a: { a1: 3 },  },
            dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            rev: false,
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
        ],
      },
      {
        name: 'And isReversed is true',
        cases: [
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            rev: true,
            expected: {},
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true },
            rev: true,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            rev: true,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true },
            dst: {},
            rev: true,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: {},
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            rev: true,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 2, b: 'x', c: false },
            dst: { a: 1, b: 'b', c: true },
            rev: true,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src and dst are same compositions and nested objects',
            src: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            rev: true,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 9 },
            dst: { a: 1, b: 2, c: 3 },
            rev: true,
            expected: { a: 1, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and an nested object',
            src: { a: { a1: 3 },  },
            dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            rev: true,
            expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 1, b: 2, c: 3 },
            dst: { a: 9 },
            rev: true,
            expected: { a: 9, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and an nested object',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            rev: true,
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
        ],
      },
    ],
  },
  {
    name: 'When only src, dst, map and isReversed are defined',
    cases: [
      {
        name: 'And isReversed is false',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            rev: false,
            expected: {},
          },
          {
            name: 'And map contains all src properties',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: {},
            map: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
            rev: false,
            expected: {
              x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true },
            },
          },
          {
            name: 'And map does not contains any of src properties',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: {},
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            rev: false,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            rev: false,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And not overwrite dst properties not contained by map',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.w', },
            rev: false,
            expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
          },
          {
            name: 'And not overwrite dst properties if associated src ' +
                  'properties are not\n\tundefined',
            src: { a: {} },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            rev: false,
            expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
          },
          {
            name: 'And map is an array',
            src: { x: { y: { z: 123, zz: 'BBB' }, }, o: { p: true } },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: ['x.y.z'],
            rev: false,
            expected: { x: { y: { z: 123 }, }, o: { p: 'a' } },
          },
        ],
      },
      {
        name: 'And isReversed is true',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            rev: true,
            expected: {},
          },
          {
            name: 'And map contains all dst properties',
            src: {},
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'x.v.w': 'a.b2', 'o.p': 'c' },
            rev: true,
            expected: {
              x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true },
            },
          },
          {
            name: 'And map does not contains any of dst properties',
            src: {},
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            rev: true,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            rev: true,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And not overwrite dst properties not contained by map',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.w': 'a.b1' },
            rev: true,
            expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
          },
          {
            name: 'And not overwrite dst properties if associated src ' +
                  'properties are not\n\tundefined',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: {} },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            rev: true,
            expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
          },
          {
            name: 'And map has duplicated value',
            src: { a: { b: { c: 'A', d: 'B' }, }, },
            dst: { x: { y: { z: 1234 }, }, },
            map: { 'a.b.c': 'x.y.z', 'a.b.d': 'x.y.z' },
            rev: true,
            expected: { a: { b: { c: 1234, d: 1234, }, }, },
          },
          {
            name: 'And map is an array',
            src: { x: { y: { z: 123, zz: 'BBB' }, }, o: { p: true } },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: ['x.y.z'],
            rev: true,
            expected: { x: { y: { z: 999, zz: 'BBB' }, }, o: { p: true } },
          },
        ],
      },
    ],
  },
  {
    name: 'When only src, dst, converter and isReversed are defined',
    cases: [
      {
        name: 'And isReversed is false',
        cases: [
          {
            name: 'And covert all of src property values',
            src: { a: 1, b: { c: 2, d: 3 } },
            dst: {},
            fn: function(value) {
              return value * 2;
            },
            rev: false,
            expected: { a: 2, b: { c: 4, d: 6 } },
          },
          {
            name: 'And covert src property values by their keychains',
            src: { a: 1, b: { c: 2, d: 3 } },
            dst: {},
            fn: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            rev: false,
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
      {
        name: 'And isReversed is true',
        cases: [
          {
            name: 'And covert all of src property values',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            fn: function(value) {
              return value * 2;
            },
            rev: true,
            expected: { a: 2, b: { c: 4, d: 6 } },
          },
          {
            name: 'And covert src property values by their keychains',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            fn: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            rev: true,
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
    ],
  },
  {
    name: 'When only src, dst, map and converter are defined',
    cases: [
      {
        name: 'And convert and copy to mapped properties',
        src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
        dst: { x: { y: { z: '-' }, }, },
        map: { a: 'x.y.z', 'b.c': 'x.y.w', 'b.d': 'x.u.v', },
        fn: function(value) {
          switch (typeof value) {
            case 'number': {
              return value * 10;
            }
            case 'string': {
              return value.toUpperCase();
            }
          }
        },
        expected: { x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } } },
      },
    ],
  },
  {
    name: 'When only src, dst, map, converter and isReversed are defined',
    cases: [
      {
        name: 'And isReversed is false',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
            dst: { x: { y: { z: '-' }, }, },
            map: { a: 'x.y.z', 'b.c': 'x.y.w', 'b.d': 'x.u.v', },
            fn: function(value) {
              switch (typeof value) {
                case 'number': {
                  return value * 10;
                }
                case 'string': {
                  return value.toUpperCase();
                }
              }
            },
            rev: false,
            expected: { x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } } },
          },
        ],
      },
      {
        name: 'And isReversed is true',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { x: { y: { z: '-' }, }, },
            dst: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
            map: { 'x.y.z': 'a', 'x.y.w': 'b.c', 'x.u.v': 'b.d', },
            fn: function(value) {
              switch (typeof value) {
                case 'number': {
                  return value * 10;
                }
                case 'string': {
                  return value.toUpperCase();
                }
              }
            },
            rev: true,
            expected: { x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } } },
          },
        ],
      },
    ],
  },
]);
