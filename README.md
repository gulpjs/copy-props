# copy-props [![Build Status][travis-img]][travis-url] [![Build Status][appveyor-img]][appveyor-url]

Copy properties deeply between two objects.

[![NPM][npm-img]][npm-url]

[npm-img]: https://nodei.co/npm/copy-props.png
[npm-url]: https://nodei.co/npm/copy-props/
[travis-img]: https://travis-ci.org/sttk/copy-props.svg?branch=master
[travis-url]: https://travis-ci.org/sttk/copy-props
[appveyor-img]: https://ci.appveyor.com/api/projects/status/github/sttk/copy-props?branch=master&svg=true
[appveyor-url]: https://ci.appveyor.com/project/sttk/copy-props

Install
-------

```
$ npm i copy-props --save
```

Usage
-----

* Load this module :

    ```js
    const copyProps = require('copy-props');
    ```

* Copy *src* to *dst* simply (and return *dst*) :

    ```js
    var src = { a: 1, b: { b1: 'bbb' }, c: 'ccc' };
    var dst = { a: 2, b: { b1: 'xxx', b2: 'yyy' } };

    copyProps(src, dst);
    // => { a: 1, b: { b1: 'bbb', b2: 'yyy' }, c: 'ccc' }
    ```

* Copy *src* to *dst* with property mapping (and return *dst*) :

    ```js
    var src = { a: 1, b: { b1: 'bbb' }, c: 'ccc', d: 'ddd' };
    var dst = { f: { a: 2, b1: 'xxx', b2: 'yyy' }, e: 'zzz' };

    copyProps(src, dst, {
      a: 'f.a',
      'b.b1': 'f.b.b1',
      'b.b2': 'f.b.b2',
      'c': 'f.c',
    });
    // => { f: { a: 1, b1: 'bbb', b2: 'yyy', c: 'ccc' }, e: 'zzz' }
    ```

* Copy *src* to *dst* with convert function (and return *dst*) :

    ```js
    var src = { a: 1, b: { b1: 'bbb' } };
    var dst = { a: 0 };

    copyProps(src, dst, function(value, keychain) {
      if (keychain === 'a') {
        return value * 2;
      }
      if (keychain === 'b.b1') {
        return value.toUpperCase();
      }
    });
    // => { a: 2, b: { b1: 'BBB' } }
    ```

* Can use an array instead of a map as property mapping :

    ```js
    var src = { a: 1, b: { c: 'CCC' }, d: { e: 'EEE' } };
    var dst = { a: 9, b: { c: 'xxx' }, d: { e: 'yyy' } };
    var fromto = [ 'a.b.c', 'd.e' ];
    copyProps(src, dst, fromto);
    // => { a: 1, b: { c: 'CCC' }, d: { e: 'EEE' } }
    ```

* Can copy reversively (from *dst* to *src*) by reverse flag (and return *src*):

    ```js
    var src = { a: 1, b: { b1: 'bbb' }, c: 'ccc' };
    var dst = { a: 2, b: { b1: 'xxx', b2: 'yyy' } };

    copyProps(src, dst, true);
    // => { a: 2, b: { b1: 'xxx', b2: 'yyy' }, c: 'ccc' }
    ```

    ```js
    var src = { a: 1, b: { b1: 'bbb' }, c: 'ccc', d: 'ddd' };
    var dst = { f: { a: 2, b1: 'xxx', b2: 'yyy' }, e: 'zzz' };

    copyProps(src, dst, {
      a: 'f.a',
      'b.b1': 'f.b1',
      'b.b2': 'f.b2',
      'c': 'f.c',
    }, true);
    // => { a: 2, b: { b1: 'bbb', b2: 'yyy' }, c: 'ccc', d: 'ddd' }
    ```

* If a value of source property is undefined (when not using converter), or a result of converter is undefined (when using converter), the value is not copied.

    ```js
    var src = { a: 'A', b: undefined, c: null, d: 1 };
    var dst = { a: 'a', b: 'b', c: 'c' };

    copyProps(src, dst, function(value, key) {
      if (key === 'd') {
        return undefined;
      } else {
        return value;
      }
    });
    // => { a: 'A', b: 'b', c: null }
    ```

API
---

### <u>copyProps(src, dst [, fromto] [, converter] [, reverse]) => object</u>

Copy properties of *src* to *dst* deeply.
If *fromto* is given, it is able to copy between different properties.
If *converter* is given, it is able to convert the terminal values.

* **Arguments:**

    * **src** [object] : a source object of copy.
    * **dst** [object] : a destinate object of copy.
    * **fromto** [object | array] : an object mapping properties between *src* and *dst*. (optional)
    * **converter** [function] : a function to convert terminal values in *src*. (optional) 
    * **reverse** [boolean] : copys reversively from dst to src and returns src object. `fromto` is also reversively used from value to key. This default value is `false`. (optional)

* **Return** [object] : *dst* object after copying.

#### *Format of fromto*

*fromto* is a non-nested key-value object. And the *key*s are property key chains of *src* and the *value*s are property key chains of *dst*. 
The key chain is a string which is concatenated property keys on each level with dots, like `'aaa.bbb.ccc'`.

The following example copys the value of `src.aaa.bbb.ccc` to `dst.xxx.yyy`.

```js
copyProps(src, dst, {
  'aaa.bbb.ccc' : 'xxx.yyy'
})
```

*fromto* can be an array. In that case, the array works as a map which has pairs of same key and value.

#### *API of converter*

**<u>converter(value, keychain) => any</u>**

*converter* is a function to convert terminal values of propeerties of *src*.

* **Arguments:**

    * **value** [any] : a property value to be converted.
    * **keychain** [string] : a string of property keys concatenated with dots.

* **Return:** [any] : converted value.

License
-------

MIT
