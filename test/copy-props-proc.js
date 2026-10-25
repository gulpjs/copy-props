"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var copyProps = require("..");

describe("Processing", function () {
  describe("When src and dst is single depth objects", function () {
    it("Should copy properties of src to dst", function () {
      var fn = function () {};
      var src = {
        a: null,
        b: true,
        c: 123,
        d: "ABC",
        e: [1, 2, 3],
        f: { g: 1, h: "H" },
        i: new Date(0),
        j: fn,
      };
      var dst = {};
      var result = copyProps(src, dst);
      assert.strictEqual(result, dst);
      assert.deepStrictEqual(dst, src);
    });

    it("Should overwrite dst properties by src properties", function () {
      var src = { a: 123, b: "bbb", c: true };
      var dst = { a: 987, b: "BBB", c: false };
      var result = copyProps(src, dst);
      assert.deepStrictEqual(result, src);
    });

    it("Should ignore src properties of which value is undefined", function () {
      var src = { a: 0, b: "", c: null, d: undefined };
      var dst = {};
      var result = copyProps(src, dst);
      var expected = { a: 0, b: "", c: null };
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("When src and dst is multiple depth objects", function () {
    it("Should copy properties of src to dst", function () {
      var src = {
        a: "A1",
        b: {
          c: "C1",
          d: "D1",
          e: {
            f: "F1",
            g: "G1",
          },
          h: "H1",
        },
      };
      var dst = {};
      var result = copyProps(src, dst);
      assert.strictEqual(result, dst);
      assert.deepStrictEqual(result, src);
    });

    it("Should overwrite dst properties by src properties", function () {
      var src = {
        a: "A1",
        b: {
          c: "C1",
          d: "D1",
          e: {
            f: "F1",
            g: "G1",
          },
          h: "H1",
        },
      };
      var dst = {
        a: "A2",
        b: {
          c: "C2",
          d: "D2",
          e: {
            f: "F2",
            g: "G2",
          },
          h: "H2",
        },
      };
      var result = copyProps(src, dst);
      assert.deepStrictEqual(result, src);
    });

    it("Should ignore src properties of which value is undefined", function () {
      var src = {
        a: "",
        b: {
          c: undefined,
          d: null,
          e: {
            f: 0,
            g: undefined,
          },
          h: [],
          i: {},
        },
      };
      var dst = {
        a: "A2",
        b: {
          c: "C2",
          d: "D2",
          e: {
            f: "F2",
            g: "G2",
          },
          h: "H2",
        },
      };
      var expected = {
        a: "",
        b: {
          c: "C2",
          d: null,
          e: {
            f: 0,
            g: "G2",
          },
          h: [],
          i: {},
        },
      };
      var result = copyProps(src, dst);
      assert.deepStrictEqual(result, expected);
    });

    it("Should copy properties until parent object if value is undefined", function () {
      var src = {
        a: undefined,
        b: { c: undefined },
        e: { f: { g: undefined } },
        h: {},
        i: { j: {} },
      };
      var dst = {};
      var result = copyProps(src, dst);
      var expected = { b: {}, e: { f: {} }, h: {}, i: { j: {} } };
      assert.deepStrictEqual(result, expected);
      assert.deepStrictEqual(result.a, undefined);
      assert.deepStrictEqual(result.b.c, undefined);
      assert.deepStrictEqual(result.b.d, undefined);
      assert.deepStrictEqual(result.e.f.g, undefined);
      assert.deepStrictEqual(result.h.xxx, undefined);
      assert.deepStrictEqual(result.i.j.yyy, undefined);
    });

    it("Should do nothing when src prop is an empty object and dst is an object", function () {
      var src = { a: { b: {} } };
      var dst = { a: { b: { c: 1 } } };
      assert.deepStrictEqual(copyProps(src, dst), { a: { b: { c: 1 } } });
    });

    it("Should copy normally when src prop is not a plain object but an object", function () {
      function O(v) {
        this.a = { b: { c: v } };
      }
      var o1 = new O(123);
      var o2 = new O(456);
      var p1 = { o: o1 };
      var p2 = { o: o2 };
      copyProps(p1, p2);
      assert.strictEqual(p2.o, o1);
    });
  });

  describe("About fromto special cases", function () {
    it("When fromto has surplus properties to src", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 9, B: { C: 8 } };
      var fromto = { a: "A", b: "B", "b.c": "B.C", "b.d": "B.D", e: "E" };
      var result = copyProps(src, dst, fromto);
      var expected = { A: 1, B: { C: 2 } };
      assert.deepStrictEqual(result, expected);
    });

    it("When fromto has a part of properties of src", function () {
      var src = { a: 1, b: { c: 2, d: 3 }, e: 4 };
      var dst = { A: 9, B: { C: 8, d: 7 }, e: 6 };
      var fromto = { a: "A", b: "B", "b.c": "B.C" };
      var result = copyProps(src, dst, fromto);
      var expected = { A: 1, B: { C: 2, d: 7 }, e: 6 };
      assert.deepStrictEqual(result, expected);
    });

    it("When fromto changes the structure against src", function () {
      var src = { a: 1, b: { c: 2, d: 3 }, e: 4 };
      var dst = { A: 9, B: { C: 8 }, d: 7, e: 6 };
      var fromto = { a: "A.A", "b.c": "B", "b.d": "D.E.F" };
      var result = copyProps(src, dst, fromto);
      var expected = { A: { A: 1 }, B: 2, D: { E: { F: 3 } }, d: 7, e: 6 };
      assert.deepStrictEqual(result, expected);
    });

    it("When fromto is an empty object", function () {
      var src = { a: 1, b: { c: 2, d: 3 }, e: 4 };
      var dst = {};
      var fromto = {};
      var result = copyProps(src, dst, fromto);
      var expected = {};
      assert.deepStrictEqual(result, expected);
    });

    it("When fromto is an empty array", function () {
      var src = { a: 1, b: { c: 2, d: 3 }, e: 4 };
      var dst = {};
      var fromto = [];
      var result = copyProps(src, dst, fromto);
      var expected = {};
      assert.deepStrictEqual(result, expected);
    });

    it("When fromto object contains non-string value", function () {
      var src = { a: 1, b: { c: 2, d: 3 }, e: 4 };
      var dst = {};
      var fromto = { a: "A", "b.c": true, "b.d": 123, "b.e": ["B.E"] };
      var result = copyProps(src, dst, fromto);
      var expected = { A: 1 };
      assert.deepStrictEqual(result, expected);
    });

    it("When fromto array contains non-string element", function () {
      var src = { a: 1, b: { c: 2, d: 3 }, e: 4 };
      var dst = {};
      var fromto = ["a", true, 123, ["B.E"]];
      var result = copyProps(src, dst, fromto);
      var expected = { a: 1 };
      assert.deepStrictEqual(result, expected);
    });

    it("Should copy properties until parent object if value is undefined", function () {
      var src = {};
      var dst = {};
      var fromto = ["a", "b.c", "b.d", "e.f.g"];
      var result = copyProps(src, dst, fromto);
      var expected = { b: {}, e: { f: {} } };
      assert.deepStrictEqual(result, expected);
      assert.deepStrictEqual(result.a, undefined);
      assert.deepStrictEqual(result.b.c, undefined);
      assert.deepStrictEqual(result.b.d, undefined);
      assert.deepStrictEqual(result.e.f.g, undefined);
    });

    it("Should do nothing when src prop is an empty object and dst is an object", function () {
      var src = { a: { b: {} } };
      var dst = { a: { b: { c: 1 } } };
      var fromto = ["a.b"];
      assert.deepStrictEqual(copyProps(src, dst, fromto), {
        a: { b: { c: 1 } },
      });
    });
  });

  describe("About patterns of converter returns", function () {
    it("When converter returns undefined", function () {
      var src = { a: 1, b: { c: 2, d: 3, e: 4 } };
      var dst = { a: "A", b: { e: "E" } };
      function fn(srcInfo, dstInfo) {
        switch (srcInfo.keyChain) {
          case "a": {
            assert.deepStrictEqual(srcInfo.value, 1);
            assert.deepStrictEqual(srcInfo.key, "a");
            assert.deepStrictEqual(srcInfo.depth, 1);
            assert.strictEqual(srcInfo.parent, src);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "A");
            assert.deepStrictEqual(dstInfo.key, "a");
            assert.deepStrictEqual(dstInfo.depth, 1);
            assert.strictEqual(dstInfo.parent, dst);
            break;
          }
          case "b.c": {
            assert.deepStrictEqual(srcInfo.value, 2);
            assert.deepStrictEqual(srcInfo.key, "c");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.deepStrictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, undefined);
            assert.deepStrictEqual(dstInfo.key, "c");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          case "b.d": {
            assert.deepStrictEqual(srcInfo.value, 3);
            assert.deepStrictEqual(srcInfo.key, "d");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, undefined);
            assert.deepStrictEqual(dstInfo.key, "d");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          case "b.e": {
            assert.deepStrictEqual(srcInfo.value, 4);
            assert.deepStrictEqual(srcInfo.key, "e");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "E");
            assert.deepStrictEqual(dstInfo.key, "e");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          default: {
            assert.fail("should never be reached");
            break;
          }
        }
        return srcInfo.keyChain === "b.c" ? undefined : srcInfo.value;
      }
      var result = copyProps(src, dst, fn);
      var expected = { a: 1, b: { d: 3, e: 4 } };
      assert.deepStrictEqual(result, expected);
    });

    it("When converter returns null", function () {
      var src = { a: 1, b: { c: 2, d: 3 } };
      var dst = {};
      function fn(srcInfo, dstInfo) {
        switch (srcInfo.keyChain) {
          case "a": {
            assert.deepStrictEqual(srcInfo.value, 1);
            assert.deepStrictEqual(srcInfo.key, "a");
            assert.deepStrictEqual(srcInfo.depth, 1);
            assert.strictEqual(srcInfo.parent, src);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, undefined);
            assert.deepStrictEqual(dstInfo.key, "a");
            assert.deepStrictEqual(dstInfo.depth, 1);
            assert.strictEqual(dstInfo.parent, dst);
            break;
          }
          case "b.c": {
            assert.deepStrictEqual(srcInfo.value, 2);
            assert.deepStrictEqual(srcInfo.key, "c");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.deepStrictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, undefined);
            assert.deepStrictEqual(dstInfo.key, "c");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          case "b.d": {
            assert.deepStrictEqual(srcInfo.value, 3);
            assert.deepStrictEqual(srcInfo.key, "d");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.deepStrictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, undefined);
            assert.deepStrictEqual(dstInfo.key, "d");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          default: {
            assert.deepStrictEqual(true, false);
            break;
          }
        }
        return srcInfo.keyChain === "b.c" ? null : srcInfo.value;
      }
      var result = copyProps(src, dst, fn);
      var expected = { a: 1, b: { c: null, d: 3 } };
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("About reverse", function () {
    it("When reverse is true", function () {
      var src = { a: 1, b: { d: 3 } };
      var dst = { a: "A", b: { c: "C", d: "D" } };
      var result = copyProps(src, dst, true);
      var expected = { a: "A", b: { c: "C", d: "D" } };
      assert.deepStrictEqual(result, expected);

      src = { a: 1, b: { c: 2, d: 3 } };
      dst = { a: "A", b: { c: "C", d: "D" } };
      var fromto = ["a", "b.d"];
      result = copyProps(src, dst, fromto, true);
      expected = { a: "A", b: { c: 2, d: "D" } };
      assert.deepStrictEqual(result, expected);

      src = { a: 1, b: { c: 2, d: 3 } };
      dst = { a: "A", b: { c: "C", d: "D" } };
      var converter = function (srcInfo, dstInfo) {
        switch (srcInfo.keyChain) {
          case "a": {
            assert.deepStrictEqual(srcInfo.value, "A");
            assert.deepStrictEqual(srcInfo.key, "a");
            assert.deepStrictEqual(srcInfo.depth, 1);
            assert.strictEqual(srcInfo.parent, dst);
            assert.deepStrictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, 1);
            assert.deepStrictEqual(dstInfo.key, "a");
            assert.deepStrictEqual(dstInfo.depth, 1);
            assert.deepStrictEqual(dstInfo.parent, src);
            break;
          }
          case "b.c": {
            assert.deepStrictEqual(srcInfo.value, "C");
            assert.deepStrictEqual(srcInfo.key, "c");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, dst.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, 2);
            assert.deepStrictEqual(dstInfo.key, "c");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, src.b);
            break;
          }
          case "b.d": {
            assert.deepStrictEqual(srcInfo.value, "D");
            assert.deepStrictEqual(srcInfo.key, "d");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, dst.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, 3);
            assert.deepStrictEqual(dstInfo.key, "d");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, src.b);
            break;
          }
          default: {
            assert.fail("should never be reached");
            break;
          }
        }
        if (srcInfo.keyChain === "b.c") {
          return undefined;
        } else {
          return srcInfo.value.toLowerCase();
        }
      };
      result = copyProps(src, dst, converter, true);
      expected = { a: "a", b: { c: 2, d: "d" } };
      assert.deepStrictEqual(result, expected);

      src = { a: 1, b: { c: 2, d: 3 } };
      dst = { a: "A", b: { c: "C", d: "D", e: "E", f: "F" } };
      fromto = ["a", "b.c", "b.d", "b.e"];
      converter = function (srcInfo, dstInfo) {
        switch (srcInfo.keyChain) {
          case "a": {
            assert.deepStrictEqual(srcInfo.value, "A");
            assert.deepStrictEqual(srcInfo.key, "a");
            assert.deepStrictEqual(srcInfo.depth, 1);
            assert.strictEqual(srcInfo.parent, dst);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, 1);
            assert.deepStrictEqual(dstInfo.key, "a");
            assert.deepStrictEqual(dstInfo.depth, 1);
            assert.strictEqual(dstInfo.parent, src);
            break;
          }
          case "b.c": {
            assert.deepStrictEqual(srcInfo.value, "C");
            assert.deepStrictEqual(srcInfo.key, "c");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, dst.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, 2);
            assert.deepStrictEqual(dstInfo.key, "c");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, src.b);
            break;
          }
          case "b.d": {
            assert.deepStrictEqual(srcInfo.value, "D");
            assert.deepStrictEqual(srcInfo.key, "d");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, dst.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, 3);
            assert.deepStrictEqual(dstInfo.key, "d");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, src.b);
            break;
          }
          case "b.e": {
            assert.deepStrictEqual(srcInfo.value, "E");
            assert.deepStrictEqual(srcInfo.key, "e");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, dst.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, undefined);
            assert.deepStrictEqual(dstInfo.key, "e");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, src.b);
            break;
          }
          default: {
            assert.strictEqual(true, false);
            break;
          }
        }
        if (srcInfo.keyChain === "b.c") {
          return undefined;
        } else {
          return srcInfo.value.toLowerCase();
        }
      };
      result = copyProps(src, dst, fromto, converter, true);
      expected = { a: "a", b: { c: 2, d: "d", e: "e" } };
      assert.deepStrictEqual(result, expected);
    });

    it("When reverse is false", function () {
      var src = { a: 1, b: { d: 3 } };
      var dst = { a: "A", b: { c: "C", d: "D" } };
      var result = copyProps(src, dst, false);
      var expected = { a: 1, b: { c: "C", d: 3 } };
      assert.deepStrictEqual(result, expected);

      src = { a: 1, b: { c: 2, d: 3 } };
      dst = { a: "A", b: { c: "C", d: "D" } };
      var fromto = ["a", "b.d"];
      result = copyProps(src, dst, fromto, false);
      expected = { a: 1, b: { c: "C", d: 3 } };
      assert.deepStrictEqual(result, expected);

      src = { a: 1, b: { c: 2, d: 3 } };
      dst = { a: "A", b: { c: "C", d: "D" } };
      var converter = function (srcInfo, dstInfo) {
        switch (srcInfo.keyChain) {
          case "a": {
            assert.deepStrictEqual(srcInfo.value, 1);
            assert.deepStrictEqual(srcInfo.key, "a");
            assert.deepStrictEqual(srcInfo.depth, 1);
            assert.strictEqual(srcInfo.parent, src);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "A");
            assert.deepStrictEqual(dstInfo.key, "a");
            assert.deepStrictEqual(dstInfo.depth, 1);
            assert.strictEqual(dstInfo.parent, dst);
            break;
          }
          case "b.c": {
            assert.deepStrictEqual(srcInfo.value, 2);
            assert.deepStrictEqual(srcInfo.key, "c");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "C");
            assert.deepStrictEqual(dstInfo.key, "c");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          case "b.d": {
            assert.deepStrictEqual(srcInfo.value, 3);
            assert.deepStrictEqual(srcInfo.key, "d");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "D");
            assert.deepStrictEqual(dstInfo.key, "d");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          default: {
            assert.fail("should never be reached");
            break;
          }
        }
        if (srcInfo.keyChain === "b.c") {
          return undefined;
        } else {
          return srcInfo.value * 10;
        }
      };
      result = copyProps(src, dst, converter, false);
      expected = { a: 10, b: { c: "C", d: 30 } };
      assert.deepStrictEqual(result, expected);

      src = { a: 1, b: { c: 2, d: 3 } };
      dst = { a: "A", b: { c: "C", d: "D", e: "E", f: "F" } };
      fromto = ["a", "b.c", "b.d", "b.e"];
      converter = function (srcInfo, dstInfo) {
        switch (srcInfo.keyChain) {
          case "a": {
            assert.deepStrictEqual(srcInfo.value, 1);
            assert.deepStrictEqual(srcInfo.key, "a");
            assert.deepStrictEqual(srcInfo.depth, 1);
            assert.strictEqual(srcInfo.parent, src);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "A");
            assert.deepStrictEqual(dstInfo.key, "a");
            assert.deepStrictEqual(dstInfo.depth, 1);
            assert.strictEqual(dstInfo.parent, dst);
            break;
          }
          case "b.c": {
            assert.deepStrictEqual(srcInfo.value, 2);
            assert.deepStrictEqual(srcInfo.key, "c");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "C");
            assert.deepStrictEqual(dstInfo.key, "c");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.deepStrictEqual(dstInfo.parent, dst.b);
            break;
          }
          case "b.d": {
            assert.deepStrictEqual(srcInfo.value, 3);
            assert.deepStrictEqual(srcInfo.key, "d");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "D");
            assert.deepStrictEqual(dstInfo.key, "d");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          case "b.e": {
            assert.deepStrictEqual(srcInfo.value, undefined);
            assert.deepStrictEqual(srcInfo.key, "e");
            assert.deepStrictEqual(srcInfo.depth, 2);
            assert.strictEqual(srcInfo.parent, src.b);
            assert.strictEqual(dstInfo.keyChain, srcInfo.keyChain);
            assert.deepStrictEqual(dstInfo.value, "E");
            assert.deepStrictEqual(dstInfo.key, "e");
            assert.deepStrictEqual(dstInfo.depth, 2);
            assert.strictEqual(dstInfo.parent, dst.b);
            break;
          }
          default: {
            assert.strictEqual(true, false);
            break;
          }
        }
        if (srcInfo.keyChain === "b.c") {
          return undefined;
        } else {
          return srcInfo.value * 10;
        }
      };
      result = copyProps(src, dst, fromto, converter, false);
      expected = { a: 10, b: { c: "C", d: 30, e: "E", f: "F" } };
      assert.deepStrictEqual(result, expected);
    });

    it("When reverse is true and fromto has a property of which value is same with other properties", function () {
      var src = { a: 1, b: { c: 2, d: 3 } };
      var dst = { A: "AAA", B: "BBB" };
      var fromto = { a: "A", "b.c": "B", "b.d": "B" };
      var expected = { A: 1, B: 3 };
      var result = copyProps(src, dst, fromto);
      assert.deepStrictEqual(result, expected);

      src = { a: 1, b: { c: 2, d: 3 } };
      dst = { A: "AAA", B: "BBB" };
      fromto = { a: "A", "b.c": "B", "b.d": "B" };
      expected = { a: "AAA", b: { c: "BBB", d: "BBB" } };
      result = copyProps(src, dst, fromto, true);
      assert.deepStrictEqual(result, expected);
    });
  });

  describe("Avoid a prototype pollution vulnerability", function () {
    describe("The critical property key is in a src object", function () {
      it("should ignore a property key: __proto__", function () {
        var maliciousSrcJson = '{"__proto__":{"polluted":"polluted"},"a":1}';
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(copyProps(JSON.parse(maliciousSrcJson), {}), {
          a: 1,
        });
        assert.deepStrictEqual({}.polluted, undefined);
      });

      it("should ignore a property key: constructor.prototype", function () {
        var maliciousSrcJson =
          '{"constructor":{"prototype":{"polluted":"polluted"}},"a":1}';
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(copyProps(JSON.parse(maliciousSrcJson), {}), {
          a: 1,
        });
        assert.deepStrictEqual({}.polluted, undefined);
      });
    });

    describe("The critical property key is in a dest object and using reverse", function () {
      it("should ignore a property key: __proto__", function () {
        var maliciousSrcJson = '{"__proto__":{"polluted":"polluted"},"a":1}';
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(
          copyProps({}, JSON.parse(maliciousSrcJson), true),
          {
            a: 1,
          },
        );
        assert.deepStrictEqual({}.polluted, undefined);
      });

      it("should ignore a property key: constructor.prototype", function () {
        var maliciousSrcJson =
          '{"constructor":{"prototype":{"polluted":"polluted"}},"a":1}';
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(
          copyProps({}, JSON.parse(maliciousSrcJson), true),
          {
            a: 1,
          },
        );
        assert.deepStrictEqual({}.polluted, undefined);
      });
    });

    describe("The critical property value is in a fromto object", function () {
      it("should ignore a property value: __proto__", function () {
        var fromto = { a: "__proto__.poluuted", b: "c" };
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(copyProps({ a: "polluted", b: 1 }, {}, fromto), {
          c: 1,
        });
        assert.deepStrictEqual({}.polluted, undefined);
      });

      it("should ignore a property value: constructor.prototype", function () {
        var fromto = { a: "constructor.prototype.polluted", b: "c" };
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(copyProps({ a: "polluted", b: 1 }, {}, fromto), {
          c: 1,
        });
        assert.deepStrictEqual({}.polluted, undefined);
      });
    });

    describe("The critical property key is in a fromto object and using reverse", function () {
      it("should ignore a property key: __proto__", function () {
        var fromto = { "__proto__.poluuted": "a", c: "b" };
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(
          copyProps({}, { a: "polluted", b: 1 }, fromto, true),
          {
            c: 1,
          },
        );
        assert.deepStrictEqual({}.polluted, undefined);
      });

      it("should ignore a property key: constructor.prototype and using reverse", function () {
        var fromto = { "constructor.prototype.polluted": "a", c: "b" };
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(
          copyProps({}, { a: "polluted", b: 1 }, fromto, true),
          {
            c: 1,
          },
        );
        assert.deepStrictEqual({}.polluted, undefined);
      });
    });

    describe("The critical element is in a fromto array", function () {
      it("should ignore an element: __proto__", function () {
        var fromto = ["__proto__.polluted", "b"];
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(
          copyProps(
            JSON.parse('{"__proto__":{"polluted":"polluted"},"b":1}'),
            {},
            fromto,
          ),
          { b: 1 },
        );
        assert.deepStrictEqual({}.polluted, undefined);
      });

      it("should ignore an element: constructor.prototype", function () {
        var fromto = ["constructor.prototype.polluted", "b"];
        assert.deepStrictEqual({}.polluted, undefined);
        assert.deepStrictEqual(
          copyProps(
            JSON.parse(
              '{"constructor":{"prototype":{"polluted":"polluted"}},"b":1}',
            ),
            {},
            fromto,
          ),
          { b: 1 },
        );
        assert.deepStrictEqual({}.polluted, undefined);
      });
    });
  });
});
