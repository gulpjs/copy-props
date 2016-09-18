'use strict';

var testrun = require('testrun').mocha;
var foreachProps = require('../lib/foreach-props');

function testfn(testcase) {
  var logs = [];
  foreachProps(testcase.obj, function(value, keychain) {
    logs.push({ keychain: keychain, value: value });
  });
  return logs;
}

testrun('#foreachProps', testfn, [
  {
    name: 'When data type of arguments are illegal',
    cases: [
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: undefined,
        error: TypeError,
      },
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: null,
        error: TypeError,
      },
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: true,
        error: TypeError,
      },
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: false,
        error: TypeError,
      },
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: 123,
        error: TypeError,
      },
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: '',
        error: TypeError,
      },
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: [],
        error: TypeError,
      },
      {
        name: 'And obj is ${testcase.obj} : ${testcase.error}',
        obj: new Date(),
        error: TypeError,
      },
    ],
  },
  {
    name: 'When 2nd argument is simple logger',
    cases: [
      {
        name: 'And obj is ${testcase.obj}',
        obj: {},
        expected: [],
      },
      {
        name: 'And obj is ${testcase.obj}',
        obj: { a: 1 },
        expected: [
          { keychain: 'a', value: 1 },
        ],
      },
      {
        name: 'And obj is ${testcase.obj}',
        obj: { a: 123, b: 'B', c: true, d: ['D1','D2'] },
        expected: [
          { keychain: 'a', value: 123 },
          { keychain: 'b', value: 'B' },
          { keychain: 'c', value: true },
          { keychain: 'd', value: ['D1', 'D2'] },
        ],
      },
      {
        name: 'And obj is ${testcase.obj}',
        obj: {
          a: {
            a1: 123,
            a2: { aa1: 456, aa2: 789,  },
          },
          b: { b1: 'B1', b2: 'B2' },
        },
        expected: [
          { keychain: 'a.a1', value: 123 },
          { keychain: 'a.a2.aa1', value: 456 },
          { keychain: 'a.a2.aa2', value: 789 },
          { keychain: 'b.b1', value: 'B1' },
          { keychain: 'b.b2', value: 'B2' },
        ],
      },
    ],
  },
]);

