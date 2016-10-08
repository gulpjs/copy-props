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

  var ret = copyProps(testcase.src, testcase.dst, testcase.fromto,
    testcase.converter, testcase.reverse);

  assert.strictEqual(src, testcase.src);
  assert.strictEqual(dst, testcase.dst);

  if (testcase.reverse === true ||
      testcase.converter === true ||
      testcase.fromto === true) {
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
    name: 'When src is illegal type',
    cases: [
      {
        name: 'And src is ${testcase.src}',
        src: undefined,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: null,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: true,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: false,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: [],
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: new Date(),
        dst: {},
        error: TypeError,
      },
    ],
  },
  {
    name: 'When dst is illegal type',
    cases: [
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: undefined,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: null,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: true,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: false,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: [],
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: new Date(),
        error: TypeError,
      },
    ],
  },
  {
    name: 'When 3rd argument is illegal type',
    cases: [
      {
        name: 'And 3rd argument is ${testcase.fromto}',
        src: {},
        dst: {},
        fromto: '',
        error: TypeError,
      },
      {
        name: 'And 3rd argument is ${testcase.fromto}',
        src: {},
        dst: {},
        fromto: 'aaa',
        error: TypeError,
      },
      {
        name: 'And 3rd argument is ${testcase.fromto}',
        src: {},
        dst: {},
        fromto: 0,
        error: TypeError,
      },
      {
        name: 'And 3rd argument is ${testcase.fromto}',
        src: {},
        dst: {},
        fromto: 123,
        error: TypeError,
      },
      {
        name: 'And 3rd argument is ${testcase.fromto}',
        src: {},
        dst: {},
        fromto: new Date(),
        error: TypeError,
      },
    ],
  },
  {
    name: 'When 4th argument is illegal type',
    cases: [
      {
        name: 'And 4th argument is ${testcase.converter}',
        src: {},
        dst: {},
        fromto: {},
        converter: 0,
        error: TypeError,
      },
      {
        name: 'And 4th argument is ${testcase.converter}',
        src: {},
        dst: {},
        fromto: {},
        converter: 123,
        error: TypeError,
      },
      {
        name: 'And 4th argument is ${testcase.converter}',
        src: {},
        dst: {},
        fromto: {},
        converter: '',
        error: TypeError,
      },
      {
        name: 'And 4th argument is ${testcase.converter}',
        src: {},
        dst: {},
        fromto: {},
        converter: 'abc',
        error: TypeError,
      },
      {
        name: 'And 4th argument is ${testcase.converter}',
        src: {},
        dst: {},
        fromto: {},
        converter: [],
        error: TypeError,
      },
      {
        name: 'And 4th argument is ${testcase.converter}',
        src: {},
        dst: {},
        fromto: {},
        converter: {},
        error: TypeError,
      },
      {
        name: 'And 3rd argument is a function',
        cases: [
          {
            name: 'And 4th argument is ${testcase.converter}',
            src: {},
            dst: {},
            fromto: function() {},
            converter: 0,
            error: TypeError,
          },
          {
            name: 'And 4th argument is ${testcase.converter}',
            src: {},
            dst: {},
            fromto: function() {},
            converter: 123,
            error: TypeError,
          },
          {
            name: 'And 4th argument is ${testcase.converter}',
            src: {},
            dst: {},
            fromto: function() {},
            converter: '',
            error: TypeError,
          },
          {
            name: 'And 4th argument is ${testcase.converter}',
            src: {},
            dst: {},
            fromto: function() {},
            converter: 'abc',
            error: TypeError,
          },
          {
            name: 'And 4th argument is ${testcase.converter}',
            src: {},
            dst: {},
            fromto: function() {},
            converter: [],
            error: TypeError,
          },
          {
            name: 'And 4th argument is ${testcase.converter}',
            src: {},
            dst: {},
            fromto: function() {},
            converter: {},
            error: TypeError,
          },
          {
            name: 'And 4th argument is ${testcase.converter}',
            src: {},
            dst: {},
            fromto: function() {},
            converter: function func() {},
            error: TypeError,
          },
        ],
      },
    ],
  },
  {
    name: 'When 5th argument is illegal type',
    cases: [
      {
        name: 'And 5th argument is ${testcase.reverse}',
        src: {},
        dst: {},
        fromto: {},
        converter: function() {},
        reverse: 0,
        error: TypeError,
      },
      {
        name: 'And 5th argument is ${testcase.reverse}',
        src: {},
        dst: {},
        fromto: {},
        converter: function() {},
        reverse: 123,
        error: TypeError,
      },
      {
        name: 'And 5th argument is ${testcase.reverse}',
        src: {},
        dst: {},
        fromto: {},
        converter: function() {},
        reverse: '',
        error: TypeError,
      },
      {
        name: 'And 5th argument is ${testcase.reverse}',
        src: {},
        dst: {},
        fromto: {},
        converter: function() {},
        reverse: 'abc',
        error: TypeError,
      },
      {
        name: 'And 5th argument is ${testcase.reverse}',
        src: {},
        dst: {},
        fromto: {},
        converter: function() {},
        reverse: [],
        error: TypeError,
      },
      {
        name: 'And 5th argument is ${testcase.reverse}',
        src: {},
        dst: {},
        fromto: {},
        converter: function() {},
        reverse: {},
        error: TypeError,
      },
      {
        name: 'And 5th argument is ${testcase.reverse}',
        src: {},
        dst: {},
        fromto: {},
        converter: function() {},
        reverse: function func() {},
        error: TypeError,
      },
    ],
  },
]);
