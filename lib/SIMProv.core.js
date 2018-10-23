(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //==================================================//
//                                                  //
//      SIMProv.js                                  //
//      javascript library for data provenance      //
//      @author Chaitanya Chandurkar                //
//      @since Sept, 2015                           //
//                                                  //
//==================================================//

var _core = require("./src/core");

var _action = require("./src/core/action");

var _change = require("./src/core/change");

var _helpers = require("./src/core/helpers");

// var Class = require('./src/core/class');
var pJson = require('./package.json');

/**
 * Module that wraps the functionality in `jstrails` namespace. An
 * exported `jstrail` keyword is an instance of JsTrails.
 * @module jstrail
 */
(function () {

  'use strict';

  // ------------------------------
  // Basic Setup
  // ------------------------------

  // Create Session Id

  var sessionId = (0, _helpers.guid)();

  // Add Session Id to Trails
  _core.Trail.prototype.sessionId = sessionId;

  // Prepare Object
  var SIMProv = {

    // Classes
    'Trail': _core.Trail,
    'Action': _action.Action,
    'Change': _change.Change,
    'StateChange': _change.StateChange,
    'createChangeClass': _change.createChangeClass,
    'createStateChangeClass': _change.createStateChangeClass,
    'createActionClass': _action.createActionClass,

    // Let SIMProv create classes so that
    // they can be implemented like an interface
    // create: Class.create,

    // Package Information
    'version': pJson.version,
    'homepage': pJson.homepage,

    // Session Id
    'sessionId': sessionId,
    'sessionStart': new Date().getTime()

  };

  // ------------------------------
  // Export
  // ------------------------------

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  // Taken From: Underscore.js - https://github.com/jashkenas/underscore
  var root = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global.global === global && global || this;

  // Previous SIMProv
  var prevSIMProv = root.SIMProv;

  // Export No Conflict
  SIMProv.noConflict = function () {
    root.SIMProv = prevSIMProv;
    return prevSIMProv;
  };

  // Export
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SIMProv;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return SIMProv;
    });
  }root.SIMProv = SIMProv;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./package.json":12,"./src/core":20,"./src/core/action":13,"./src/core/change":15,"./src/core/helpers":18}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":9,"isarray":10}],4:[function(require,module,exports){
(function (Buffer){
var clone = (function() {
'use strict';

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/
function clone(parent, circular, depth, prototype) {
  var filter;
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    filter = circular.filter;
    circular = circular.circular
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth == 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      child = new Buffer(parent.length);
      parent.copy(child);
      return child;
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
};
clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
};
clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
};
clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
};
clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
};
clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}

}).call(this,require("buffer").Buffer)
},{"buffer":3}],5:[function(require,module,exports){
var Tree = require('./src/tree');
module.exports = dataTree = (function(){
  return {
    create: function(){
      return new Tree();
    }
  };
}());

},{"./src/tree":8}],6:[function(require,module,exports){

module.exports = (function(){

  // Flag bad practises
  'use strict';

  // ------------------------------------
  // Basic Setup
  // ------------------------------------

  /**
   * @class Traverser
   * @constructor
   * @classdesc Represents a traverser which searches/traverses the tree in BFS and DFS fashion.
   * @param tree - {@link Tree} that has to be traversed or search.
   */
  function Traverser(tree){

    if(!tree)
    throw new Error('Could not find a tree that is to be traversed');

    /**
     * Represents the {@link Tree} which has to be traversed.
     *
     * @property _tree
     * @type {object}
     * @default "null"
     */
    this._tree = tree;

  }

  // ------------------------------------
  // Methods
  // ------------------------------------

  /**
   * Searches a tree in DFS fashion. Requires a search criteria to be provided.
   *
   * @method searchDFS
   * @memberof Traverser
   * @instance
   * @param {function} criteria - MUST BE a callback function that specifies the search criteria.
   * Criteria callback here receives {@link TreeNode#_data} in parameter and MUST return boolean
   * indicating whether that data satisfies your criteria.
   * @return {object} - first {@link TreeNode} in tree that matches the given criteria.
   * @example
   * // Search DFS
   * var node = tree.traverser().searchDFS(function(data){
   *  return data.key === '#greenapple';
   * });
   */
  Traverser.prototype.searchDFS = function(criteria){

    // Hold the node when found
    var foundNode = null;

    // Find node recursively
    (function recur(node){
      if(node.matchCriteria(criteria)){
        foundNode = node;
        return foundNode;
      } else {
        node._childNodes.some(recur);
      }
    }(this._tree._rootNode));

    return foundNode;
  };

  /**
   * Searches a tree in BFS fashion. Requires a search criteria to be provided.
   *
   * @method searchBFS
   * @memberof Traverser
   * @instance
   * @param {function} criteria - MUST BE a callback function that specifies the search criteria.
   * Criteria callback here receives {@link TreeNode#_data} in parameter and MUST return boolean
   * indicating whether that data satisfies your criteria.
   * @return {object} - first {@link TreeNode} in tree that matches the given criteria.
   * @example
   * // Search BFS
   * var node = tree.traverser().searchBFS(function(data){
   *  return data.key === '#greenapple';
   * });
   */
  Traverser.prototype.searchBFS = function(criteria){

    // Hold the node when found
    var foundNode = null;

    // Find nodes recursively
    (function expand(queue){
      while(queue.length){
        var current = queue.splice(0, 1)[0];
        if(current.matchCriteria(criteria)){
          foundNode = current;
          return;
        }
        current._childNodes.forEach(function(_child){
          queue.push(_child);
        });
      }
    }([this._tree._rootNode]));


    return foundNode;

  };

  /**
   * Traverses an entire tree in DFS fashion.
   *
   * @method traverseDFS
   * @memberof Traverser
   * @instance
   * @param {function} callback - Gets triggered when @{link TreeNode} is explored. Explored node is passed as parameter to callback.
   * @example
   * // Traverse DFS
   * tree.traverser().traverseDFS(function(node){
   *  console.log(node.data);
   * });
   */
  Traverser.prototype.traverseDFS = function(callback){
    (function recur(node){
      callback(node);
      node._childNodes.forEach(recur);
    }(this._tree._rootNode));
  };

  /**
   * Traverses an entire tree in BFS fashion.
   *
   * @method traverseBFS
   * @memberof Traverser
   * @instance
   * @param {function} callback - Gets triggered when node is explored. Explored node is passed as parameter to callback.
   * @example
   * // Traverse BFS
   * tree.traverser().traverseBFS(function(node){
   *  console.log(node.data);
   * });
   */
  Traverser.prototype.traverseBFS = function(callback){
    (function expand(queue){
      while(queue.length){
        var current = queue.splice(0, 1)[0];
        callback(current);
        current._childNodes.forEach(function(_child){
          queue.push(_child);
        });
      }
    }([this._tree._rootNode]));
  };

  // ------------------------------------
  // Export
  // ------------------------------------

  return Traverser;

}());

},{}],7:[function(require,module,exports){

module.exports = (function(){

  // Flag bad practises
  'use strict';

  // ------------------------------------
  // Basic Setup
  // ------------------------------------

  /**
   * @class TreeNode
   * @classdesc Represents a node in the tree.
   * @constructor
   * @param {object} data - that is to be stored in a node
   */
  function TreeNode(data){

    /**
     * Represents the parent node
     *
     * @property _parentNode
     * @type {object}
     * @default "null"
     */
    this._parentNode = null;

    /**
     * Represents the child nodes
     *
     * @property _childNodes
     * @type {array}
     * @default "[]"
     */
    this._childNodes = [];

    /**
     * Represents the data node has
     *
     * @property _data
     * @type {object}
     * @default "null"
     */
    this._data = data;

    /**
     * Depth of the node represents level in hierarchy
     *
     * @property _depth
     * @type {number}
     * @default -1
     */
    this._depth = -1;

  }

  // ------------------------------------
  // Getters and Setters
  // ------------------------------------

  /**
   * Returns a parent node of current node
   *
   * @method parentNode
   * @memberof TreeNode
   * @instance
   * @return {TreeNode} - parent of current node
   */
  TreeNode.prototype.parentNode = function(){
    return this._parentNode;
  };

  /**
   * Returns an array of child nodes
   *
   * @method childNodes
   * @memberof TreeNode
   * @instance
   * @return {array} - array of child nodes
   */
  TreeNode.prototype.childNodes = function(){
    return this._childNodes;
  };

  /**
   * Sets or gets the data belonging to this node. Data is what user sets using `insert` and `insertTo` methods.
   *
   * @method data
   * @memberof TreeNode
   * @instance
   * @param {object | array | string | number | null} data - data which is to be stored
   * @return {object | array | string | number | null} - data belonging to this node
   */
  TreeNode.prototype.data = function(data){
    if(arguments.length > 0){
      this._data = data;
    } else {
      return this._data;
    }
  };

  /**
   * Depth of the node. Indicates the level at which node lies in a tree.
   *
   * @method depth
   * @memberof TreeNode
   * @instance
   * @return {number} - depth of node
   */
  TreeNode.prototype.depth = function(){
    return this._depth;
  };

  // ------------------------------------
  // Methods
  // ------------------------------------

  /**
   * Indicates whether this node matches the specified criteria. It triggers a callback criteria function that returns something.
   *
   * @method matchCriteria
   * @memberof TreeNode
   * @instance
   * @param {function} callback - Callback function that specifies some criteria. It receives {@link TreeNode#_data} in parameter and expects different values in different scenarios.
   * `matchCriteria` is used by following functions and expects:
   * 1. {@link Tree#searchBFS} - {boolean} in return indicating whether given node satisfies criteria.
   * 2. {@link Tree#searchDFS} - {boolean} in return indicating whether given node satisfies criteria.
   * 3. {@link Tree#export} - {object} in return indicating formatted data object.
   */
  TreeNode.prototype.matchCriteria = function(criteria){
    return criteria(this._data);
  };

  /**
   * get sibling nodes.
   *
   * @method siblings
   * @memberof TreeNode
   * @instance
   * @return {array} - array of instances of {@link TreeNode}
   */
  TreeNode.prototype.siblings = function(){
    var thiss = this;
    return !this._parentNode ? [] : this._parentNode._childNodes.filter(function(_child){
      return _child !== thiss;
    });
  };

  /**
   * Finds distance of node from root node
   *
   * @method distanceToRoot
   * @memberof TreeNode
   * @instance
   * @return {array} - array of instances of {@link TreeNode}
   */
  TreeNode.prototype.distanceToRoot = function(){

    // Initialize Distance and Node
    var distance = 0,
        node = this;

    // Loop Over Ancestors
    while(node.parentNode()){
      distance++;
      node = node.parentNode();
    }

    // Return
    return distance;

  };

  /**
   * Gets an array of all ancestor nodes including current node
   *
   * @method getAncestry
   * @memberof TreeNode
   * @instance
   * @return {Array} - array of ancestor nodes
   */
  TreeNode.prototype.getAncestry = function(){

    // Initialize empty array and node
    var ancestors = [this],
        node = this;

    // Loop over ancestors and add them in array
    while(node.parentNode()){
      ancestors.push(node.parentNode());
      node = node.parentNode();
    }

    // Return
    return ancestors;

  };

  /**
   * Exports the node data in format specified. It maintains herirachy by adding
   * additional "children" property to returned value of `criteria` callback.
   *
   * @method export
   * @memberof TreeNode
   * @instance
   * @param {TreeNode~criteria} criteria - Callback function that receives data in parameter
   * and MUST return a formatted data that has to be exported. A new property "children" is added to object returned
   * that maintains the heirarchy of nodes.
   * @return {object} - {@link TreeNode}.
   * @example
   *
   * var rootNode = tree.insert({
   *   key: '#apple',
   *   value: { name: 'Apple', color: 'Red'}
   * });
   *
   * tree.insert({
   *   key: '#greenapple',
   *   value: { name: 'Green Apple', color: 'Green'}
   * });
   *
   * tree.insertToNode(rootNode,  {
   *  key: '#someanotherapple',
   *  value: { name: 'Some Apple', color: 'Some Color' }
   * });
   *
   * // Export the tree
   * var exported = rootNode.export(function(data){
   *  return { name: data.value.name };
   * });
   *
   * // Result in `exported`
   * {
   * "name": "Apple",
   * "children": [
   *   {
   *     "name": "Green Apple",
   *     "children": []
   *   },
   *   {
   *     "name": "Some Apple",
   *     "children": []
   *  }
   * ]
   *}
   *
   */
  TreeNode.prototype.export = function(criteria){

    // Check if criteria is specified
    if(!criteria || typeof criteria !== 'function')
      throw new Error('Export criteria not specified');

    // Export every node recursively
    var exportRecur = function(node){
      var exported = node.matchCriteria(criteria);
      if(!exported || typeof exported !== 'object'){
        throw new Error('Export criteria should always return an object and it cannot be null.');
      } else {
        exported.children = [];
        node._childNodes.forEach(function(_child){
          exported.children.push(exportRecur(_child));
        });

        return exported;
      }
    };

    return exportRecur(this);
  };

  // ------------------------------------
  // Export
  // ------------------------------------

  return TreeNode;

}());

},{}],8:[function(require,module,exports){
var TreeNode = require('./tree-node');
var Traverser = require('./traverser');
module.exports = (function(){

  // Flag bad practises
  'use strict';

  // ------------------------------------
  // Basic Setup
  // ------------------------------------

  /**
   * @class Tree
   * @classdesc Represents the tree in which data nodes can be inserted
   * @constructor
   */
   function Tree(){

    /**
     * Represents the root node of the tree.
     *
     * @member
     * @type {object}
     * @default "null"
     */
    this._rootNode = null;

    /**
     * Represents the current node in question. `_currentNode` points to most recent
     * node inserted or parent node of most recent node removed.
     *
     * @member
    * @memberof Tree.
     * @type {object}
     * @default "null"
     */
    this._currentNode = null;

    /**
     * Represents the traverser which search/traverse a tree in DFS and BFS fashion.
     *
     * @member
     * @memberof Tree
     * @type {object}
     * @instance
     * @default {@link Traverser}
     */
    this._traverser = new Traverser(this);

  }

  // ------------------------------------
  // Getters and Setters
  // ------------------------------------

  /**
   * Returns a root node of the tree.
   *
   * @method rootNode
   * @memberof Tree
   * @instance
   * @return {TreeNode} - root node of the tree.
   */
  Tree.prototype.rootNode = function(){
    return this._rootNode;
  };

  /**
   * Returns a current node in a tree
   *
   * @method currentNode
   * @memberof Tree
   * @instance
   * @return {TreeNode} - current node of the tree.
   */
  Tree.prototype.currentNode = function(){
    return this._currentNode;
  };

  /**
   * Getter function that returns {@link Traverser}.
   *
   * @method traverser
   * @memberof Tree
   * @instance
   * @return {@link Traverser} for the tree.
   */
  Tree.prototype.traverser = function(){
    return this._traverser;
  };

  // ------------------------------------
  // Methods
  // ------------------------------------

  /**
   * Checks whether tree is empty.
   *
   * @method isEmpty
   * @memberof Tree
   * @instance
   * @return {boolean} whether tree is empty.
   */
  Tree.prototype.isEmpty = function(){
    return this._rootNode === null && this._currentNode === null;
  };

  /**
   * Empties the tree. Removes all nodes from tree.
   *
   * @method pruneAllNodes
   * @memberof Tree
   * @instance
   * @return {@link Tree} empty tree.
   */
  Tree.prototype.pruneAllNodes = function(){
    if(this._rootNode && this._currentNode) this.trimBranchFrom(this._rootNode);
    return this;
  };

  /**
   * Creates a {@link TreeNode} that contains the data provided and insert it in a tree.
   * New node gets inserted to the `_currentNode` which updates itself upon every insertion and deletion.
   *
   * @method insert
   * @memberof Tree
   * @instance
   * @param {object} data - data that has to be stored in tree-node.
   * @return {object} - instance of {@link TreeNode} that represents node inserted.
   * @example
   *
   * // Insert single value
   * tree.insert(183);
   *
   * // Insert array of values
   * tree.insert([34, 565, 78]);
   *
  * // Insert complex data
   * tree.insert({
   *   key: '#berries',
   *   value: { name: 'Apple', color: 'Red'}
   * });
   */
  Tree.prototype.insert = function(data){
    var node = new TreeNode(data);
    if(this._rootNode === null && this._currentNode === null){
      node._depth = 1;
      this._rootNode = this._currentNode = node;
    } else {
      node._parentNode = this._currentNode;
      this._currentNode._childNodes.push(node);
      this._currentNode = node;
      node.depth = node._parentNode._depth + 1;
    }
    return node;
  };

  /**
   * Removes a node from tree and updates `_currentNode` to parent node of node removed.
   *
   * @method remove
   * @memberof Tree
   * @instance
   * @param {object} node - {@link TreeNode} that has to be removed.
   * @param {boolean} trim - indicates whether to remove entire branch from the specified node.
   */
  Tree.prototype.remove = function(node, trim){
    if(trim || node === this._rootNode){

      // Trim Entire branch
      this.trimBranchFrom(node);

    } else {

      // Upate children's parent to grandparent
      node._childNodes.forEach(function(_child){
        _child._parentNode = node._parentNode;
        node._parentNode._childNodes.push(_child);
      });

      // Delete itslef from parent child array
      node._parentNode._childNodes.splice(node._parentNode._childNodes.indexOf(node), 1);

      // Update Current Node
      this._currentNode = node._parentNode;

      // Clear Child Array
      node._childNodes = [];
      node._parentNode = null;
      node._data = null;

    }
  };

  /**
   * Remove an entire branch starting with specified node.
   *
   * @method trimBranchFrom
   * @memberof Tree
   * @instance
   * @param {object} node - {@link TreeNode} from which entire branch has to be removed.
   */
  Tree.prototype.trimBranchFrom = function(node){

    // Hold `this`
    var thiss = this;

    // trim brach recursively
    (function recur(node){
      node._childNodes.forEach(recur);
      node._childNodes = [];
      node._data = null;
    }(node));

    // Update Current Node
    if(node._parentNode){
      node._parentNode._childNodes.splice(node._parentNode._childNodes.indexOf(node), 1);
      thiss._currentNode = node._parentNode;
    } else {
      thiss._rootNode = thiss._currentNode = null;
    }
  };

  /**
   * Inserts node to a particular node present in the tree. Particular node here is searched
   * in the tree based on the criteria provided.
   *
   * @method insertTo
   * @memberof Tree
   * @instance
   * @param {function} criteria - Callback function that specifies the search criteria
   * for node to which new node is to be inserted. Criteria callback here receives {@link TreeNode#_data}
   * in parameter and MUST return boolean indicating whether that data satisfies your criteria.
   * @param {object} data - that has to be stored in tree-node.
   * @return {object} - instance of {@link TreeNode} that represents node inserted.
   * @example
   *
   * // Insert data
   * tree.insert({
   *   key: '#apple',
   *   value: { name: 'Apple', color: 'Red'}
   * });
   *
   * // New Data
   * var greenApple = {
   *  key: '#greenapple',
   *  value: { name: 'Green Apple', color: 'Green' }
   * };
   *
   * // Insert data to node which has `key` = #apple
   * tree.insertTo(function(data){
   *  return data.key === '#apple'
   * }, greenApple);
   */
  Tree.prototype.insertTo = function(criteria, data){
    var node = this.traverser().searchDFS(criteria);
    return this.insertToNode(node, data);
  };

  /**
   * Inserts node to a particular node present in the tree. Particular node here is an instance of {@link TreeNode}
   *
   * @method insertToNode
   * @memberof Tree
   * @instance
   * @param {function} node -  {@link TreeNode} to which data node is to be inserted.
   * @param {object} data - that has to be stored in tree-node.
   * @return {object} - instance of {@link TreeNode} that represents node inserted.
   * @example
   *
   * // Insert data
   * var node = tree.insert({
   *   key: '#apple',
   *   value: { name: 'Apple', color: 'Red'}
   * });
   *
   * // New Data
   * var greenApple = {
   *  key: '#greenapple',
   *  value: { name: 'Green Apple', color: 'Green' }
   * };
   *
   * // Insert data to node
   * tree.insertToNode(node, greenApple);
   */
  Tree.prototype.insertToNode = function(node, data){
    var newNode = new TreeNode(data);
    newNode._parentNode = node;
    newNode._depth = newNode._parentNode._depth + 1;
    node._childNodes.push(newNode);
    this._currentNode = newNode;
    return newNode;
  };

  /**
   * Finds a distance between two nodes
   *
   * @method distanceBetween
   * @memberof Tree
   * @instance
   * @param {@link TreeNode} fromNode -  Node from which distance is to be calculated
   * @param {@link TreeNode} toNode - Node to which distance is to be calculated
   * @return {Number} - distance(number of hops) between two nodes.
   */
  Tree.prototype.distanceBetween = function(fromNode, toNode){
    return fromNode.distanceToRoot() + toNode.distanceToRoot() - 2 *  this.findCommonParent(fromNode, toNode).distanceToRoot();
  };

  /**
   * Finds a common parent between nodes
   *
   * @method findCommonParent
   * @memberof Tree
   * @instance
   * @param {@link TreeNode} fromNode
   * @param {@link TreeNode} toNode
   * @return {@link TreeNode} - common parent
   */
  Tree.prototype.findCommonParent = function(fromNode, toNode){

    // Get ancestory of both nodes
    var fromNodeAncestors = fromNode.getAncestry();
    var toNodeAncestors = toNode.getAncestry();

    // Find Commont
    var common = null;
    fromNodeAncestors.some(function(ancestor){
      if(toNodeAncestors.indexOf(ancestor) !== -1){
        common = ancestor;
        return true;
      }
    });

    // Return Common
    return common;

  };

  /**
   * Exports the tree data in format specified. It maintains herirachy by adding
   * additional "children" property to returned value of `criteria` callback.
   *
   * @method export
   * @memberof Tree
   * @instance
   * @param {Tree~criteria} criteria - Callback function that receives data in parameter
   * and MUST return a formatted data that has to be exported. A new property "children" is added to object returned
   * that maintains the heirarchy of nodes.
   * @return {object} - {@link TreeNode}.
   * @example
   *
   * var rootNode = tree.insert({
   *   key: '#apple',
   *   value: { name: 'Apple', color: 'Red'}
   * });
   *
   * tree.insert({
   *   key: '#greenapple',
   *   value: { name: 'Green Apple', color: 'Green'}
   * });
   *
   * tree.insertToNode(rootNode,  {
   *  key: '#someanotherapple',
   *  value: { name: 'Some Apple', color: 'Some Color' }
   * });
   *
   * // Export the tree
   * var exported = tree.export(function(data){
   *  return { name: data.value.name };
   * });
   *
   * // Result in `exported`
   * {
   * "name": "Apple",
   * "children": [
   *   {
   *     "name": "Green Apple",
   *     "children": []
   *   },
   *   {
   *     "name": "Some Apple",
   *     "children": []
   *  }
   * ]
   *}
   *
   */
  Tree.prototype.export = function(criteria){

    // Check if rootNode is not null
    if(!this._rootNode){
      return null;
    }

    return this._rootNode.export(criteria);
  };

  /**
   * Returns a new compressed tree. While compressing it considers nodes that
   * satisfies given criteria and skips the rest of the nodes, making tree compressed.
   *
   * @method compress
   * @memberof Tree
   * @instance
   * @param {Tree~criteria} criteria - Callback function that checks whether node satifies certain criteria. MUST return boolean.
   * @return {@link Tree} - A new compressed tree.
   */
  Tree.prototype.compress = function(criteria){

    // Check if criteria is specified
    if(!criteria || typeof criteria !== 'function')
      throw new Error('Compress criteria not specified');

    // Check if tree is not empty
    if(this.isEmpty()){
      return null;
    }

    // Create New Tree
    var tree = new Tree();

    // Hold `this`
    var thiss = this;

    // Recur DFS
    (function recur(node, parent){

      // Check-in
      var checkIn = thiss.rootNode() === node || node.matchCriteria(criteria);

      // Check if checked-in
      if(checkIn){
        if(tree.isEmpty()){
          parent = tree.insert(node.data());
        } else {
          parent = tree.insertToNode(parent, node.data());
        }
      } else {
        parent._data.hasCompressedNodes = true;
      }

      // For all child nodes
      node.childNodes().forEach(function(_child){
        recur(_child, parent);
      });

    }(this.rootNode(), null));

    return tree;

  };

  /**
   * Imports the JSON data into a tree using the criteria provided.
   * A property indicating the nesting of object must be specified.
   *
   * @method import
   * @memberof Tree
   * @instance
   * @param {object} data - JSON data that has be imported
   * @param {string} childProperty - Name of the property that holds the nested data.
   * @param {Tree~criteria} criteria - Callback function that receives data in parameter
   * and MUST return a formatted data that has to be imported in a tree.
   * @return {object} - {@link Tree}.
   * @example
   *
   * var data = {
   *   "trailId": "h2e67d4ea-f85f40e2ae4a06f4777864de",
   *   "initiatedAt": 1448393492488,
   *   "snapshots": {
   *      "snapshotId": "b3d132131-213c20f156339ea7bdcb6273",
   *      "capturedAt": 1448393495353,
   *      "thumbnail": "data:img",
   *      "children": [
   *       {
   *        "snapshotId": "yeb7ab27c-b36ff1b04aefafa9661243de",
   *        "capturedAt": 1448393499685,
   *        "thumbnail": "data:image/",
   *        "children": [
   *          {
   *            "snapshotId": "a00c9828f-e2be0fc4732f56471e77947a",
   *            "capturedAt": 1448393503061,
   *            "thumbnail": "data:image/png;base64",
   *            "children": []
   *          }
   *        ]
   *      }
   *     ]
   *   }
   * };
   *
   *  // Import
   *  // This will result in a tree having nodes containing `id` and `thumbnail` as data
   *  tree.import(data, 'children', function(nodeData){
   *    return {
   *      id: nodeData.snapshotId,
   *      thumbnail: nodeData.thumbnail
   *     }
   *  });
   *
   */
  Tree.prototype.import = function(data, childProperty, criteria){

    // Empty all tree
    if(this._rootNode) this.trimBranchFrom(this._rootNode);

    // Set Current Node to root node as null
    this._currentNode = this._rootNode = null;

    // Hold `this`
    var thiss = this;

    // Import recursively
    (function importRecur(node, recurData){

      // Format data from given criteria
      var _data = criteria(recurData);

      // Create Root Node
      if(!node){
        node = thiss.insert(_data);
      } else {
        node = thiss.insertToNode(node, _data);
      }

      // For Every Child
      recurData[childProperty].forEach(function(_child){
        importRecur(node, _child);
      });

    }(this._rootNode, data));

    // Set Current Node to root node
    this._currentNode = this._rootNode;

    return this;

  };

  /**
   * Callback that receives a node data in parameter and expects user to return one of following:
   * 1. {@link Traverser#searchBFS} - {boolean} in return indicating whether given node satisfies criteria.
   * 2. {@link Traverser#searchDFS} - {boolean} in return indicating whether given node satisfies criteria.
   * 3. {@link Tree#export} - {object} in return indicating formatted data object.
   * @callback criteria
   * @param data {object} - data of particular {@link TreeNode}
   */

   // ------------------------------------
   // Export
   // ------------------------------------

  return Tree;

}());

},{"./traverser":6,"./tree-node":7}],9:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],10:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],11:[function(require,module,exports){
(function (global){
/*! rasterizeHTML.js - v1.2.4 - 2016-10-30
* http://www.github.com/cburgmer/rasterizeHTML.js
* Copyright (c) 2016 Christoph Burgmer; Licensed MIT */
/* Integrated dependencies:
 * url (MIT License),
 * css-mediaquery (BSD License),
 * CSSOM.js (MIT License),
 * ayepromise (BSD License & WTFPL),
 * xmlserializer (MIT License),
 * sane-domparser-error (BSD License),
 * css-font-face-src (BSD License),
 * inlineresources (MIT License) */
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.rasterizeHTML=a()}}(function(){var a;return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(b,c,d){!function(e,f){"function"==typeof a&&a.amd?a(["url","css-mediaquery","xmlserializer","sane-domparser-error","ayepromise","inlineresources"],function(a,b,c,d,g,h){return e.rasterizeHTML=f(a,b,c,d,g,h)}):"object"==typeof d?c.exports=f(b("url"),b("css-mediaquery"),b("xmlserializer"),b("sane-domparser-error"),b("ayepromise"),b("inlineresources")):e.rasterizeHTML=f(e.url,e.cssMediaQuery,e.xmlserializer,e.sanedomparsererror,e.ayepromise,e.inlineresources)}(this,function(a,b,c,d,e,f){var g=function(a){"use strict";var b={},c=[];b.joinUrl=function(b,c){return b?a.resolve(b,c):c},b.getConstantUniqueIdFor=function(a){return c.indexOf(a)<0&&c.push(a),c.indexOf(a)},b.clone=function(a){var b,c={};for(b in a)a.hasOwnProperty(b)&&(c[b]=a[b]);return c};var d=function(a){return"object"==typeof a&&null!==a},e=function(a){return d(a)&&Object.prototype.toString.apply(a).match(/\[object (Canvas|HTMLCanvasElement)\]/i)};return b.parseOptionalParameters=function(a){var c={canvas:null,options:{}};return null==a[0]||e(a[0])?(c.canvas=a[0]||null,c.options=b.clone(a[1])):c.options=b.clone(a[0]),c},b}(a),h=function(a,b){"use strict";var c={},d=function(a,b,c){var d=a[b];return a[b]=function(){var a=Array.prototype.slice.call(arguments);return c.apply(this,[a,d])},d};return c.baseUrlRespectingXhr=function(b,c){var e=function(){var e=new b;return d(e,"open",function(b,d){var e=b.shift(),f=b.shift(),g=a.joinUrl(c,f);return d.apply(this,[e,g].concat(b))}),e};return e},c.finishNotifyingXhr=function(a){var c=0,e=0,f=!1,g=b.defer(),h=function(){var a=c-e;a<=0&&f&&g.resolve({totalCount:c})},i=function(){var b=new a;return d(b,"send",function(a,b){return c+=1,b.apply(this,arguments)}),b.addEventListener("load",function(){e+=1,h()}),b};return i.waitForRequestsToFinish=function(){return f=!0,h(),g.promise},i},c}(g,e),i=function(){"use strict";var a={},b=function(a){return Array.prototype.slice.call(a)};a.addClassName=function(a,b){a.className+=" "+b},a.addClassNameRecursively=function(b,c){a.addClassName(b,c),b.parentNode!==b.ownerDocument&&a.addClassNameRecursively(b.parentNode,c)};var c=function(a,c){var d=a.parentStyleSheet,e=b(d.cssRules).indexOf(a);d.insertRule(c,e+1),d.deleteRule(e)},d=function(a,b){var d=a.cssText.replace(/^[^\{]+/,""),e=b+" "+d;c(a,e)},e=function(a){return b(a).reduce(function(a,b){return a+b.cssText},"")},f=function(a){a.textContent=e(a.sheet.cssRules)},g=function(a){var b=document.implementation.createHTMLDocument(""),c=document.createElement("style");c.textContent=a.textContent,b.body.appendChild(c),a.sheet=c.sheet},h=function(a){return"((?:^|[^.#:\\w])|(?=\\W))("+a.join("|")+")(?=\\W|$)"},i=function(a,c,e){var i=h(c);b(a.querySelectorAll("style")).forEach(function(a){"undefined"==typeof a.sheet&&g(a);var c=b(a.sheet.cssRules).filter(function(a){return a.selectorText&&new RegExp(i,"i").test(a.selectorText)});c.length&&(c.forEach(function(a){var b=a.selectorText.replace(new RegExp(i,"gi"),function(a,b,c){return b+e(c)});b!==a.selectorText&&d(a,b)}),f(a))})};return a.rewriteCssSelectorWith=function(a,b,c){i(a,[b],function(){return c})},a.lowercaseCssTypeSelectors=function(a,b){i(a,b,function(a){return a.toLowerCase()})},a.findHtmlOnlyNodeNames=function(a){var b,c=a.ownerDocument.createTreeWalker(a,NodeFilter.SHOW_ELEMENT),d={},e={};do b=c.currentNode.tagName.toLowerCase(),"http://www.w3.org/1999/xhtml"===c.currentNode.namespaceURI?d[b]=!0:e[b]=!0;while(c.nextNode());return Object.keys(d).filter(function(a){return!e[a]})},a}(),j=function(a){"use strict";var b={},c=function(a){return Array.prototype.slice.call(a)},d={active:!0,hover:!0,focus:!1,target:!1};return b.fakeUserAction=function(b,c,e){var f=b.querySelector(c),g=":"+e,h="rasterizehtml"+e;f&&(d[e]?a.addClassNameRecursively(f,h):a.addClassName(f,h),a.rewriteCssSelectorWith(b,g,"."+h))},b.persistInputValues=function(a){var b=a.querySelectorAll("input"),d=a.querySelectorAll("textarea"),e=function(a){return"checkbox"===a.type||"radio"===a.type};c(b).filter(e).forEach(function(a){a.checked?a.setAttribute("checked",""):a.removeAttribute("checked")}),c(b).filter(function(a){return!e(a)}).forEach(function(a){a.setAttribute("value",a.value)}),c(d).forEach(function(a){a.textContent=a.value})},b.rewriteTagNameSelectorsToLowerCase=function(b){a.lowercaseCssTypeSelectors(b,a.findHtmlOnlyNodeNames(b))},b}(i),k=function(a){"use strict";var b,c={},d=function(){var a='<svg id="svg" xmlns="http://www.w3.org/2000/svg" width="10" height="10"><style>@media (max-width: 1em) { svg { background: #00f; } }</style></svg>',b="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(a),c=document.createElement("img");return c.src=b,c},f=function(a,b,c,d){var e=document.createElement("canvas");e.width=a.width,e.height=a.height;var f,g=e.getContext("2d");return g.drawImage(a,0,0),f=g.getImageData(0,0,1,1).data,f[0]===b&&f[1]===c&&f[2]===d},g=function(){var a=d(),b=e.defer();return document.querySelector("body").appendChild(a),a.onload=function(){document.querySelector("body").removeChild(a);try{b.resolve(!f(a,0,0,255))}catch(a){b.resolve(!0)}},a.onerror=function(){b.reject()},b.promise};c.needsEmWorkaround=function(){return void 0===b&&(b=g()),b};var h=function(a){return Array.prototype.slice.call(a)},i=function(a){return h(a).map(function(a){return a.cssText}).join("\n")},j=function(a,b){return"@media "+a+"{"+i(b)+"}"},k=function(a,b,c){try{a.insertRule(c,b+1)}catch(a){return}a.deleteRule(b)},l=function(a,b){var c=a.parentStyleSheet,d=h(c.cssRules).indexOf(a);k(c,d,b)},m=function(a){a.textContent=i(a.sheet.cssRules)},n=function(a){var b=a.modifier?a.modifier+"-"+a.feature:a.feature;return a.value?"("+b+": "+a.value+")":"("+b+")"},o=function(a){var b=[];return a.inverse&&b.push("not"),b.push(a.type),a.expressions.length>0&&b.push("and "+a.expressions.map(n).join(" and ")),b.join(" ")};c.serializeQuery=function(a){var b=a.map(o);return b.join(", ")};var p=function(a){return 16*a},q=function(a){var b=/^((?:\d+\.)?\d+)em/.exec(a);return b?p(parseFloat(b[1]))+"px":a},r=function(b){var d=a.parse(b),e=!1;if(d.forEach(function(a){a.expressions.forEach(function(a){var b=q(a.value);e|=b!==a.value,a.value=b})}),e)return c.serializeQuery(d)},s=function(a){var b=!1;return a.forEach(function(a){var c=r(a.media.mediaText);c&&l(a,j(c,a.cssRules)),b|=!!c}),b};return c.workAroundWebKitEmSizeIssue=function(a){var b=a.querySelectorAll("style");h(b).forEach(function(a){var b=h(a.sheet.cssRules).filter(function(a){return a.type===window.CSSRule.MEDIA_RULE}),c=s(b);c&&m(a)})},c}(b),l=function(a,b,c,d,e){"use strict";var f={},g=function(a,b,c,d){var e=a.createElement(b);return e.style.visibility="hidden",e.style.width=c+"px",e.style.height=d+"px",e.style.position="absolute",e.style.top=-1e4-d+"px",e.style.left=-1e4-c+"px",a.getElementsByTagName("body")[0].appendChild(e),e};f.executeJavascript=function(a,d){var f=g(e.document,"iframe",d.width,d.height),h=a.outerHTML,i=[],j=c.defer(),k=d.executeJsTimeout||0,l=function(){var a=f.contentDocument;e.document.getElementsByTagName("body")[0].removeChild(f),j.resolve({document:a,errors:i})},m=function(){var a=c.defer();return k>0?setTimeout(a.resolve,k):a.resolve(),a.promise},n=f.contentWindow.XMLHttpRequest,o=b.finishNotifyingXhr(n),p=b.baseUrlRespectingXhr(o,d.baseUrl);return f.onload=function(){m().then(o.waitForRequestsToFinish).then(l)},f.contentDocument.open(),f.contentWindow.XMLHttpRequest=p,f.contentWindow.onerror=function(a){i.push({resourceType:"scriptExecution",msg:a})},f.contentDocument.write("<!DOCTYPE html>"),f.contentDocument.write(h),f.contentDocument.close(),j.promise};var h=function(a,b,c){var d=a.createElement("iframe");return d.style.width=b+"px",d.style.height=c+"px",d.style.visibility="hidden",d.style.position="absolute",d.style.top=-1e4-c+"px",d.style.left=-1e4-b+"px",d.sandbox="allow-same-origin",d.scrolling="no",d},i=function(a,b,c){var d=Math.floor(a/c),f=Math.floor(b/c);return h(e.document,d,f)},j=function(a,b,c,d){return{width:Math.max(a.width*d,b),height:Math.max(a.height*d,c)}},k=function(a,b){var c=a.querySelector(b);if(c)return c;if(a.ownerDocument.querySelector(b)===a)return a;throw{message:"Clipping selector not found"}},l=function(a,b,c,d,f){var g,h,i,l,m,n,o,p,q=Math.max(a.scrollWidth,a.clientWidth),r=Math.max(a.scrollHeight,a.clientHeight);return b?(n=k(a,b),o=n.getBoundingClientRect(),g=o.top,h=o.left,i=o.width,l=o.height):(g=0,h=0,i=q,l=r),p=j({width:i,height:l},c,d,f),m=e.getComputedStyle(a.ownerDocument.documentElement).fontSize,{left:h,top:g,width:p.width,height:p.height,viewportWidth:q,viewportHeight:r,rootFontSize:m}},m=function(a,b){var c=a.tagName;return b.querySelector(c)},n=function(a){var b=a.tagName.toLowerCase();return"html"===b||"body"===b?a.outerHTML:'<body style="margin: 0;">'+a.outerHTML+"</body>"};f.calculateDocumentContentSize=function(a,b){var d,f=c.defer(),g=b.zoom||1;return d=i(b.width,b.height,g),e.document.getElementsByTagName("body")[0].appendChild(d),d.onload=function(){var c,h=d.contentDocument;try{c=l(m(a,h),b.clip,b.width,b.height,g),f.resolve(c)}catch(a){f.reject(a)}finally{e.document.getElementsByTagName("body")[0].removeChild(d)}},d.contentDocument.open(),d.contentDocument.write("<!DOCTYPE html>"),d.contentDocument.write(n(a)),d.contentDocument.close(),f.promise},f.parseHtmlFragment=function(a){var b=e.document.implementation.createHTMLDocument("");b.documentElement.innerHTML=a;var c=b.querySelector("body").firstChild;if(!c)throw"Invalid source";return c};var o=function(a,b){var c,d,f,g,h=/<html((?:\s+[^>]*)?)>/im.exec(b),i=e.document.implementation.createHTMLDocument("");if(h)for(c="<div"+h[1]+"></div>",i.documentElement.innerHTML=c,f=i.querySelector("div"),d=0;d<f.attributes.length;d++)g=f.attributes[d],a.documentElement.setAttribute(g.name,g.value)};f.parseHTML=function(a){var b=e.document.implementation.createHTMLDocument("");return b.documentElement.innerHTML=a,o(b,a),b};var p=function(a){try{return d.failOnParseError(a)}catch(a){throw{message:"Invalid source",originalError:a}}};f.validateXHTML=function(a){var b=new DOMParser,c=b.parseFromString(a,"application/xml");p(c)};var q=null,r=function(a,b){return"none"===b||"repeated"===b?(null!==q&&"repeated"===b||(q=Date.now()),a+"?_="+q):a},s=function(b,d){var e=new window.XMLHttpRequest,f=a.joinUrl(d.baseUrl,b),g=r(f,d.cache),h=c.defer(),i=function(a){h.reject({message:"Unable to load page",originalError:a})};e.addEventListener("load",function(){200===e.status||0===e.status?h.resolve(e.responseXML):i(e.statusText)},!1),e.addEventListener("error",function(a){i(a)},!1);try{e.open("GET",g,!0),e.responseType="document",e.send(null)}catch(a){i(a)}return h.promise};return f.loadDocument=function(a,b){return s(a,b).then(function(a){return p(a)})},f}(g,h,e,d,window),m=function(a,b){"use strict";var c,d={},e=function(a,b){return b?URL.createObjectURL(new Blob([a],{type:"image/svg+xml"})):"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(a)},f=function(a){a instanceof Blob&&URL.revokeObjectURL(a)},g='<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><foreignObject></foreignObject></svg>',h=function(b){var c=document.createElement("canvas"),d=new Image,e=a.defer();return d.onload=function(){var a=c.getContext("2d");try{a.drawImage(d,0,0),c.toDataURL("image/png"),e.resolve(!0)}catch(a){e.resolve(!1)}},d.onerror=e.reject,d.src=b,e.promise},i=function(){var a=e(g,!0);return h(a).then(function(b){return f(a),!b&&h(e(g,!1)).then(function(a){return a})},function(){return!1})},j=function(){if(b.Blob)try{return new Blob(["<b></b>"],{type:"text/xml"}),!0}catch(a){}return!1},k=function(){var c=a.defer();return j&&b.URL?i().then(function(a){c.resolve(!a)},function(){c.reject()}):c.resolve(!1),c.promise},l=function(){return void 0===c&&(c=k()),c},m=function(a){return l().then(function(b){return e(a,b)})};return d.renderSvg=function(b){var c,d,e=a.defer(),g=function(){d.onload=null,d.onerror=null},h=function(){c&&f(c)};return d=new Image,d.onload=function(){g(),h(),e.resolve(d)},d.onerror=function(){h(),e.reject()},m(b).then(function(a){c=a,d.src=c},e.reject),e.promise},d}(e,window),n=function(a,b,c,d,e){"use strict";var f={},g=function(a,b){var c=b||1,d={width:a.width,height:a.height,"font-size":a.rootFontSize};return 1!==c&&(d.style="transform:scale("+c+"); transform-origin: 0 0;"),d},h=function(a){var b,c,d,e;b=Math.round(a.viewportWidth),c=Math.round(a.viewportHeight),d=-a.left,e=-a.top;var f={x:d,y:e,width:b,height:c};return f},i=function(a){var b=a.style||"";a.style=b+"float: left;"},j=function(a){a.externalResourcesRequired=!0},k=function(){return'<style scoped="">html::-webkit-scrollbar { display: none; }</style>'},l=function(a){var b=Object.keys(a);return b.length?" "+b.map(function(b){return b+'="'+a[b]+'"'}).join(" "):""},m=function(a,c,d){var f=e.serializeToString(a);b.validateXHTML(f);var m=h(c);return i(m),j(m),'<svg xmlns="http://www.w3.org/2000/svg"'+l(g(c,d))+">"+k()+"<foreignObject"+l(m)+">"+f+"</foreignObject></svg>"};return f.getSvgForDocument=function(a,b,e){return c.rewriteTagNameSelectorsToLowerCase(a),d.needsEmWorkaround().then(function(c){return c&&d.workAroundWebKitEmSizeIssue(a),m(a,b,e)})},f.drawDocumentAsSvg=function(a,d){return["hover","active","focus","target"].forEach(function(b){d[b]&&c.fakeUserAction(a,d[b],b)}),b.calculateDocumentContentSize(a,d).then(function(b){return f.getSvgForDocument(a,b,d.zoom)})},f}(g,l,j,k,c),o=function(a,b,c,d,e,f){"use strict";var g={},h=function(a){return{message:"Error rendering page",originalError:a}},i=function(a){return e.renderSvg(a).then(function(b){return{image:b,svg:a}},function(a){throw h(a)})},j=function(a,b){try{b.getContext("2d").drawImage(a,0,0)}catch(a){throw h(a)}},k=function(a,b,c){return d.drawDocumentAsSvg(a,c).then(i).then(function(a){return b&&j(a.image,b),a})},l=function(a,d){return b.executeJavascript(a,d).then(function(a){var b=a.document;return c.persistInputValues(b),{document:b,errors:a.errors}})};return g.rasterize=function(b,c,d){var e;return e=a.clone(d),e.inlineScripts=d.executeJs===!0,f.inlineReferences(b,e).then(function(a){return d.executeJs?l(b,d).then(function(b){return{element:b.document.documentElement,errors:a.concat(b.errors)}}):{element:b,errors:a}}).then(function(a){return k(a.element,c,d).then(function(b){return{image:b.image,svg:b.svg,errors:a.errors}})})},g}(g,l,j,n,m,f),p=function(a,b,c){"use strict";var d={},e=function(a,b){var c=300,d=200,e=a?a.width:c,f=a?a.height:d,g=void 0!==b.width?b.width:e,h=void 0!==b.height?b.height:f;return{width:g,height:h}},f=function(b){var c,d=e(b.canvas,b.options);return c=a.clone(b.options),c.width=d.width,c.height=d.height,c};d.drawDocument=function(){var b=arguments[0],d=Array.prototype.slice.call(arguments,1),e=a.parseOptionalParameters(d),g=b.documentElement?b.documentElement:b;return c.rasterize(g,e.canvas,f(e))};var g=function(a,c,e){var f=b.parseHTML(a);return d.drawDocument(f,c,e)};d.drawHTML=function(){var b=arguments[0],c=Array.prototype.slice.call(arguments,1),d=a.parseOptionalParameters(c);return g(b,d.canvas,d.options)};var h=function(b,c,d){var e=document.implementation.createHTMLDocument("");e.replaceChild(b.documentElement,e.documentElement);var f=d?a.clone(d):{};return d.baseUrl||(f.baseUrl=c),{document:e,options:f}},i=function(a,c,e){return b.loadDocument(a,e).then(function(b){var f=h(b,a,e);return d.drawDocument(f.document,c,f.options)})};return d.drawURL=function(){var b=arguments[0],c=Array.prototype.slice.call(arguments,1),d=a.parseOptionalParameters(c);return i(b,d.canvas,d.options)},d}(g,l,o);return p})},{ayepromise:2,"css-mediaquery":8,inlineresources:29,"sane-domparser-error":38,url:3,xmlserializer:39}],2:[function(b,c,d){!function(b,e){"function"==typeof a&&a.amd?a(e):"object"==typeof d?c.exports=e():b.ayepromise=e()}(this,function(){"use strict";var a={},b=function(){var a=!1;return function(b){return function(){a||(a=!0,b.apply(null,arguments))}}},c=function(a){var b=a&&a.then;if("object"==typeof a&&"function"==typeof b)return function(){return b.apply(a,arguments)}},d=function(b,c){var d=a.defer(),e=function(a,b){setTimeout(function(){var c;try{c=a(b)}catch(a){return void d.reject(a)}c===d.promise?d.reject(new TypeError("Cannot resolve promise with itself")):d.resolve(c)},1)},g=function(a){b&&b.call?e(b,a):d.resolve(a)},h=function(a){c&&c.call?e(c,a):d.reject(a)};return{promise:d.promise,handle:function(a,b){a===f?g(b):h(b)}}},e=0,f=1,g=2;return a.defer=function(){var a,h=e,i=[],j=function(b,c){h=b,a=c,i.forEach(function(b){b.handle(h,a)}),i=null},k=function(a){j(f,a)},l=function(a){j(g,a)},m=function(b,c){var f=d(b,c);return h===e?i.push(f):f.handle(h,a),f.promise},n=function(a){var c=b();try{a(c(o),c(l))}catch(a){c(l)(a)}},o=function(a){var b;try{b=c(a)}catch(a){return void l(a)}b?n(b):k(a)},p=b();return{resolve:p(o),reject:p(l),promise:{then:m,fail:function(a){return m(null,a)}}}},a})},{}],3:[function(a,b,c){"use strict";function d(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}function e(a,b,c){if(a&&j.isObject(a)&&a instanceof d)return a;var e=new d;return e.parse(a,b,c),e}function f(a){return j.isString(a)&&(a=e(a)),a instanceof d?a.format():d.prototype.format.call(a)}function g(a,b){return e(a,!1,!0).resolve(b)}function h(a,b){return a?e(a,!1,!0).resolveObject(b):b}var i=a("punycode"),j=a("./util");c.parse=e,c.resolve=g,c.resolveObject=h,c.format=f,c.Url=d;var k=/^([a-z0-9.+-]+:)/i,l=/:[0-9]*$/,m=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,n=["<",">",'"',"`"," ","\r","\n","\t"],o=["{","}","|","\\","^","`"].concat(n),p=["'"].concat(o),q=["%","/","?",";","#"].concat(p),r=["/","?","#"],s=255,t=/^[+a-z0-9A-Z_-]{0,63}$/,u=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,v={javascript:!0,"javascript:":!0},w={javascript:!0,"javascript:":!0},x={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},y=a("querystring");d.prototype.parse=function(a,b,c){if(!j.isString(a))throw new TypeError("Parameter 'url' must be a string, not "+typeof a);var d=a.indexOf("?"),e=d!==-1&&d<a.indexOf("#")?"?":"#",f=a.split(e),g=/\\/g;f[0]=f[0].replace(g,"/"),a=f.join(e);var h=a;if(h=h.trim(),!c&&1===a.split("#").length){var l=m.exec(h);if(l)return this.path=h,this.href=h,this.pathname=l[1],l[2]?(this.search=l[2],b?this.query=y.parse(this.search.substr(1)):this.query=this.search.substr(1)):b&&(this.search="",this.query={}),this}var n=k.exec(h);if(n){n=n[0];var o=n.toLowerCase();this.protocol=o,h=h.substr(n.length)}if(c||n||h.match(/^\/\/[^@\/]+@[^@\/]+/)){var z="//"===h.substr(0,2);!z||n&&w[n]||(h=h.substr(2),this.slashes=!0)}if(!w[n]&&(z||n&&!x[n])){for(var A=-1,B=0;B<r.length;B++){var C=h.indexOf(r[B]);C!==-1&&(A===-1||C<A)&&(A=C)}var D,E;E=A===-1?h.lastIndexOf("@"):h.lastIndexOf("@",A),E!==-1&&(D=h.slice(0,E),h=h.slice(E+1),this.auth=decodeURIComponent(D)),A=-1;for(var B=0;B<q.length;B++){var C=h.indexOf(q[B]);C!==-1&&(A===-1||C<A)&&(A=C)}A===-1&&(A=h.length),this.host=h.slice(0,A),h=h.slice(A),this.parseHost(),this.hostname=this.hostname||"";var F="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!F)for(var G=this.hostname.split(/\./),B=0,H=G.length;B<H;B++){var I=G[B];if(I&&!I.match(t)){for(var J="",K=0,L=I.length;K<L;K++)J+=I.charCodeAt(K)>127?"x":I[K];if(!J.match(t)){var M=G.slice(0,B),N=G.slice(B+1),O=I.match(u);O&&(M.push(O[1]),N.unshift(O[2])),N.length&&(h="/"+N.join(".")+h),this.hostname=M.join(".");break}}}this.hostname.length>s?this.hostname="":this.hostname=this.hostname.toLowerCase(),F||(this.hostname=i.toASCII(this.hostname));var P=this.port?":"+this.port:"",Q=this.hostname||"";this.host=Q+P,this.href+=this.host,F&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==h[0]&&(h="/"+h))}if(!v[o])for(var B=0,H=p.length;B<H;B++){var R=p[B];if(h.indexOf(R)!==-1){var S=encodeURIComponent(R);S===R&&(S=escape(R)),h=h.split(R).join(S)}}var T=h.indexOf("#");T!==-1&&(this.hash=h.substr(T),h=h.slice(0,T));var U=h.indexOf("?");if(U!==-1?(this.search=h.substr(U),this.query=h.substr(U+1),b&&(this.query=y.parse(this.query)),h=h.slice(0,U)):b&&(this.search="",this.query={}),h&&(this.pathname=h),x[o]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){var P=this.pathname||"",V=this.search||"";this.path=P+V}return this.href=this.format(),this},d.prototype.format=function(){var a=this.auth||"";a&&(a=encodeURIComponent(a),a=a.replace(/%3A/i,":"),a+="@");var b=this.protocol||"",c=this.pathname||"",d=this.hash||"",e=!1,f="";this.host?e=a+this.host:this.hostname&&(e=a+(this.hostname.indexOf(":")===-1?this.hostname:"["+this.hostname+"]"),this.port&&(e+=":"+this.port)),this.query&&j.isObject(this.query)&&Object.keys(this.query).length&&(f=y.stringify(this.query));var g=this.search||f&&"?"+f||"";return b&&":"!==b.substr(-1)&&(b+=":"),this.slashes||(!b||x[b])&&e!==!1?(e="//"+(e||""),c&&"/"!==c.charAt(0)&&(c="/"+c)):e||(e=""),d&&"#"!==d.charAt(0)&&(d="#"+d),g&&"?"!==g.charAt(0)&&(g="?"+g),c=c.replace(/[?#]/g,function(a){return encodeURIComponent(a)}),g=g.replace("#","%23"),b+e+c+g+d},d.prototype.resolve=function(a){return this.resolveObject(e(a,!1,!0)).format()},d.prototype.resolveObject=function(a){if(j.isString(a)){var b=new d;b.parse(a,!1,!0),a=b}for(var c=new d,e=Object.keys(this),f=0;f<e.length;f++){var g=e[f];c[g]=this[g]}if(c.hash=a.hash,""===a.href)return c.href=c.format(),c;if(a.slashes&&!a.protocol){for(var h=Object.keys(a),i=0;i<h.length;i++){var k=h[i];"protocol"!==k&&(c[k]=a[k])}return x[c.protocol]&&c.hostname&&!c.pathname&&(c.path=c.pathname="/"),c.href=c.format(),c}if(a.protocol&&a.protocol!==c.protocol){if(!x[a.protocol]){for(var l=Object.keys(a),m=0;m<l.length;m++){var n=l[m];c[n]=a[n]}return c.href=c.format(),c}if(c.protocol=a.protocol,a.host||w[a.protocol])c.pathname=a.pathname;else{for(var o=(a.pathname||"").split("/");o.length&&!(a.host=o.shift()););a.host||(a.host=""),a.hostname||(a.hostname=""),""!==o[0]&&o.unshift(""),o.length<2&&o.unshift(""),c.pathname=o.join("/")}if(c.search=a.search,c.query=a.query,c.host=a.host||"",c.auth=a.auth,c.hostname=a.hostname||a.host,c.port=a.port,c.pathname||c.search){var p=c.pathname||"",q=c.search||"";c.path=p+q}return c.slashes=c.slashes||a.slashes,c.href=c.format(),c}var r=c.pathname&&"/"===c.pathname.charAt(0),s=a.host||a.pathname&&"/"===a.pathname.charAt(0),t=s||r||c.host&&a.pathname,u=t,v=c.pathname&&c.pathname.split("/")||[],o=a.pathname&&a.pathname.split("/")||[],y=c.protocol&&!x[c.protocol];if(y&&(c.hostname="",c.port=null,c.host&&(""===v[0]?v[0]=c.host:v.unshift(c.host)),c.host="",a.protocol&&(a.hostname=null,a.port=null,a.host&&(""===o[0]?o[0]=a.host:o.unshift(a.host)),a.host=null),t=t&&(""===o[0]||""===v[0])),s)c.host=a.host||""===a.host?a.host:c.host,c.hostname=a.hostname||""===a.hostname?a.hostname:c.hostname,c.search=a.search,c.query=a.query,v=o;else if(o.length)v||(v=[]),v.pop(),v=v.concat(o),c.search=a.search,c.query=a.query;else if(!j.isNullOrUndefined(a.search)){if(y){c.hostname=c.host=v.shift();var z=!!(c.host&&c.host.indexOf("@")>0)&&c.host.split("@");z&&(c.auth=z.shift(),c.host=c.hostname=z.shift())}return c.search=a.search,c.query=a.query,j.isNull(c.pathname)&&j.isNull(c.search)||(c.path=(c.pathname?c.pathname:"")+(c.search?c.search:"")),c.href=c.format(),c}if(!v.length)return c.pathname=null,c.search?c.path="/"+c.search:c.path=null,c.href=c.format(),c;for(var A=v.slice(-1)[0],B=(c.host||a.host||v.length>1)&&("."===A||".."===A)||""===A,C=0,D=v.length;D>=0;D--)A=v[D],"."===A?v.splice(D,1):".."===A?(v.splice(D,1),C++):C&&(v.splice(D,1),C--);if(!t&&!u)for(;C--;C)v.unshift("..");!t||""===v[0]||v[0]&&"/"===v[0].charAt(0)||v.unshift(""),B&&"/"!==v.join("/").substr(-1)&&v.push("");var E=""===v[0]||v[0]&&"/"===v[0].charAt(0);if(y){c.hostname=c.host=E?"":v.length?v.shift():"";var z=!!(c.host&&c.host.indexOf("@")>0)&&c.host.split("@");z&&(c.auth=z.shift(),c.host=c.hostname=z.shift())}return t=t||c.host&&v.length,t&&!E&&v.unshift(""),v.length?c.pathname=v.join("/"):(c.pathname=null,c.path=null),j.isNull(c.pathname)&&j.isNull(c.search)||(c.path=(c.pathname?c.pathname:"")+(c.search?c.search:"")),c.auth=a.auth||c.auth,c.slashes=c.slashes||a.slashes,c.href=c.format(),c},d.prototype.parseHost=function(){var a=this.host,b=l.exec(a);b&&(b=b[0],":"!==b&&(this.port=b.substr(1)),a=a.substr(0,a.length-b.length)),a&&(this.hostname=a)}},{"./util":4,punycode:34,querystring:37}],4:[function(a,b,c){"use strict";b.exports={isString:function(a){return"string"==typeof a},isObject:function(a){return"object"==typeof a&&null!==a},isNull:function(a){return null===a},isNullOrUndefined:function(a){return null==a}}},{}],5:[function(a,b,c){b.exports=function(){function b(a,b){function c(){this.constructor=a}c.prototype=b.prototype,a.prototype=new c}function c(a,b,c,d,e,f){this.message=a,this.expected=b,this.found=c,this.offset=d,this.line=e,this.column=f,this.name="SyntaxError"}function d(b){function d(a){function c(a,c,d){var e,f;for(e=c;e<d;e++)f=b.charAt(e),"\n"===f?(a.seenCR||a.line++,a.column=1,a.seenCR=!1):"\r"===f||"\u2028"===f||"\u2029"===f?(a.line++,a.column=1,a.seenCR=!0):(a.column++,a.seenCR=!1)}return T!==a&&(T>a&&(T=0,U={line:1,column:1,seenCR:!1}),c(U,T,a),T=a),U}function e(a){R<V||(R>V&&(V=R,W=[]),W.push(a))}function f(a,e,f){function g(a){var b=1;for(a.sort(function(a,b){return a.description<b.description?-1:a.description>b.description?1:0});b<a.length;)a[b-1]===a[b]?a.splice(b,1):b++}function h(a,b){function c(a){function b(a){return a.charCodeAt(0).toString(16).toUpperCase()}return a.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\x08/g,"\\b").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f").replace(/\r/g,"\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function(a){return"\\x0"+b(a)}).replace(/[\x10-\x1F\x80-\xFF]/g,function(a){return"\\x"+b(a)}).replace(/[\u0180-\u0FFF]/g,function(a){return"\\u0"+b(a)}).replace(/[\u1080-\uFFFF]/g,function(a){return"\\u"+b(a)})}var d,e,f,g=new Array(a.length);for(f=0;f<a.length;f++)g[f]=a[f].description;return d=a.length>1?g.slice(0,-1).join(", ")+" or "+g[a.length-1]:g[0],e=b?'"'+c(b)+'"':"end of input","Expected "+d+" but "+e+" found."}var i=d(f),j=f<b.length?b.charAt(f):null;return null!==e&&g(e),new c(null!==a?a:h(e,j),e,j,f,i.line,i.column)}function g(){var a,b;return a=h(),a===r&&(a=R,b=[],b!==r&&(S=a,b=u()),a=b),a}function h(){var a,c,d,f,g,j;if(a=R,c=i(),c!==r){for(d=[],f=o();f!==r;)d.push(f),f=o();if(d!==r)if(44===b.charCodeAt(R)?(f=w,R++):(f=r,0===X&&e(x)),f!==r){for(g=[],j=o();j!==r;)g.push(j),j=o();g!==r?(j=h(),j!==r?(S=a,c=y(c,j),a=c):(R=a,a=v)):(R=a,a=v)}else R=a,a=v;else R=a,a=v}else R=a,a=v;return a===r&&(a=R,c=i(),c!==r&&(S=a,c=z(c)),a=c),a}function i(){var a;return a=j(),a===r&&(a=m()),a}function j(){var a,b,c,d;if(a=R,b=k(),b!==r){if(c=[],d=o(),d!==r)for(;d!==r;)c.push(d),d=o();else c=v;c!==r?(d=l(),d!==r?(S=a,b=A(b,d),a=b):(R=a,a=v)):(R=a,a=v)}else R=a,a=v;return a===r&&(a=R,b=k(),b!==r&&(S=a,b=B(b)),a=b),a}function k(){var a,c,d,f;return a=R,b.substr(R,4)===C?(c=C,R+=4):(c=r,0===X&&e(D)),c!==r?(d=n(),d!==r?(41===b.charCodeAt(R)?(f=E,R++):(f=r,0===X&&e(F)),f!==r?(S=a,c=G(d),a=c):(R=a,a=v)):(R=a,a=v)):(R=a,a=v),a}function l(){var a,c,d,f;return a=R,b.substr(R,7)===H?(c=H,R+=7):(c=r,0===X&&e(I)),c!==r?(d=n(),d!==r?(41===b.charCodeAt(R)?(f=E,R++):(f=r,0===X&&e(F)),f!==r?(S=a,c=G(d),a=c):(R=a,a=v)):(R=a,a=v)):(R=a,a=v),a}function m(){var a,c,d,f;return a=R,b.substr(R,6)===J?(c=J,R+=6):(c=r,0===X&&e(K)),c!==r?(d=n(),d!==r?(41===b.charCodeAt(R)?(f=E,R++):(f=r,0===X&&e(F)),f!==r?(S=a,c=L(d),a=c):(R=a,a=v)):(R=a,a=v)):(R=a,a=v),a}function n(){var a,c,d;if(a=R,c=[],M.test(b.charAt(R))?(d=b.charAt(R),R++):(d=r,0===X&&e(N)),d!==r)for(;d!==r;)c.push(d),M.test(b.charAt(R))?(d=b.charAt(R),R++):(d=r,0===X&&e(N));else c=v;return c!==r&&(S=a,c=O(c)),a=c}function o(){var a;return P.test(b.charAt(R))?(a=b.charAt(R),R++):(a=r,0===X&&e(Q)),a}var p,q=arguments.length>1?arguments[1]:{},r={},s={start:g},t=g,u=function(){return[]},v=r,w=",",x={type:"literal",value:",",description:'","'},y=function(a,b){return[a].concat(b)},z=function(a){return[a]},A=function(a,b){return{url:a,format:b}},B=function(a){return{url:a}},C="url(",D={type:"literal",value:"url(",description:'"url("'},E=")",F={type:"literal",value:")",description:'")"'},G=function(a){return a},H="format(",I={type:"literal",value:"format(",description:'"format("'},J="local(",K={type:"literal",value:"local(",description:'"local("'},L=function(a){return{local:a}},M=/^[^)]/,N={type:"class",value:"[^)]",description:"[^)]"},O=function(a){return Y.extractValue(a.join(""))},P=/^[ \t\r\n\f]/,Q={type:"class",value:"[ \\t\\r\\n\\f]",description:"[ \\t\\r\\n\\f]"},R=0,S=0,T=0,U={line:1,column:1,seenCR:!1},V=0,W=[],X=0;if("startRule"in q){if(!(q.startRule in s))throw new Error("Can't start parsing from rule \""+q.startRule+'".');t=s[q.startRule]}var Y=a("../util");if(p=t(),p!==r&&R===b.length)return p;throw p!==r&&R<b.length&&e({type:"end",description:"end of input"}),f(null,W,V)}return b(c,Error),{SyntaxError:c,parse:d}}()},{"../util":7}],6:[function(a,b,c){var d=a("./grammar");c.SyntaxError=function(a,b){this.message=a,this.offset=b},c.parse=function(a){try{return d.parse(a)}catch(a){throw new c.SyntaxError(a.message,a.offset)}},c.serialize=function(a){return a.map(function(a){var b;return a.url?(b='url("'+a.url+'")',a.format&&(b+=' format("'+a.format+'")')):b='local("'+a.local+'")',b}).join(", ")}},{"./grammar":5}],7:[function(a,b,c){var d=function(a){var b=/^[\t\r\f\n ]*(.+?)[\t\r\f\n ]*$/;return a.replace(b,"$1")},e=function(a){var b=/^"(.*)"$/,c=/^'(.*)'$/;return b.test(a)?a.replace(b,"$1"):c.test(a)?a.replace(c,"$1"):a};c.extractValue=function(a){return e(d(a))}},{}],8:[function(a,b,c){"use strict";function d(a,b){return e(a).some(function(a){var c=a.inverse,d="all"===a.type||b.type===a.type;if(d&&c||!d&&!c)return!1;var e=a.expressions.every(function(a){var c=a.feature,d=a.modifier,e=a.value,i=b[c];if(!i)return!1;switch(c){case"orientation":case"scan":return i.toLowerCase()===e.toLowerCase();case"width":case"height":case"device-width":case"device-height":e=h(e),i=h(i);break;case"resolution":e=g(e),i=g(i);break;case"aspect-ratio":case"device-aspect-ratio":case"device-pixel-ratio":e=f(e),i=f(i);break;case"grid":case"color":case"color-index":case"monochrome":e=parseInt(e,10)||1,i=parseInt(i,10)||0}switch(d){case"min":return i>=e;case"max":return i<=e;default:return i===e}});return e&&!c||!e&&c})}function e(a){return a.split(",").map(function(a){a=a.trim();var b=a.match(i),c=b[1],d=b[2],e=b[3]||"",f={};return f.inverse=!!c&&"not"===c.toLowerCase(),f.type=d?d.toLowerCase():"all",e=e.match(/\([^\)]+\)/g)||[],f.expressions=e.map(function(a){var b=a.match(j),c=b[1].toLowerCase().match(k);return{modifier:c[1],feature:c[2],value:b[2]}}),f})}function f(a){var b,c=Number(a);return c||(b=a.match(/^(\d+)\s*\/\s*(\d+)$/),c=b[1]/b[2]),c}function g(a){var b=parseFloat(a),c=String(a).match(m)[1];switch(c){case"dpcm":return b/2.54;case"dppx":return 96*b;default:return b}}function h(a){var b=parseFloat(a),c=String(a).match(l)[1];switch(c){case"em":return 16*b;case"rem":return 16*b;case"cm":return 96*b/2.54;case"mm":return 96*b/2.54/10;case"in":return 96*b;case"pt":return 72*b;case"pc":return 72*b/12;
default:return b}}c.match=d,c.parse=e;var i=/(?:(only|not)?\s*([^\s\(\)]+)(?:\s*and)?\s*)?(.+)?/i,j=/\(\s*([^\s\:\)]+)\s*(?:\:\s*([^\s\)]+))?\s*\)/,k=/^(?:(min|max)-)?(.+)/,l=/(em|rem|px|cm|mm|in|pt|pc)?$/,m=/(dpi|dpcm|dppx)?$/},{}],9:[function(a,b,c){var d={CSSRule:a("./CSSRule").CSSRule,MatcherList:a("./MatcherList").MatcherList};d.CSSDocumentRule=function(){d.CSSRule.call(this),this.matcher=new d.MatcherList,this.cssRules=[]},d.CSSDocumentRule.prototype=new d.CSSRule,d.CSSDocumentRule.prototype.constructor=d.CSSDocumentRule,d.CSSDocumentRule.prototype.type=10,Object.defineProperty(d.CSSDocumentRule.prototype,"cssText",{get:function(){for(var a=[],b=0,c=this.cssRules.length;b<c;b++)a.push(this.cssRules[b].cssText);return"@-moz-document "+this.matcher.matcherText+" {"+a.join("")+"}"}}),c.CSSDocumentRule=d.CSSDocumentRule},{"./CSSRule":15,"./MatcherList":21}],10:[function(a,b,c){var d={CSSStyleDeclaration:a("./CSSStyleDeclaration").CSSStyleDeclaration,CSSRule:a("./CSSRule").CSSRule};d.CSSFontFaceRule=function(){d.CSSRule.call(this),this.style=new d.CSSStyleDeclaration,this.style.parentRule=this},d.CSSFontFaceRule.prototype=new d.CSSRule,d.CSSFontFaceRule.prototype.constructor=d.CSSFontFaceRule,d.CSSFontFaceRule.prototype.type=5,Object.defineProperty(d.CSSFontFaceRule.prototype,"cssText",{get:function(){return"@font-face {"+this.style.cssText+"}"}}),c.CSSFontFaceRule=d.CSSFontFaceRule},{"./CSSRule":15,"./CSSStyleDeclaration":16}],11:[function(a,b,c){var d={CSSRule:a("./CSSRule").CSSRule,CSSStyleSheet:a("./CSSStyleSheet").CSSStyleSheet,MediaList:a("./MediaList").MediaList};d.CSSImportRule=function(){d.CSSRule.call(this),this.href="",this.media=new d.MediaList,this.styleSheet=new d.CSSStyleSheet},d.CSSImportRule.prototype=new d.CSSRule,d.CSSImportRule.prototype.constructor=d.CSSImportRule,d.CSSImportRule.prototype.type=3,Object.defineProperty(d.CSSImportRule.prototype,"cssText",{get:function(){var a=this.media.mediaText;return"@import url("+this.href+")"+(a?" "+a:"")+";"},set:function(a){for(var b,c,d=0,e="",f="";c=a.charAt(d);d++)switch(c){case" ":case"\t":case"\r":case"\n":case"\f":"after-import"===e?e="url":f+=c;break;case"@":e||a.indexOf("@import",d)!==d||(e="after-import",d+="import".length,f="");break;case"u":if("url"===e&&a.indexOf("url(",d)===d){if(b=a.indexOf(")",d+1),b===-1)throw d+': ")" not found';d+="url(".length;var g=a.slice(d,b);g[0]===g[g.length-1]&&('"'!==g[0]&&"'"!==g[0]||(g=g.slice(1,-1))),this.href=g,d=b,e="media"}break;case'"':if("url"===e){if(b=a.indexOf('"',d+1),!b)throw d+": '\"' not found";this.href=a.slice(d+1,b),d=b,e="media"}break;case"'":if("url"===e){if(b=a.indexOf("'",d+1),!b)throw d+': "\'" not found';this.href=a.slice(d+1,b),d=b,e="media"}break;case";":"media"===e&&f&&(this.media.mediaText=f.trim());break;default:"media"===e&&(f+=c)}}}),c.CSSImportRule=d.CSSImportRule},{"./CSSRule":15,"./CSSStyleSheet":18,"./MediaList":22}],12:[function(a,b,c){var d={CSSRule:a("./CSSRule").CSSRule,CSSStyleDeclaration:a("./CSSStyleDeclaration").CSSStyleDeclaration};d.CSSKeyframeRule=function(){d.CSSRule.call(this),this.keyText="",this.style=new d.CSSStyleDeclaration,this.style.parentRule=this},d.CSSKeyframeRule.prototype=new d.CSSRule,d.CSSKeyframeRule.prototype.constructor=d.CSSKeyframeRule,d.CSSKeyframeRule.prototype.type=9,Object.defineProperty(d.CSSKeyframeRule.prototype,"cssText",{get:function(){return this.keyText+" {"+this.style.cssText+"} "}}),c.CSSKeyframeRule=d.CSSKeyframeRule},{"./CSSRule":15,"./CSSStyleDeclaration":16}],13:[function(a,b,c){var d={CSSRule:a("./CSSRule").CSSRule};d.CSSKeyframesRule=function(){d.CSSRule.call(this),this.name="",this.cssRules=[]},d.CSSKeyframesRule.prototype=new d.CSSRule,d.CSSKeyframesRule.prototype.constructor=d.CSSKeyframesRule,d.CSSKeyframesRule.prototype.type=8,Object.defineProperty(d.CSSKeyframesRule.prototype,"cssText",{get:function(){for(var a=[],b=0,c=this.cssRules.length;b<c;b++)a.push("  "+this.cssRules[b].cssText);return"@"+(this._vendorPrefix||"")+"keyframes "+this.name+" { \n"+a.join("\n")+"\n}"}}),c.CSSKeyframesRule=d.CSSKeyframesRule},{"./CSSRule":15}],14:[function(a,b,c){var d={CSSRule:a("./CSSRule").CSSRule,MediaList:a("./MediaList").MediaList};d.CSSMediaRule=function(){d.CSSRule.call(this),this.media=new d.MediaList,this.cssRules=[]},d.CSSMediaRule.prototype=new d.CSSRule,d.CSSMediaRule.prototype.constructor=d.CSSMediaRule,d.CSSMediaRule.prototype.type=4,Object.defineProperty(d.CSSMediaRule.prototype,"cssText",{get:function(){for(var a=[],b=0,c=this.cssRules.length;b<c;b++)a.push(this.cssRules[b].cssText);return"@media "+this.media.mediaText+" {"+a.join("")+"}"}}),c.CSSMediaRule=d.CSSMediaRule},{"./CSSRule":15,"./MediaList":22}],15:[function(a,b,c){var d={};d.CSSRule=function(){this.parentRule=null,this.parentStyleSheet=null},d.CSSRule.UNKNOWN_RULE=0,d.CSSRule.STYLE_RULE=1,d.CSSRule.CHARSET_RULE=2,d.CSSRule.IMPORT_RULE=3,d.CSSRule.MEDIA_RULE=4,d.CSSRule.FONT_FACE_RULE=5,d.CSSRule.PAGE_RULE=6,d.CSSRule.KEYFRAMES_RULE=7,d.CSSRule.KEYFRAME_RULE=8,d.CSSRule.MARGIN_RULE=9,d.CSSRule.NAMESPACE_RULE=10,d.CSSRule.COUNTER_STYLE_RULE=11,d.CSSRule.SUPPORTS_RULE=12,d.CSSRule.DOCUMENT_RULE=13,d.CSSRule.FONT_FEATURE_VALUES_RULE=14,d.CSSRule.VIEWPORT_RULE=15,d.CSSRule.REGION_STYLE_RULE=16,d.CSSRule.prototype={constructor:d.CSSRule},c.CSSRule=d.CSSRule},{}],16:[function(a,b,c){var d={};d.CSSStyleDeclaration=function(){this.length=0,this.parentRule=null,this._importants={}},d.CSSStyleDeclaration.prototype={constructor:d.CSSStyleDeclaration,getPropertyValue:function(a){return this[a]||""},setProperty:function(a,b,c){if(this[a]){var d=Array.prototype.indexOf.call(this,a);d<0&&(this[this.length]=a,this.length++)}else this[this.length]=a,this.length++;this[a]=b,this._importants[a]=c},removeProperty:function(a){if(!(a in this))return"";var b=Array.prototype.indexOf.call(this,a);if(b<0)return"";var c=this[a];return this[a]="",Array.prototype.splice.call(this,b,1),c},getPropertyCSSValue:function(){},getPropertyPriority:function(a){return this._importants[a]||""},getPropertyShorthand:function(){},isPropertyImplicit:function(){},get cssText(){for(var a=[],b=0,c=this.length;b<c;++b){var d=this[b],e=this.getPropertyValue(d),f=this.getPropertyPriority(d);f&&(f=" !"+f),a[b]=d+": "+e+f+";"}return a.join(" ")},set cssText(a){var b,c;for(b=this.length;b--;)c=this[b],this[c]="";Array.prototype.splice.call(this,0,this.length),this._importants={};var e=d.parse("#bogus{"+a+"}").cssRules[0].style,f=e.length;for(b=0;b<f;++b)c=e[b],this.setProperty(e[b],e.getPropertyValue(c),e.getPropertyPriority(c))}},c.CSSStyleDeclaration=d.CSSStyleDeclaration,d.parse=a("./parse").parse},{"./parse":26}],17:[function(a,b,c){var d={CSSStyleDeclaration:a("./CSSStyleDeclaration").CSSStyleDeclaration,CSSRule:a("./CSSRule").CSSRule};d.CSSStyleRule=function(){d.CSSRule.call(this),this.selectorText="",this.style=new d.CSSStyleDeclaration,this.style.parentRule=this},d.CSSStyleRule.prototype=new d.CSSRule,d.CSSStyleRule.prototype.constructor=d.CSSStyleRule,d.CSSStyleRule.prototype.type=1,Object.defineProperty(d.CSSStyleRule.prototype,"cssText",{get:function(){var a;return a=this.selectorText?this.selectorText+" {"+this.style.cssText+"}":""},set:function(a){var b=d.CSSStyleRule.parse(a);this.style=b.style,this.selectorText=b.selectorText}}),d.CSSStyleRule.parse=function(a){for(var b,c,e,f=0,g="selector",h=f,i="",j={selector:!0,value:!0},k=new d.CSSStyleRule,l="";e=a.charAt(f);f++)switch(e){case" ":case"\t":case"\r":case"\n":case"\f":if(j[g])switch(a.charAt(f-1)){case" ":case"\t":case"\r":case"\n":case"\f":break;default:i+=" "}break;case'"':if(h=f+1,b=a.indexOf('"',h)+1,!b)throw'" is missing';i+=a.slice(f,b),f=b-1;break;case"'":if(h=f+1,b=a.indexOf("'",h)+1,!b)throw"' is missing";i+=a.slice(f,b),f=b-1;break;case"/":if("*"===a.charAt(f+1)){if(f+=2,b=a.indexOf("*/",f),b===-1)throw new SyntaxError("Missing */");f=b+1}else i+=e;break;case"{":"selector"===g&&(k.selectorText=i.trim(),i="",g="name");break;case":":"name"===g?(c=i.trim(),i="",g="value"):i+=e;break;case"!":"value"===g&&a.indexOf("!important",f)===f?(l="important",f+="important".length):i+=e;break;case";":"value"===g?(k.style.setProperty(c,i.trim(),l),l="",i="",g="name"):i+=e;break;case"}":if("value"===g)k.style.setProperty(c,i.trim(),l),l="",i="";else{if("name"===g)break;i+=e}g="selector";break;default:i+=e}return k},c.CSSStyleRule=d.CSSStyleRule},{"./CSSRule":15,"./CSSStyleDeclaration":16}],18:[function(a,b,c){var d={StyleSheet:a("./StyleSheet").StyleSheet,CSSStyleRule:a("./CSSStyleRule").CSSStyleRule};d.CSSStyleSheet=function(){d.StyleSheet.call(this),this.cssRules=[]},d.CSSStyleSheet.prototype=new d.StyleSheet,d.CSSStyleSheet.prototype.constructor=d.CSSStyleSheet,d.CSSStyleSheet.prototype.insertRule=function(a,b){if(b<0||b>this.cssRules.length)throw new RangeError("INDEX_SIZE_ERR");var c=d.parse(a).cssRules[0];return c.parentStyleSheet=this,this.cssRules.splice(b,0,c),b},d.CSSStyleSheet.prototype.deleteRule=function(a){if(a<0||a>=this.cssRules.length)throw new RangeError("INDEX_SIZE_ERR");this.cssRules.splice(a,1)},d.CSSStyleSheet.prototype.toString=function(){for(var a="",b=this.cssRules,c=0;c<b.length;c++)a+=b[c].cssText+"\n";return a},c.CSSStyleSheet=d.CSSStyleSheet,d.parse=a("./parse").parse},{"./CSSStyleRule":17,"./StyleSheet":23,"./parse":26}],19:[function(a,b,c){var d={};d.CSSValue=function(){},d.CSSValue.prototype={constructor:d.CSSValue,set cssText(a){var b=this._getConstructorName();throw new Error('DOMException: property "cssText" of "'+b+'" is readonly and can not be replaced with "'+a+'"!')},get cssText(){var a=this._getConstructorName();throw new Error('getter "cssText" of "'+a+'" is not implemented!')},_getConstructorName:function(){var a=this.constructor.toString(),b=a.match(/function\s([^\(]+)/),c=b[1];return c}},c.CSSValue=d.CSSValue},{}],20:[function(a,b,c){var d={CSSValue:a("./CSSValue").CSSValue};d.CSSValueExpression=function(a,b){this._token=a,this._idx=b},d.CSSValueExpression.prototype=new d.CSSValue,d.CSSValueExpression.prototype.constructor=d.CSSValueExpression,d.CSSValueExpression.prototype.parse=function(){for(var a,b=this._token,c=this._idx,d="",e="",f="",g=[];;++c){if(d=b.charAt(c),""===d){f="css expression error: unfinished expression!";break}switch(d){case"(":g.push(d),e+=d;break;case")":g.pop(d),e+=d;break;case"/":(a=this._parseJSComment(b,c))?a.error?f="css expression error: unfinished comment in expression!":c=a.idx:(a=this._parseJSRexExp(b,c))?(c=a.idx,e+=a.text):e+=d;break;case"'":case'"':a=this._parseJSString(b,c,d),a?(c=a.idx,e+=a.text):e+=d;break;default:e+=d}if(f)break;if(0===g.length)break}var h;return h=f?{error:f}:{idx:c,expression:e}},d.CSSValueExpression.prototype._parseJSComment=function(a,b){var c,d=a.charAt(b+1);if("/"===d||"*"===d){var e,f,g=b;if("/"===d?f="\n":"*"===d&&(f="*/"),e=a.indexOf(f,g+1+1),e!==-1)return e=e+f.length-1,c=a.substring(b,e+1),{idx:e,text:c};var h="css expression error: unfinished comment in expression!";return{error:h}}return!1},d.CSSValueExpression.prototype._parseJSString=function(a,b,c){var d,e=this._findMatchedIdx(a,b,c);return e!==-1&&(d=a.substring(b,e+c.length),{idx:e,text:d})},d.CSSValueExpression.prototype._parseJSRexExp=function(a,b){var c=a.substring(0,b).replace(/\s+$/,""),d=[/^$/,/\($/,/\[$/,/\!$/,/\+$/,/\-$/,/\*$/,/\/\s+/,/\%$/,/\=$/,/\>$/,/<$/,/\&$/,/\|$/,/\^$/,/\~$/,/\?$/,/\,$/,/delete$/,/in$/,/instanceof$/,/new$/,/typeof$/,/void$/],e=d.some(function(a){return a.test(c)});if(e){var f="/";return this._parseJSString(a,b,f)}return!1},d.CSSValueExpression.prototype._findMatchedIdx=function(a,b,c){for(var d,e=b,f=-1;;){if(d=a.indexOf(c,e+1),d===-1){d=f;break}var g=a.substring(b+1,d),h=g.match(/\\+$/);if(!h||h[0]%2===0)break;e=d}var i=a.indexOf("\n",b+1);return i<d&&(d=f),d},c.CSSValueExpression=d.CSSValueExpression},{"./CSSValue":19}],21:[function(a,b,c){var d={};d.MatcherList=function(){this.length=0},d.MatcherList.prototype={constructor:d.MatcherList,get matcherText(){return Array.prototype.join.call(this,", ")},set matcherText(a){for(var b=a.split(","),c=this.length=b.length,d=0;d<c;d++)this[d]=b[d].trim()},appendMatcher:function(a){Array.prototype.indexOf.call(this,a)===-1&&(this[this.length]=a,this.length++)},deleteMatcher:function(a){var b=Array.prototype.indexOf.call(this,a);b!==-1&&Array.prototype.splice.call(this,b,1)}},c.MatcherList=d.MatcherList},{}],22:[function(a,b,c){var d={};d.MediaList=function(){this.length=0},d.MediaList.prototype={constructor:d.MediaList,get mediaText(){return Array.prototype.join.call(this,", ")},set mediaText(a){for(var b=a.split(","),c=this.length=b.length,d=0;d<c;d++)this[d]=b[d].trim()},appendMedium:function(a){Array.prototype.indexOf.call(this,a)===-1&&(this[this.length]=a,this.length++)},deleteMedium:function(a){var b=Array.prototype.indexOf.call(this,a);b!==-1&&Array.prototype.splice.call(this,b,1)}},c.MediaList=d.MediaList},{}],23:[function(a,b,c){var d={};d.StyleSheet=function(){this.parentStyleSheet=null},c.StyleSheet=d.StyleSheet},{}],24:[function(a,b,c){var d={CSSStyleSheet:a("./CSSStyleSheet").CSSStyleSheet,CSSStyleRule:a("./CSSStyleRule").CSSStyleRule,CSSMediaRule:a("./CSSMediaRule").CSSMediaRule,CSSStyleDeclaration:a("./CSSStyleDeclaration").CSSStyleDeclaration,CSSKeyframeRule:a("./CSSKeyframeRule").CSSKeyframeRule,CSSKeyframesRule:a("./CSSKeyframesRule").CSSKeyframesRule};d.clone=function a(b){var c=new d.CSSStyleSheet,e=b.cssRules;if(!e)return c;for(var f={1:d.CSSStyleRule,4:d.CSSMediaRule,8:d.CSSKeyframesRule,9:d.CSSKeyframeRule},g=0,h=e.length;g<h;g++){var i=e[g],j=c.cssRules[g]=new f[i.type],k=i.style;if(k){for(var l=j.style=new d.CSSStyleDeclaration,m=0,n=k.length;m<n;m++){var o=l[m]=k[m];l[o]=k[o],l._importants[o]=k.getPropertyPriority(o)}l.length=k.length}i.hasOwnProperty("keyText")&&(j.keyText=i.keyText),i.hasOwnProperty("selectorText")&&(j.selectorText=i.selectorText),i.hasOwnProperty("mediaText")&&(j.mediaText=i.mediaText),i.hasOwnProperty("cssRules")&&(j.cssRules=a(i).cssRules)}return c},c.clone=d.clone},{"./CSSKeyframeRule":12,"./CSSKeyframesRule":13,"./CSSMediaRule":14,"./CSSStyleDeclaration":16,"./CSSStyleRule":17,"./CSSStyleSheet":18}],25:[function(a,b,c){"use strict";c.CSSStyleDeclaration=a("./CSSStyleDeclaration").CSSStyleDeclaration,c.CSSRule=a("./CSSRule").CSSRule,c.CSSStyleRule=a("./CSSStyleRule").CSSStyleRule,c.MediaList=a("./MediaList").MediaList,c.CSSMediaRule=a("./CSSMediaRule").CSSMediaRule,c.CSSImportRule=a("./CSSImportRule").CSSImportRule,c.CSSFontFaceRule=a("./CSSFontFaceRule").CSSFontFaceRule,c.StyleSheet=a("./StyleSheet").StyleSheet,c.CSSStyleSheet=a("./CSSStyleSheet").CSSStyleSheet,c.CSSKeyframesRule=a("./CSSKeyframesRule").CSSKeyframesRule,c.CSSKeyframeRule=a("./CSSKeyframeRule").CSSKeyframeRule,c.MatcherList=a("./MatcherList").MatcherList,c.CSSDocumentRule=a("./CSSDocumentRule").CSSDocumentRule,c.CSSValue=a("./CSSValue").CSSValue,c.CSSValueExpression=a("./CSSValueExpression").CSSValueExpression,c.parse=a("./parse").parse,c.clone=a("./clone").clone},{"./CSSDocumentRule":9,"./CSSFontFaceRule":10,"./CSSImportRule":11,"./CSSKeyframeRule":12,"./CSSKeyframesRule":13,"./CSSMediaRule":14,"./CSSRule":15,"./CSSStyleDeclaration":16,"./CSSStyleRule":17,"./CSSStyleSheet":18,"./CSSValue":19,"./CSSValueExpression":20,"./MatcherList":21,"./MediaList":22,"./StyleSheet":23,"./clone":24,"./parse":26}],26:[function(a,b,c){var d={};d.parse=function(a){for(var b,c,e,f,g,h,i,j,k,l,m=0,n="before-selector",o="",p={selector:!0,value:!0,atRule:!0,"importRule-begin":!0,importRule:!0,atBlock:!0,"documentRule-begin":!0},q=new d.CSSStyleSheet,r=q,s="",t=/@(-(?:\w+-)+)?keyframes/g,u=function(b){var c=a.substring(0,m).split("\n"),d=c.length,e=c.pop().length+1,f=new Error(b+" (line "+d+", char "+e+")");throw f.line=d,f.char=e,f.styleSheet=q,f};l=a.charAt(m);m++)switch(l){case" ":case"\t":case"\r":case"\n":case"\f":p[n]&&(o+=l);break;case'"':b=m+1;do b=a.indexOf('"',b)+1,b||u('Unmatched "');while("\\"===a[b-2]);switch(o+=a.slice(m,b),m=b-1,n){case"before-value":n="value";break;case"importRule-begin":n="importRule"}break;case"'":b=m+1;do b=a.indexOf("'",b)+1,b||u("Unmatched '");while("\\"===a[b-2]);switch(o+=a.slice(m,b),m=b-1,n){case"before-value":n="value";break;case"importRule-begin":n="importRule"}break;case"/":"*"===a.charAt(m+1)?(m+=2,b=a.indexOf("*/",m),b===-1?u("Missing */"):m=b+1):o+=l,"importRule-begin"===n&&(o+=" ",n="importRule");break;case"@":if(a.indexOf("@-moz-document",m)===m){n="documentRule-begin",k=new d.CSSDocumentRule,k.__starts=m,m+="-moz-document".length,o="";break}if(a.indexOf("@media",m)===m){n="atBlock",g=new d.CSSMediaRule,g.__starts=m,m+="media".length,o="";break}if(a.indexOf("@import",m)===m){n="importRule-begin",m+="import".length,o+="@import";break}if(a.indexOf("@font-face",m)===m){n="fontFaceRule-begin",m+="font-face".length,i=new d.CSSFontFaceRule,i.__starts=m,o="";break}t.lastIndex=m;var v=t.exec(a);if(v&&v.index===m){n="keyframesRule-begin",j=new d.CSSKeyframesRule,j.__starts=m,j._vendorPrefix=v[1],m+=v[0].length-1,o="";break}"selector"===n&&(n="atRule"),o+=l;break;case"{":"selector"===n||"atRule"===n?(f.selectorText=o.trim(),f.style.__starts=m,o="",n="before-name"):"atBlock"===n?(g.media.mediaText=o.trim(),r=c=g,g.parentStyleSheet=q,o="",n="before-selector"):"fontFaceRule-begin"===n?(c&&(i.parentRule=c),i.parentStyleSheet=q,f=i,o="",n="before-name"):"keyframesRule-begin"===n?(j.name=o.trim(),c&&(j.parentRule=c),j.parentStyleSheet=q,r=c=j,o="",n="keyframeRule-begin"):"keyframeRule-begin"===n?(f=new d.CSSKeyframeRule,f.keyText=o.trim(),f.__starts=m,o="",n="before-name"):"documentRule-begin"===n&&(k.matcher.matcherText=o.trim(),c&&(k.parentRule=c),r=c=k,k.parentStyleSheet=q,o="",n="before-selector");break;case":":"name"===n?(e=o.trim(),o="",n="before-value"):o+=l;break;case"(":if("value"===n)if("expression"===o.trim()){var w=new d.CSSValueExpression(a,m).parse();w.error?u(w.error):(o+=w.expression,m=w.idx)}else n="value-parenthesis",o+=l;else o+=l;break;case")":"value-parenthesis"===n&&(n="value"),o+=l;break;case"!":"value"===n&&a.indexOf("!important",m)===m?(s="important",m+="important".length):o+=l;break;case";":switch(n){case"value":f.style.setProperty(e,o.trim(),s),s="",o="",n="before-name";break;case"atRule":o="",n="before-selector";break;case"importRule":h=new d.CSSImportRule,h.parentStyleSheet=h.styleSheet.parentStyleSheet=q,h.cssText=o+l,q.cssRules.push(h),o="",n="before-selector";break;default:o+=l}break;case"}":switch(n){case"value":f.style.setProperty(e,o.trim(),s),s="";case"before-name":case"name":f.__ends=m+1,c&&(f.parentRule=c),f.parentStyleSheet=q,r.cssRules.push(f),o="",n=r.constructor===d.CSSKeyframesRule?"keyframeRule-begin":"before-selector";break;case"keyframeRule-begin":case"before-selector":case"selector":c||u("Unexpected }"),r.__ends=m+1,q.cssRules.push(r),r=q,c=null,o="",n="before-selector"}break;default:switch(n){case"before-selector":n="selector",f=new d.CSSStyleRule,f.__starts=m;break;case"before-name":n="name";break;case"before-value":n="value";break;case"importRule-begin":n="importRule"}o+=l}return q},c.parse=d.parse,d.CSSStyleSheet=a("./CSSStyleSheet").CSSStyleSheet,d.CSSStyleRule=a("./CSSStyleRule").CSSStyleRule,d.CSSImportRule=a("./CSSImportRule").CSSImportRule,d.CSSMediaRule=a("./CSSMediaRule").CSSMediaRule,d.CSSFontFaceRule=a("./CSSFontFaceRule").CSSFontFaceRule,d.CSSStyleDeclaration=a("./CSSStyleDeclaration").CSSStyleDeclaration,d.CSSKeyframeRule=a("./CSSKeyframeRule").CSSKeyframeRule,d.CSSKeyframesRule=a("./CSSKeyframesRule").CSSKeyframesRule,d.CSSValueExpression=a("./CSSValueExpression").CSSValueExpression,d.CSSDocumentRule=a("./CSSDocumentRule").CSSDocumentRule},{"./CSSDocumentRule":9,"./CSSFontFaceRule":10,"./CSSImportRule":11,"./CSSKeyframeRule":12,"./CSSKeyframesRule":13,"./CSSMediaRule":14,"./CSSStyleDeclaration":16,"./CSSStyleRule":17,"./CSSStyleSheet":18,"./CSSValueExpression":20}],27:[function(a,b,c){"use strict";var d=a("./cssSupport"),e=function(a){var b=/^[\t\r\f\n ]*(.+?)[\t\r\f\n ]*$/;return a.replace(b,"$1")};c.extractCssUrl=function(a){var b,c=/^url\(([^\)]+)\)/;if(!c.test(a))throw new Error("Invalid url");return b=c.exec(a)[1],d.unquoteString(e(b))};var f=function(a){var b,c="\\s*(?:\"[^\"]*\"|'[^']*'|[^\\(]+)\\s*",d="(url\\("+c+"\\)|[^,\\s]+)",e="(?:\\s*"+d+")+",f="^\\s*("+e+")(?:\\s*,\\s*("+e+"))*\\s*$",g=new RegExp(e,"g"),h=[],i=function(a){var b,c=new RegExp(d,"g"),e=[];for(b=c.exec(a);b;)e.push(b[1]),b=c.exec(a);return e};if(a.match(new RegExp(f))){for(b=g.exec(a);b;)h.push(i(b[0])),b=g.exec(a);return h}return[]},g=function(a){var b,d;for(b=0;b<a.length;b++)try{return d=c.extractCssUrl(a[b]),{url:d,idx:b}}catch(a){}};c.parse=function(a){var b=f(a);return b.map(function(a){var b=g(a);return b?{preUrl:a.slice(0,b.idx),url:b.url,postUrl:a.slice(b.idx+1)}:{preUrl:a}})},c.serialize=function(a){var b=a.map(function(a){var b=[].concat(a.preUrl);return a.url&&b.push('url("'+a.url+'")'),a.postUrl&&(b=b.concat(a.postUrl)),b.join(" ")});return b.join(", ")}},{"./cssSupport":28}],28:[function(a,b,c){"use strict";var d;try{d=a("cssom")}catch(a){}c.unquoteString=function(a){var b=/^"(.*)"$/,c=/^'(.*)'$/;return b.test(a)?a.replace(b,"$1"):c.test(a)?a.replace(c,"$1"):a};var e=function(a){var b,c=document.implementation.createHTMLDocument(""),d=document.createElement("style");return d.textContent=a,c.body.appendChild(d),b=d.sheet.cssRules,Array.prototype.slice.call(b)},f=function(){var a=e("a{background:url(i)}");return!a.length||a[0].cssText.indexOf("url()")>=0}(),g=function(){var a=e('@font-face { font-family: "f"; src: url("f"); }');return!a.length||/url\(['"]*\)/.test(a[0].cssText)}(),h=function(){var a=e("a{background:url(old)}");return a[0].style.setProperty("background","url(new)",""),a[0].style.getPropertyValue("background").indexOf("old")>=0}();c.rulesForCssText=function(a){return(f||g||h)&&d&&d.parse?d.parse(a).cssRules:e(a)},c.cssRulesToText=function(a){return a.reduce(function(a,b){return a+b.cssText},"")},c.exchangeRule=function(a,b,d){var e=a.indexOf(b);a[e]=c.rulesForCssText(d)[0]},c.changeFontFaceRuleSrc=function(a,b,d){var e="@font-face { font-family: "+b.style.getPropertyValue("font-family")+"; ";b.style.getPropertyValue("font-style")&&(e+="font-style: "+b.style.getPropertyValue("font-style")+"; "),b.style.getPropertyValue("font-weight")&&(e+="font-weight: "+b.style.getPropertyValue("font-weight")+"; "),e+="src: "+d+"}",c.exchangeRule(a,b,e)}},{cssom:25}],29:[function(a,b,c){"use strict";var d=a("./util"),e=a("./inlineImage"),f=a("./inlineScript"),g=a("./inlineCss"),h=a("./cssSupport"),i=function(a){return d.joinUrl(a,".")},j=function(a){var b=a.map(function(b,c){return c===a.length-1&&(b={baseUrl:i(b.baseUrl)}),JSON.stringify(b)});return b},k=function(a,b){return b.cache!==!1&&"none"!==b.cache&&b.cacheBucket?d.memoize(a,j,b.cacheBucket):a},l=function(a,b,c){var d=h.rulesForCssText(a);return g.loadCSSImportsForRules(d,b,c).then(function(b){return g.loadAndInlineCSSResourcesForRules(d,c).then(function(c){var e=b.errors.concat(c.errors),f=b.hasChanges||c.hasChanges;return f&&(a=h.cssRulesToText(d)),{hasChanges:f,content:a,errors:e}})})},m=function(a,b,c){var e=a.textContent,f=k(l,b);return f(e,c,b).then(function(b){return b.hasChanges&&(a.childNodes[0].nodeValue=b.content),d.cloneArray(b.errors)})},n=function(a){var b=a.getElementsByTagName("style");return Array.prototype.filter.call(b,function(a){return!a.attributes.type||"text/css"===a.attributes.type.value})};c.loadAndInlineStyles=function(a,b){var c,e=n(a),f=[],g=[];return c=d.clone(b),c.baseUrl=c.baseUrl||d.getDocumentBaseUrl(a),d.all(e.map(function(a){return m(a,c,g).then(function(a){f=f.concat(a)})})).then(function(){return f})};var o=function(a,b){var c,d=a.parentNode;b=b.trim(),b&&(c=a.ownerDocument.createElement("style"),c.type="text/css",c.appendChild(a.ownerDocument.createTextNode(b)),d.insertBefore(c,a)),d.removeChild(a)},p=function(a,b){return d.ajax(a,b).then(function(a){var b=h.rulesForCssText(a);return{content:a,cssRules:b}}).then(function(b){var c=g.adjustPathsOfCssResources(a,b.cssRules);return{content:b.content,cssRules:b.cssRules,hasChanges:c}}).then(function(a){return g.loadCSSImportsForRules(a.cssRules,[],b).then(function(b){return{content:a.content,cssRules:a.cssRules,hasChanges:a.hasChanges||b.hasChanges,errors:b.errors}})}).then(function(a){return g.loadAndInlineCSSResourcesForRules(a.cssRules,b).then(function(b){return{content:a.content,cssRules:a.cssRules,hasChanges:a.hasChanges||b.hasChanges,errors:a.errors.concat(b.errors)}})}).then(function(a){var b=a.content;return a.hasChanges&&(b=h.cssRulesToText(a.cssRules)),{content:b,errors:a.errors}})},q=function(a,b){var c=a.attributes.href.value,e=d.getDocumentBaseUrl(a.ownerDocument),f=d.clone(b);!f.baseUrl&&e&&(f.baseUrl=e);var g=k(p,b);return g(c,f).then(function(a){return{content:a.content,errors:d.cloneArray(a.errors)}})},r=function(a){var b=a.getElementsByTagName("link");return Array.prototype.filter.call(b,function(a){return a.attributes.rel&&"stylesheet"===a.attributes.rel.value&&(!a.attributes.type||"text/css"===a.attributes.type.value)})};c.loadAndInlineCssLinks=function(a,b){var c=r(a),e=[];return d.all(c.map(function(a){return q(a,b).then(function(b){o(a,b.content+"\n"),e=e.concat(b.errors)},function(a){e.push({resourceType:"stylesheet",url:a.url,msg:"Unable to load stylesheet "+a.url})})})).then(function(){return e})},c.loadAndInlineImages=e.inline,c.loadAndInlineScript=f.inline,c.inlineReferences=function(a,b){var e=[],f=[c.loadAndInlineImages,c.loadAndInlineStyles,c.loadAndInlineCssLinks];return b.inlineScripts!==!1&&f.push(c.loadAndInlineScript),d.all(f.map(function(c){return c(a,b).then(function(a){e=e.concat(a)})})).then(function(){return e})}},{"./cssSupport":28,"./inlineCss":30,"./inlineImage":31,"./inlineScript":32,"./util":33}],30:[function(a,b,c){"use strict";var d=a("ayepromise"),e=a("./util"),f=a("./cssSupport"),g=a("./backgroundValueParser"),h=a("css-font-face-src"),i=function(a,b,c){a.style.setProperty(b,c,a.style.getPropertyPriority(b))},j=function(a){return a.filter(function(a){return a.type===window.CSSRule.STYLE_RULE&&(a.style.getPropertyValue("background-image")||a.style.getPropertyValue("background"))})},k=function(a){var b=[];return a.forEach(function(a){a.style.getPropertyValue("background-image")?b.push({property:"background-image",value:a.style.getPropertyValue("background-image"),rule:a}):a.style.getPropertyValue("background")&&b.push({property:"background",value:a.style.getPropertyValue("background"),rule:a})}),b},l=function(a){return a.filter(function(a){return a.type===window.CSSRule.FONT_FACE_RULE&&a.style.getPropertyValue("src")})},m=function(a){return a.filter(function(a){return a.type===window.CSSRule.IMPORT_RULE&&a.href})},n=function(a){var b=[];return a.forEach(function(a,c){a.url&&!e.isDataUri(a.url)&&b.push(c)}),b},o=function(a){var b=[];return a.forEach(function(a,c){a.url&&!e.isDataUri(a.url)&&b.push(c)}),b};c.adjustPathsOfCssResources=function(a,b){var c=j(b),d=k(c),p=!1;return d.forEach(function(b){var c,d=g.parse(b.value),f=n(d);f.length>0&&(f.forEach(function(b){var c=d[b].url,f=e.joinUrl(a,c);d[b].url=f}),c=g.serialize(d),i(b.rule,b.property,c),p=!0)}),l(b).forEach(function(c){var d,g,i=c.style.getPropertyValue("src");try{d=h.parse(i)}catch(a){return}g=o(d),g.length>0&&(g.forEach(function(b){var c=d[b].url,f=e.joinUrl(a,c);d[b].url=f}),f.changeFontFaceRuleSrc(b,c,h.serialize(d)),p=!0)}),m(b).forEach(function(c){var d=c.href,g=e.joinUrl(a,d);f.exchangeRule(b,c,"@import url("+g+");"),p=!0}),p};var p=function(a,b,c){var d=a.indexOf(b);a.splice(d,1),c.forEach(function(b,c){a.splice(d+c,0,b)})},q=function(a){var b=d.defer();return b.resolve(a),b.promise},r=function(a,b,d,g){var h,i=b.href;return i=f.unquoteString(i),h=e.joinUrl(g.baseUrl,i),d.indexOf(h)>=0?(p(a,b,[]),q([])):(d.push(h),e.ajax(i,g).then(function(e){var h=f.rulesForCssText(e);return c.loadCSSImportsForRules(h,d,g).then(function(d){return c.adjustPathsOfCssResources(i,h),p(a,b,h),d.errors})},function(a){throw{resourceType:"stylesheet",url:a.url,msg:"Unable to load stylesheet "+a.url}}))};c.loadCSSImportsForRules=function(a,b,c){var d=m(a),f=[],g=!1;return e.all(d.map(function(d){return r(a,d,b,c).then(function(a){f=f.concat(a),g=!0},function(a){f.push(a)})})).then(function(){return{hasChanges:g,errors:f}})};var s=function(a,b){var c=g.parse(a),d=n(c),f=!1;return e.collectAndReportErrors(d.map(function(a){var d=c[a].url;return e.getDataURIForImageURL(d,b).then(function(b){c[a].url=b,f=!0},function(a){throw{resourceType:"backgroundImage",url:a.url,msg:"Unable to load background-image "+a.url}})})).then(function(a){return{backgroundValue:g.serialize(c),hasChanges:f,errors:a}})},t=function(a,b){var c=j(a),d=k(c),f=[],g=!1;return e.all(d.map(function(a){return s(a.value,b).then(function(b){b.hasChanges&&(i(a.rule,a.property,b.backgroundValue),g=!0),f=f.concat(b.errors)})})).then(function(){return{hasChanges:g,errors:f}})},u=function(a,b){var c,d,f=!1;try{c=h.parse(a)}catch(a){c=[]}return d=o(c),e.collectAndReportErrors(d.map(function(a){var d=c[a],g=d.format||"woff";return e.binaryAjax(d.url,b).then(function(a){var b=btoa(a);d.url="data:font/"+g+";base64,"+b,f=!0},function(a){throw{resourceType:"fontFace",url:a.url,msg:"Unable to load font-face "+a.url}})})).then(function(a){return{srcDeclarationValue:h.serialize(c),hasChanges:f,errors:a}})},v=function(a,b){var c=l(a),d=[],g=!1;return e.all(c.map(function(c){var e=c.style.getPropertyValue("src");return u(e,b).then(function(b){b.hasChanges&&(f.changeFontFaceRuleSrc(a,c,b.srcDeclarationValue),g=!0),d=d.concat(b.errors)})})).then(function(){return{hasChanges:g,errors:d}})};c.loadAndInlineCSSResourcesForRules=function(a,b){var c=!1,d=[];return e.all([t,v].map(function(e){return e(a,b).then(function(a){c=c||a.hasChanges,d=d.concat(a.errors)})})).then(function(){return{hasChanges:c,errors:d}})}},{"./backgroundValueParser":27,"./cssSupport":28,"./util":33,ayepromise:2,"css-font-face-src":6}],31:[function(a,b,c){"use strict";var d=a("./util"),e=function(a,b){var c=null;a.hasAttribute("src")?c=a.getAttribute("src"):a.hasAttributeNS("http://www.w3.org/1999/xlink","href")?c=a.getAttributeNS("http://www.w3.org/1999/xlink","href"):a.hasAttribute("href")&&(c=a.getAttribute("href"));var e=d.getDocumentBaseUrl(a.ownerDocument),f=d.clone(b);return!f.baseUrl&&e&&(f.baseUrl=e),d.getDataURIForImageURL(c,f).then(function(a){return a},function(a){throw{resourceType:"image",url:a.url,msg:"Unable to load image "+a.url}})},f=function(a){return a.filter(function(a){var b=null;return a.hasAttribute("src")?b=a.getAttribute("src"):a.hasAttributeNS("http://www.w3.org/1999/xlink","href")?b=a.getAttributeNS("http://www.w3.org/1999/xlink","href"):a.hasAttribute("href")&&(b=a.getAttribute("href")),null!==b&&!d.isDataUri(b)})},g=function(a){return Array.prototype.filter.call(a,function(a){return"image"===a.type})},h=function(a){return Array.prototype.slice.call(a)};c.inline=function(a,b){var c=h(a.getElementsByTagName("img")),i=h(a.getElementsByTagName("image")),j=g(a.getElementsByTagName("input"));c=c.concat(i),c=c.concat(j);var k=f(c);return d.collectAndReportErrors(k.map(function(a){return e(a,b).then(function(b){a.attributes.src?a.attributes.src.value=b:a.attributes["xlink:href"]?a.attributes["xlink:href"].value=b:a.attributes.href&&(a.attributes.href.value=b)})}))}},{"./util":33}],32:[function(a,b,c){"use strict";var d=a("./util"),e=function(a,b){var c=a.attributes.src.value,e=d.getDocumentBaseUrl(a.ownerDocument),f=d.clone(b);return!f.baseUrl&&e&&(f.baseUrl=e),d.ajax(c,f).fail(function(a){throw{resourceType:"script",url:a.url,msg:"Unable to load script "+a.url}})},f=function(a){return a.replace(/<\//g,"<\\/")},g=function(a,b){a.attributes.removeNamedItem("src"),a.textContent=f(b)},h=function(a){var b=a.getElementsByTagName("script");return Array.prototype.filter.call(b,function(a){return!!a.attributes.src})};c.inline=function(a,b){var c=h(a);return d.collectAndReportErrors(c.map(function(a){return e(a,b).then(function(b){g(a,b)})}))}},{"./util":33
}],33:[function(a,b,c){"use strict";var d=a("url"),e=a("ayepromise");c.getDocumentBaseUrl=function(a){return"about:blank"!==a.baseURI?a.baseURI:null},c.clone=function(a){var b,c={};for(b in a)a.hasOwnProperty(b)&&(c[b]=a[b]);return c},c.cloneArray=function(a){return Array.prototype.slice.apply(a,[0])},c.joinUrl=function(a,b){return a?d.resolve(a,b):b},c.isDataUri=function(a){return/^data:/.test(a)},c.all=function(a){var b=e.defer(),c=a.length,d=[];return 0===a.length?(b.resolve([]),b.promise):(a.forEach(function(a,e){a.then(function(a){c-=1,d[e]=a,0===c&&b.resolve(d)},function(a){b.reject(a)})}),b.promise)},c.collectAndReportErrors=function(a){var b=[];return c.all(a.map(function(a){return a.fail(function(a){b.push(a)})})).then(function(){return b})};var f=null,g=function(a,b){return b===!1||"none"===b||"repeated"===b?(null!==f&&"repeated"===b||(f=Date.now()),a+"?_="+f):a};c.ajax=function(a,b){var d,f=new window.XMLHttpRequest,h=e.defer(),i=c.joinUrl(b.baseUrl,a),j=function(){h.reject({msg:"Unable to load url",url:i})};d=g(i,b.cache),f.addEventListener("load",function(){200===f.status||0===f.status?h.resolve(f.response):j()},!1),f.addEventListener("error",j,!1);try{f.open("GET",d,!0),f.overrideMimeType(b.mimeType),f.send(null)}catch(a){j()}return h.promise},c.binaryAjax=function(a,b){var d=c.clone(b);return d.mimeType="text/plain; charset=x-user-defined",c.ajax(a,d).then(function(a){for(var b="",c=0;c<a.length;c++)b+=String.fromCharCode(255&a.charCodeAt(c));return b})};var h=function(a){var b=function(a,b){return a.substring(0,b.length)===b};return b(a,"<?xml")||b(a,"<svg")?"image/svg+xml":"image/png"};c.getDataURIForImageURL=function(a,b){return c.binaryAjax(a,b).then(function(a){var b=btoa(a),c=h(a);return"data:"+c+";base64,"+b})};var i=[],j=function(a){return i.indexOf(a)<0&&i.push(a),i.indexOf(a)};c.memoize=function(a,b,c){if("object"!=typeof c)throw new Error("cacheBucket is not an object");return function(){var d,e=Array.prototype.slice.call(arguments),f=b(e),g=j(a);return c[g]&&c[g][f]?c[g][f]:(d=a.apply(null,e),c[g]=c[g]||{},c[g][f]=d,d)}}},{ayepromise:2,url:3}],34:[function(b,c,d){(function(b){!function(e){function f(a){throw RangeError(I[a])}function g(a,b){for(var c=a.length,d=[];c--;)d[c]=b(a[c]);return d}function h(a,b){var c=a.split("@"),d="";c.length>1&&(d=c[0]+"@",a=c[1]),a=a.replace(H,".");var e=a.split("."),f=g(e,b).join(".");return d+f}function i(a){for(var b,c,d=[],e=0,f=a.length;e<f;)b=a.charCodeAt(e++),b>=55296&&b<=56319&&e<f?(c=a.charCodeAt(e++),56320==(64512&c)?d.push(((1023&b)<<10)+(1023&c)+65536):(d.push(b),e--)):d.push(b);return d}function j(a){return g(a,function(a){var b="";return a>65535&&(a-=65536,b+=L(a>>>10&1023|55296),a=56320|1023&a),b+=L(a)}).join("")}function k(a){return a-48<10?a-22:a-65<26?a-65:a-97<26?a-97:x}function l(a,b){return a+22+75*(a<26)-((0!=b)<<5)}function m(a,b,c){var d=0;for(a=c?K(a/B):a>>1,a+=K(a/b);a>J*z>>1;d+=x)a=K(a/J);return K(d+(J+1)*a/(a+A))}function n(a){var b,c,d,e,g,h,i,l,n,o,p=[],q=a.length,r=0,s=D,t=C;for(c=a.lastIndexOf(E),c<0&&(c=0),d=0;d<c;++d)a.charCodeAt(d)>=128&&f("not-basic"),p.push(a.charCodeAt(d));for(e=c>0?c+1:0;e<q;){for(g=r,h=1,i=x;e>=q&&f("invalid-input"),l=k(a.charCodeAt(e++)),(l>=x||l>K((w-r)/h))&&f("overflow"),r+=l*h,n=i<=t?y:i>=t+z?z:i-t,!(l<n);i+=x)o=x-n,h>K(w/o)&&f("overflow"),h*=o;b=p.length+1,t=m(r-g,b,0==g),K(r/b)>w-s&&f("overflow"),s+=K(r/b),r%=b,p.splice(r++,0,s)}return j(p)}function o(a){var b,c,d,e,g,h,j,k,n,o,p,q,r,s,t,u=[];for(a=i(a),q=a.length,b=D,c=0,g=C,h=0;h<q;++h)p=a[h],p<128&&u.push(L(p));for(d=e=u.length,e&&u.push(E);d<q;){for(j=w,h=0;h<q;++h)p=a[h],p>=b&&p<j&&(j=p);for(r=d+1,j-b>K((w-c)/r)&&f("overflow"),c+=(j-b)*r,b=j,h=0;h<q;++h)if(p=a[h],p<b&&++c>w&&f("overflow"),p==b){for(k=c,n=x;o=n<=g?y:n>=g+z?z:n-g,!(k<o);n+=x)t=k-o,s=x-o,u.push(L(l(o+t%s,0))),k=K(t/s);u.push(L(l(k,0))),g=m(c,r,d==e),c=0,++d}++c,++b}return u.join("")}function p(a){return h(a,function(a){return F.test(a)?n(a.slice(4).toLowerCase()):a})}function q(a){return h(a,function(a){return G.test(a)?"xn--"+o(a):a})}var r="object"==typeof d&&d&&!d.nodeType&&d,s="object"==typeof c&&c&&!c.nodeType&&c,t="object"==typeof b&&b;t.global!==t&&t.window!==t&&t.self!==t||(e=t);var u,v,w=2147483647,x=36,y=1,z=26,A=38,B=700,C=72,D=128,E="-",F=/^xn--/,G=/[^\x20-\x7E]/,H=/[\x2E\u3002\uFF0E\uFF61]/g,I={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},J=x-y,K=Math.floor,L=String.fromCharCode;if(u={version:"1.3.2",ucs2:{decode:i,encode:j},decode:n,encode:o,toASCII:q,toUnicode:p},"function"==typeof a&&"object"==typeof a.amd&&a.amd)a("punycode",function(){return u});else if(r&&s)if(c.exports==r)s.exports=u;else for(v in u)u.hasOwnProperty(v)&&(r[v]=u[v]);else e.punycode=u}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],35:[function(a,b,c){"use strict";function d(a,b){return Object.prototype.hasOwnProperty.call(a,b)}b.exports=function(a,b,c,f){b=b||"&",c=c||"=";var g={};if("string"!=typeof a||0===a.length)return g;var h=/\+/g;a=a.split(b);var i=1e3;f&&"number"==typeof f.maxKeys&&(i=f.maxKeys);var j=a.length;i>0&&j>i&&(j=i);for(var k=0;k<j;++k){var l,m,n,o,p=a[k].replace(h,"%20"),q=p.indexOf(c);q>=0?(l=p.substr(0,q),m=p.substr(q+1)):(l=p,m=""),n=decodeURIComponent(l),o=decodeURIComponent(m),d(g,n)?e(g[n])?g[n].push(o):g[n]=[g[n],o]:g[n]=o}return g};var e=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)}},{}],36:[function(a,b,c){"use strict";function d(a,b){if(a.map)return a.map(b);for(var c=[],d=0;d<a.length;d++)c.push(b(a[d],d));return c}var e=function(a){switch(typeof a){case"string":return a;case"boolean":return a?"true":"false";case"number":return isFinite(a)?a:"";default:return""}};b.exports=function(a,b,c,h){return b=b||"&",c=c||"=",null===a&&(a=void 0),"object"==typeof a?d(g(a),function(g){var h=encodeURIComponent(e(g))+c;return f(a[g])?d(a[g],function(a){return h+encodeURIComponent(e(a))}).join(b):h+encodeURIComponent(e(a[g]))}).join(b):h?encodeURIComponent(e(h))+c+encodeURIComponent(e(a)):""};var f=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)},g=Object.keys||function(a){var b=[];for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b.push(c);return b}},{}],37:[function(a,b,c){"use strict";c.decode=c.parse=a("./decode"),c.encode=c.stringify=a("./encode")},{"./decode":35,"./encode":36}],38:[function(a,b,c){"use strict";var d=function(a){var b=new XMLSerializer;return Array.prototype.map.call(a.childNodes,function(a){return b.serializeToString(a)}).join("")},e=function(a){return"parsererror"===a.documentElement.tagName&&"http://www.mozilla.org/newlayout/xml/parsererror.xml"===a.documentElement.namespaceURI?a.documentElement:("xml"===a.documentElement.tagName||"html"===a.documentElement.tagName)&&a.documentElement.childNodes&&a.documentElement.childNodes.length>0&&"parsererror"===a.documentElement.childNodes[0].nodeName?a.documentElement.childNodes[0]:"html"===a.documentElement.tagName&&a.documentElement.childNodes&&a.documentElement.childNodes.length>0&&"body"===a.documentElement.childNodes[0].nodeName&&a.documentElement.childNodes[0].childNodes&&a.documentElement.childNodes[0].childNodes.length&&"parsererror"===a.documentElement.childNodes[0].childNodes[0].nodeName?a.documentElement.childNodes[0].childNodes[0]:void 0},f=[new RegExp("^<h3[^>]*>This page contains the following errors:</h3><div[^>]*>(.+?)\n?</div>"),new RegExp("^(.+)\n")],g=function(a){var b,c,e=d(a);for(b=0;b<f.length;b++)if(c=f[b].exec(e))return c[1]},h=function(a){var b;if(null===a)throw new Error("Parse error");var c=e(a);if(void 0!==c)throw b=g(c)||"Parse error",new Error(b)};c.failOnParseError=function(a){return h(a),a}},{}],39:[function(a,b,c){var d=function(a){return a.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,"")},e=function(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")},f=function(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},g=function(a){var b=a.value;return" "+a.name+'="'+e(b)+'"'},h=function(a){var b=a.tagName;return"http://www.w3.org/1999/xhtml"===a.namespaceURI&&(b=b.toLowerCase()),b},i=function(a,b){var c=Array.prototype.map.call(a.attributes||a.attrs,function(a){return a.name}).indexOf("xmlns")>=0;return c||!b&&a.namespaceURI===a.parentNode.namespaceURI?"":' xmlns="'+a.namespaceURI+'"'},j=function(a){return Array.prototype.map.call(a.childNodes,function(a){return o(a)}).join("")},k=function(a,b){var c="<"+h(a);return c+=i(a,b),Array.prototype.forEach.call(a.attributes||a.attrs,function(a){c+=g(a)}),a.childNodes.length>0?(c+=">",c+=j(a),c+="</"+h(a)+">"):c+="/>",c},l=function(a){var b=a.nodeValue||a.value||"";return f(b)},m=function(a){return"<!--"+a.data.replace(/-/g,"&#45;")+"-->"},n=function(a){return"<![CDATA["+a.nodeValue+"]]>"},o=function(a,b){var c=b&&b.rootNode;return"#document"===a.nodeName||"#document-fragment"===a.nodeName?j(a):a.tagName?k(a,c):"#text"===a.nodeName?l(a):"#comment"===a.nodeName?m(a):"#cdata-section"===a.nodeName?n(a):void 0};c.serializeToString=function(a){return d(o(a,{rootNode:!0}))}},{}]},{},[1])(1)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
module.exports={
  "name": "simprov.js",
  "version": "1.0.1",
  "description": "JavaScript framework to capture provenance in web based inteactive data visualizations and applications",
  "main": "index.js",
  "scripts": {
    "test": "mocha tests/",
    "build": "./node_modules/.bin/grunt build",
    "serve": "./node_modules/.bin/grunt serve",
    "start": "./node_modules/.bin/grunt serve"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/cchandurkar/SIMProv.js.git"
  },
  "keywords": [
    "SIMProv",
    "data",
    "provenance",
    "prov",
    "history",
    "keep",
    "tracking",
    "undo",
    "redo",
    "version control",
    "version tree",
    "trail",
    "record",
    "capture",
    "visualization"
  ],
  "author": "Chaitanya Chandurkar <cchandurkar@gmail.com> (http://cchandurkar.me)",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cchandurkar/SIMProv.js/issues"
  },
  "homepage": "https://github.com/cchandurkar/SIMProv.js#readme",
  "devDependencies": {
    "babel": "^6.5.2",
    "babel-cli": "^6.18.0",
    "babel-preset-env": "^1.2.2",
    "babel-preset-latest": "^6.16.0",
    "babelify": "^7.3.0",
    "brfs": "^1.4.3",
    "browserify": "^12.0.1",
    "connect": "^3.4.0",
    "fs": "*",
    "grunt": "^0.4.5",
    "grunt-babel": "^6.0.0",
    "grunt-browserify": "^4.0.1",
    "grunt-cli": "^0.1.13",
    "grunt-contrib-connect": "^1.0.2",
    "grunt-contrib-jshint": "^0.11.3",
    "grunt-contrib-uglify": "^0.11.0",
    "grunt-contrib-watch": "^0.6.1",
    "grunt-jasmine-node": "^0.3.1",
    "grunt-jsbeautifier": "^0.2.12",
    "grunt-sass": "^1.1.0",
    "load-grunt-tasks": "^3.5.2",
    "sass-inline-svg": "0.0.3",
    "underscore": "^1.8.3"
  },
  "dependencies": {
    "clone": "^1.0.2",
    "data-tree": "^1.1.27",
    "filesaver.js": "^0.2.0",
    "moment": "^2.0.0",
    "rasterizehtml": "^1.2.1"
  }
}

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createActionClass = exports.Action = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require("./helpers");

var _mixins = require("./mixins");

var _change = require("./change");

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clone = require("clone");

var ActionBase = function ActionBase() {
    _classCallCheck(this, ActionBase);
};

/**
 * Action encodes user-driven interaction with visualization.
 *
 * @module Action
 */


var Action = function (_AttrsMixin) {
    _inherits(Action, _AttrsMixin);

    /**
     * Initializes the class
     *
     * @name initialize
     * @memberof Action
     * @instance
     */
    function Action() {
        var label = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var inverseData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var stateData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var stateInverseData = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

        _classCallCheck(this, Action);

        //console.log("CREATING ACTION", this.constructor.name, data, inverseData, stateData, stateInverseData);

        var _this = _possibleConstructorReturn(this, (Action.__proto__ || Object.getPrototypeOf(Action)).call(this));

        _this._data = data;
        _this._inverseData = inverseData;
        _this._stateData = stateData;
        _this._stateInverseData = stateInverseData;

        _this.createAllChanges();

        // Createe GUID
        _this._id = (0, _helpers.guid)();

        // Recorded At
        _this._recordedAt = new Date().getTime();

        // TimeZone
        _this._timezoneOffset = new Date().getTimezoneOffset();

        // Add  Label
        _this._label = label;

        // TODO get rid of checkpointData, replaced with checkpoint
        // Checkpoint
        _this._checkpointData = null;

        // Thumbnail
        _this._thumbnail = null;

        // Node in Master
        _this._nodeInMasterTrail = null;

        // Uplink
        _this._uplink = null;
        _this._uplinkTag = null;

        // Comments
        _this._comments = [];

        _this._events = {
            'thumbnailCaptured': []
        };

        // Session Id in which change was recorded
        _this._sessionId = SIMProv.sessionId;

        // this._change = change;
        // this._inverse = inverse;
        // this._stateChange = stateChange;
        // this._stateInverse = stateInverse;
        _this._checkpoint = null;

        //TODO set the action on each of the changes...

        // // Inverse Callback
        // this._inverse = null;
        //
        // // Forward Callback
        // this._forward = null;
        //
        // // Undo Callback
        // this._undo = null;
        //
        // // Redo Callback
        // this._redo = null;

        // Format Callback
        _this._format = null;

        return _this;
    }

    // ------------------------------
    // Getters and Setters
    // ------------------------------

    /**
     * Return a GUID that uniqly identifies the action. GUID is a 16 character alphanumeric string.
     *
     * @name id
     * @memberof Action
     * @instance
     * @return {String} - GUID created for action
     */


    _createClass(Action, [{
        key: "id",
        value: function id() {
            return this._id;
        }
    }, {
        key: "recordedAt",


        /**
         * Returns a timestamp at which change was recorded
         *
         * @name recordedAt
         * @memberof Action
         * @instance
         * @return {Number} - timestamp
         */
        value: function recordedAt() {
            return this._recordedAt;
        }

        /**
         * Returns a timezoneOffset at which change was recorded
         *
         * @name timezoneOffset
         * @memberof Action
         * @instance
         * @return {Number} - timezone offset
         */

    }, {
        key: "timezoneOffset",
        value: function timezoneOffset() {
            return this._timezoneOffset;
        }
    }, {
        key: "hasInverse",
        value: function hasInverse() {
            return this._inverse !== null;
        }
    }, {
        key: "hasStateChange",
        value: function hasStateChange() {
            return this._stateChange !== null;
        }
    }, {
        key: "hasStateInverse",
        value: function hasStateInverse() {
            return this._stateInverse !== null;
        }
    }, {
        key: "createAllChanges",
        value: function createAllChanges() {
            if (this.createChange && this.data) {
                this._change = this.createChange(this.data);
            }
            if (this.inverseData) {
                this._inverse = this.createInverse(this.inverseData);
            }
            if (this.stateData) {
                this._stateChange = this.createStateChange(this.stateData);
            }
            if (this.stateInverseData) {
                this._stateInverse = this.createStateInverse(this.stateInverseData);
            }
        }
    }, {
        key: "createChange",
        value: function createChange() {
            return null;
        }
    }, {
        key: "createInverse",
        value: function createInverse() {
            return null;
        }
    }, {
        key: "createStateChange",
        value: function createStateChange() {
            return null;
        }
    }, {
        key: "createStateInverse",
        value: function createStateInverse() {
            return null;
        }
    }, {
        key: "redo",
        value: function redo() {
            this._change.run();
        }
    }, {
        key: "undo",
        value: function undo() {
            if (this.hasInverse()) {
                return this._inverse.run();
            } else {
                throw new Error("Cannot run undo because no inverse Change is set");
            }
        }
    }, {
        key: "forward",
        value: function forward(state) {
            if (this.hasStateChange()) {
                return this._stateChange.run(state);
            } else {
                throw new Error("Cannot run forward because no forward StateChange is set");
            }
        }
    }, {
        key: "reverse",
        value: function reverse(state) {
            if (this.hasStateInverse()) {
                return this._stateChange.run(state);
            } else {
                throw new Error("Cannot run inverse because no inverse StateChange is set");
            }
        }

        // /**
        //  * Sets or Gets a forward action
        //  *
        //  * @name forward
        //  * @memberof Action
        //  * @instance
        //  * @return {Function} - Forward callback
        //  * @return {Action} - Current action
        //  */
        // forward(callback) {
        //     if (arguments.length) {
        //         this._forward = callback;
        //         return this;
        //     }
        //     return this._forward;
        // }
        //
        // /**
        //  * Sets or Gets an inverse action
        //  *
        //  * @name inverse
        //  * @memberof Action
        //  * @instance
        //  * @return {Function} - Inverse callback
        //  * @return {Action} - Current action
        //  */
        // inverse(callback) {
        //     if (arguments.length) {
        //         this._inverse = callback;
        //         return this;
        //     }
        //     return this._inverse;
        // }
        //
        // /**
        //  * Sets or Gets a redo action
        //  *
        //  * @name redo
        //  * @memberof Action
        //  * @instance
        //  * @return {Function} - Redo callback
        //  * @return {Action} - Current action
        //  */
        // redo(callback) {
        //     if (arguments.length) {
        //         this._redo = callback;
        //         return this;
        //     }
        //     return this._redo;
        // }
        //
        // /**
        //  * Sets or Gets an undo action
        //  *
        //  * @name undo
        //  * @memberof Action
        //  * @instance
        //  * @return {Function} - Undo callback
        //  * @return {Action} - Current action
        //  */
        // undo(callback) {
        //     if (arguments.length) {
        //         this._undo = callback;
        //         return this;
        //     }
        //     return this._undo;
        // }

        /**
         * Sets or Gets a format callback
         *
         * @name format
         * @memberof Action
         */

    }, {
        key: "isInvertible",


        // ------------------------------
        // Methods
        // ------------------------------

        /**
         * Checks whether action is invertible or not.
         *
         * @name isInvertible
         * @memberof Action
         * @instance
         * @return {boolean} - Whether action is invertible.
         */
        value: function isInvertible() {
            return this._inverse !== null;
        }

        /**
         * Data that was recorded as a change
         *
         * @name data
         * @memberof Action
         * @instance
         * @return {Object | Array | Number | String } - data recorded
         */

    }, {
        key: "checkpointData",
        value: function checkpointData(data) {
            if (arguments.length > 0) {
                this._checkpointData = clone(data);
                this._checkpoint = new _change.Checkpoint(this._checkpointData);
                return this;
            } else {
                return this._checkpointData;
            }
        }
    }, {
        key: "hasCheckpoint",


        /**
         * Checks if change has checkpoint
         *
         * @name hasCheckpoint
         * @memberof Action
         * @instance
         * @return {Boolean}
         */
        value: function hasCheckpoint() {
            return this._checkpointData !== null;
        }
    }, {
        key: "isCheckpoint",
        value: function isCheckpoint() {
            return this.hasCheckpoint();
        }

        /**
         * Returns a base64 representation of the thumbnail set or rendered
         *
         * @name thumbnail
         * @memberof Change
         * @instance
         * @return {String} - thumbnail recorded
         */

    }, {
        key: "thumbnail",
        value: function thumbnail() {
            return this._thumbnail;
        }

        /**
         * Sets or gets the uplink
         *
         * @name uplink
         * @memberof Change
         * @instance
         * @return {@link Action} - Action
         */

    }, {
        key: "uplink",
        value: function uplink(_uplink) {
            if (arguments.length) {
                this._uplink = _uplink;
                return this;
            }return this._uplink;
        }

        /**
         * Sets or Gets an uplink identifier
         *
         * @name uplink
         * @memberof Change
         * @instance
         * @return {@link Action} - Action
         */

    }, {
        key: "uplinkTag",
        value: function uplinkTag(_uplinkTag) {
            if (arguments.length) {
                this._uplinkTag = _uplinkTag;
                return this;
            }return this._uplinkTag;
        }

        /**
         * Describes the change based on action
         *
         * @name describe
         * @memberof Action
         * @instance
         * @return {String} - description
         */

    }, {
        key: "describe",
        value: function describe() {
            var that = this;
            return this.format ? this.format(that) : this.label ? this.label : "";
        }

        /**
         * Returns a node instance from master trail
         *
         * @name nodeInMasterTrail
         * @memberof Action
         * @instance
         * @return {Object} - node
         */

    }, {
        key: "nodeInMasterTrail",
        value: function nodeInMasterTrail(node) {
            if (arguments.length > 0) {
                this._nodeInMasterTrail = node;
            } else {
                return this._nodeInMasterTrail;
            }
        }

        /**
         * Returns a node instance from master trail
         *
         * @name node
         * @memberof Action
         * @instance
         * @return {Object} - node
         */

    }, {
        key: "node",
        value: function node() {
            return this.nodeInMasterTrail();
        }

        /**
         * Returns an array of comments
         *
         * @name comments
         * @memberof Action
         * @instance
         * @return {Array} - comments
         */

    }, {
        key: "comments",
        value: function comments() {
            return this._comments;
        }

        /**
         * Returns a session id under which change was recorded
         *
         * @name sessionId
         * @memberof Action
         * @instance
         * @return {String} - sessionId
         */

    }, {
        key: "sessionId",
        value: function sessionId() {
            return this._sessionId;
        }

        // ------------------------------
        // Methods
        // ------------------------------

        /**
         * Adds a comment
         *
         * @name openGallery
         * @memberof MasterTrail
         * @instance
         * @param {Boolean} showCheckpoints - whether to show checkpoints or not.
         */

    }, {
        key: "addComment",
        value: function addComment(comment) {

            // Validate comment
            if (!comment || (typeof comment === "undefined" ? "undefined" : _typeof(comment)) !== 'object' || !comment.hasOwnProperty('id') || !comment.hasOwnProperty('date') || !comment.hasOwnProperty('text')) throw new Error("Invalid comment object");

            // Add comment to change
            this._comments.push(comment);
        }

        /**
         * Sets a thumbnail
         *
         * @name setThumbnail
         * @memberof Action
         * @instance
         * @param {String} thumbnail - base64 representation of image
         */

    }, {
        key: "setThumbnail",
        value: function setThumbnail(thumbnail) {

            // Set Thumbnail
            this._thumbnail = thumbnail;

            // Hold `this`
            var thiss = this;

            // Trigger Event
            this._events.thumbnailCaptured.forEach(function (handler) {
                handler(thumbnail, thiss);
            });

            // Return a change
            return thiss;
        }

        /**
         * Captures a thumbnail
         *
         * @name captureThumbnail
         * @memberof Action
         * @instance
         * @param {String} selector - a query selector which contents are to be rastered as a thumbnail
         * @param {Number} delay - delay after which capture should start
         */

    }, {
        key: "captureThumbnail",
        value: function captureThumbnail(selector, delay, options) {

            // Hold `this`
            var thiss = this;

            // Create Promise
            return new Promise(function (resolve, reject) {
                if (selector && typeof selector === 'string') {
                    setTimeout(function () {
                        if (SIMProv && SIMProv.rasterizer) SIMProv.rasterizer.captureHTML(selector, options, function (err, imageBase64) {
                            if (err) return reject(err);
                            thiss.setThumbnail(imageBase64);
                            resolve(imageBase64);
                        });
                    }, delay && typeof delay === 'number' && delay > 0 ? delay : 0);
                } else reject(new Error('Invalid selector provided'));
            });
        }

        /**
         * Exports an action
         *
         * @name export
         * @memberof Action
         * @instance
         * @return {Object} - exported object
         */

    }, {
        key: "export",
        value: function _export() {
            var thumbnail = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            console.log("RUNNING ACTION EXPORT");
            var retval = {
                id: this.id(),
                cls: this.constructor.getClassName(),
                label: this.label,
                attrs: this.attrs(),
                uplinkTag: this.uplinkTag(),
                recordedAt: this.recordedAt(),
                timezoneOffset: this.timezoneOffset(),
                data: this._data,
                inverseData: this._inverseData,
                stateData: this._stateData,
                stateInverseData: this._stateInverseData,
                // change: this.change === null ? null : this.change.export(),
                // inverse: this.inverse === null ? null : this.inverse.export(),
                // stateChange: this.stateChange === null ? null : this.stateChange.export(),
                // stateInverse: this.stateInverse === null ? null : this.stateInverse.export(),
                comments: this.comments(),
                sessionId: this.sessionId()
            };
            if (thumbnail) {
                retval.thumbnail = this.thumbnail();
            }
            console.log("ACTION RETVAL", retval);
            return retval;
        }
    }, {
        key: "label",


        /**
         * Returns a label
         *
         * @name label
         * @memberof Action
         * @instance
         * @return {String} - Label
         */
        get: function get() {
            return this._label;
        }
    }, {
        key: "change",
        get: function get() {
            return this._change;
        }
    }, {
        key: "inverse",
        get: function get() {
            return this._inverse;
        }
    }, {
        key: "stateChange",
        get: function get() {
            return this._stateChange;
        }
    }, {
        key: "stateInverse",
        get: function get() {
            return this._stateInverse;
        }
    }, {
        key: "data",
        get: function get() {
            return this._data;
        }
    }, {
        key: "inverseData",
        get: function get() {
            return this._inverseData !== null ? this._inverseData : this._data;
        }
    }, {
        key: "stateData",
        get: function get() {
            return this._stateData !== null ? this._stateData : this._data;
        }
    }, {
        key: "stateInverseData",
        get: function get() {
            return this._stateInverseData !== null ? this._stateInverseData : this.inverseData;
        }
    }, {
        key: "format",
        get: function get() {
            return this._format;
        },
        set: function set(cb) {
            this._format = cb;
        }
    }, {
        key: "checkpoint",
        get: function get() {
            return this._checkpoint;
        }
    }], [{
        key: "getClassName",
        value: function getClassName() {
            return "Action";
        }
    }, {
        key: "import",
        value: function _import(classMap, d) {
            console.log("IMPORTING ACTION", d.cls);
            var cls = classMap.get(d.cls);
            console.log(cls, classMap);
            var action = new cls();
            action._label = d.label;
            // action._change = d.change === null ? null : Change.import(classMap, d.change);
            // action._inverse = d.inverse === null ? null : Change.import(classMap, d.inverse);
            // action._stateChange = d.stateChange === null ? null : Change.import(classMap, d.stateChange);
            // action._stateInverse = d.stateInverse === null ? null : Change.import(classMap, d.stateInverse);
            action._data = d.data;
            action._inverseData = d.inverseData;
            action._stateData = d.stateData;
            action._stateInverseData = d.stateInverseData;
            action._id = d.id;
            action._attrs = d.attrs;
            action._uplinkTag = d.uplinkTag;
            action._recordedAt = d.recordedAt;
            action._timezoneOffset = d.timezoneOffset;
            action._comments = d.comments;
            action._sessionId = d.sessionId;
            action._thumbnail = d.thumbnail;
            action.createAllChanges();
            return action;
        }
    }]);

    return Action;
}((0, _mixins.AttrsMixin)((0, _mixins.EventMixin)(ActionBase)));

function createActionClass(name) {
    var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var inverse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var stateChange = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var stateInverse = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    var cls = function (_Action) {
        _inherits(cls, _Action);

        function cls() {
            var _ref;

            _classCallCheck(this, cls);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _possibleConstructorReturn(this, (_ref = cls.__proto__ || Object.getPrototypeOf(cls)).call.apply(_ref, [this].concat(args)));
        }

        _createClass(cls, [{
            key: "createChange",
            value: function createChange() {
                if (change) {
                    return new change(this.data);
                }
                return null;
            }
        }, {
            key: "createInverse",
            value: function createInverse() {
                if (inverse) {
                    return new inverse(this.inverseData);
                }
                return null;
            }
        }, {
            key: "createStateChange",
            value: function createStateChange() {
                if (stateChange) {
                    return new stateChange(this.stateData);
                }
                return null;
            }
        }, {
            key: "createStateInverse",
            value: function createStateInverse() {
                if (stateInverse) {
                    return new stateInverse(this.stateInverseData);
                }
                return null;
            }
        }], [{
            key: "getClassName",
            value: function getClassName() {
                return name;
            }
        }]);

        return cls;
    }(Action);
    // for debugging purposes (prints nicer in console)
    Object.defineProperty(cls.constructor, "name", { value: name });
    Object.defineProperty(cls, "name", { value: name });
    // console.log("DEFINED CLASS", name, cls.constructor.name);
    return cls;
}

exports.Action = Action;
exports.createActionClass = createActionClass;

},{"./change":15,"./helpers":18,"./mixins":23,"clone":4}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AsyncTask = function AsyncTask(fn) {
  _classCallCheck(this, AsyncTask);

  setTimeout(fn, 0);
};

exports.AsyncTask = AsyncTask;

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createStateChangeClass = exports.createChangeClass = exports.OnDemandState = exports.Checkpoint = exports.StateChange = exports.Change = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require("./helpers");

var _mixins = require("./mixins");

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
// -----------------------------------------------------
// Note:
// -----------------------------------------------------
// This module requires `src/core/rasterizer` module
// while working in browser to capture thumbnails. It
// will be bundled by browserify into SIMProv.rasterizer.
// Do not - require('rasterizer') as it will break the
// unit tests in node.
// ------------------------------------------------------

var clone = require("clone");
/**
 * A change represents the data changed in visualization
 *
 * @module Change
 */

var ChangeBase = function ChangeBase() {
    _classCallCheck(this, ChangeBase);
};

var Change = function (_AttrsMixin) {
    _inherits(Change, _AttrsMixin);

    /**
     * Initializes the class
     *
     * @name initialize
     * @memberof Action
     * @instance
     */
    function Change(data) {
        var cost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.5;

        _classCallCheck(this, Change);

        // Create GUID
        var _this = _possibleConstructorReturn(this, (Change.__proto__ || Object.getPrototypeOf(Change)).call(this));

        _this._id = (0, _helpers.guid)();

        // Attributes
        _this._attrs = {};

        // Action
        _this._action = null;

        // Data recorded
        _this._data = data;

        _this._cost = cost;
        return _this;
    }

    // ------------------------------
    // Getters and Setters
    // ------------------------------

    /**
     * Return a GUID that uniqly identifies the change. GUID is a 16 character alphanumeric string.
     *
     * @name id
     * @memberof Change
     * @instance
     * @return {String} - GUID created for action
     */


    _createClass(Change, [{
        key: "id",
        value: function id() {
            return this._id;
        }
    }, {
        key: "run",
        value: function run() {
            throw new TypeError("Must override method run for each Change subclass");
        }

        /**
         * Exports a change
         *
         * @name export
         * @memberof Change
         * @instance
         * @return {Object} - exported object
         */

    }, {
        key: "export",
        value: function _export() {
            console.log("EXPORTING CHANGE");
            return {
                id: this.id(),
                cls: this.constructor.getClassName(),
                attrs: this.attrs(),
                data: this.data
            };
        }
    }, {
        key: "action",


        /**
         * Returns an action that was recorded into change
         *
         * @name action
         * @memberof Change
         * @instance
         * @return {@link Action} - Action
         */
        get: function get() {
            return this._action;
        },
        set: function set(action) {
            this._action = action;
        }
    }, {
        key: "cost",
        get: function get() {
            return this._cost;
        },
        set: function set(c) {
            this._cost = c;
        }
        /**
         * Data that was recorded as a change
         *
         * @name data
         * @memberof Change
         * @instance
         * @return {Object | Array | Number | String } - data recorded
         */

    }, {
        key: "data",
        get: function get() {
            return this._data;
        }
    }], [{
        key: "getClassName",
        value: function getClassName() {
            throw new TypeError("Subclass must define getClassName function");
        }
    }, {
        key: "import",
        value: function _import(classMap, d) {
            var cls = classMap.get(d.cls);
            var change = new cls(d.data);
            change._id = d.id;
            change._attrs = d.attrs;
            // change._data = d.data;
            return change;
        }
    }]);

    return Change;
}((0, _mixins.AttrsMixin)(ChangeBase));

var StateChange = function (_Change) {
    _inherits(StateChange, _Change);

    function StateChange(data) {
        var cost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        _classCallCheck(this, StateChange);

        return _possibleConstructorReturn(this, (StateChange.__proto__ || Object.getPrototypeOf(StateChange)).call(this, data, cost));
    }

    _createClass(StateChange, [{
        key: "run",
        value: function run(state) {
            throw new TypeError("Must override method run for each StateChange subclass");
        }
    }]);

    return StateChange;
}(Change);

var Checkpoint = function (_Change2) {
    _inherits(Checkpoint, _Change2);

    function Checkpoint(state) {
        var cost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

        _classCallCheck(this, Checkpoint);

        return _possibleConstructorReturn(this, (Checkpoint.__proto__ || Object.getPrototypeOf(Checkpoint)).call(this, state, cost));
    }

    _createClass(Checkpoint, [{
        key: "run",
        value: function run() {
            return clone(this.data);
        }
    }, {
        key: "getClassName",
        value: function getClassName() {
            return "Checkpoint";
        }
    }]);

    return Checkpoint;
}(Change);

var OnDemandState = function (_Change3) {
    _inherits(OnDemandState, _Change3);

    function OnDemandState(cb) {
        var cost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

        _classCallCheck(this, OnDemandState);

        var _this4 = _possibleConstructorReturn(this, (OnDemandState.__proto__ || Object.getPrototypeOf(OnDemandState)).call(this, null, cost));

        _this4._cb = cb;
        return _this4;
    }

    _createClass(OnDemandState, [{
        key: "run",
        value: function run() {
            return this._cb();
        }
    }]);

    return OnDemandState;
}(Change);

function createChangeClass(class_name, run_f) {
    var base_cost = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.5;

    var cls = function (_Change4) {
        _inherits(cls, _Change4);

        function cls(data) {
            var cost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : base_cost;

            _classCallCheck(this, cls);

            // console.log("CONSTRUCTING", class_name, data);
            return _possibleConstructorReturn(this, (cls.__proto__ || Object.getPrototypeOf(cls)).call(this, data, cost));
        }

        _createClass(cls, [{
            key: "run",
            value: function run() {
                return run_f.bind(this)();
            }
        }], [{
            key: "getClassName",
            value: function getClassName() {
                return class_name;
            }
        }]);

        return cls;
    }(Change);
    //console.log("CREATED", cls);
    // for debugging purposes (prints nicer in console)
    Object.defineProperty(cls.constructor, "name", { value: class_name });
    Object.defineProperty(cls, "name", { value: class_name });
    // console.log("CREATED CHANGE", class_name, cls.constructor.name);
    return cls;
}

function createStateChangeClass(class_name, run_f) {
    var base_cost = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    var cls = function (_StateChange) {
        _inherits(cls, _StateChange);

        function cls(data) {
            var cost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : base_cost;

            _classCallCheck(this, cls);

            return _possibleConstructorReturn(this, (cls.__proto__ || Object.getPrototypeOf(cls)).call(this, data, cost));
        }

        _createClass(cls, [{
            key: "run",
            value: function run(state) {
                return run_f.bind(this)(state);
            }
        }], [{
            key: "getClassName",
            value: function getClassName() {
                return class_name;
            }
        }]);

        return cls;
    }(StateChange);
    //console.log("CREATED", cls);
    // for debugging purposes (prints nicer in console)
    Object.defineProperty(cls.constructor, "name", { value: class_name });
    Object.defineProperty(cls, "name", { value: class_name });
    //cls.constructor.name = class_name;
    // console.log("CREATED STATE CHANGE", class_name, cls.constructor.name);
    // console.log(cls);
    return cls;
}

// ------------------------------
// Export
// ------------------------------

exports.Change = Change;
exports.StateChange = StateChange;
exports.Checkpoint = Checkpoint;
exports.OnDemandState = OnDemandState;
exports.createChangeClass = createChangeClass;
exports.createStateChangeClass = createStateChangeClass;

},{"./helpers":18,"./mixins":23,"clone":4}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckpointManager = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _navigation = require("../navigation");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clone = require("clone");

var CheckpointManager = function () {

  /**
   * Initializes the class
   *
   * @name initialize
   * @memberof CheckpointManager
   * @instance
   */
  function CheckpointManager(trail) {
    _classCallCheck(this, CheckpointManager);

    // Trail
    this._trail = trail;

    // Checkpoint Rules
    this._rules = [];
  }

  /**
   * sets a checkpoint
   *
   * @name set
   * @memberof CheckpointManager
   * @instance
   * @param {Function} callback - that gets a checkpoint
   */


  _createClass(CheckpointManager, [{
    key: "addRule",
    value: function addRule(rule) {
      if (rule && typeof rule === 'function') this._rules.push(rule);
      return this;
    }

    /**
     * Checks if change satifies the any of the checkpoint rule
     *
     * @name applyRules
     * @memberof CheckpointManager
     * @instance
     * @param {@link Change} - change to which rules are to be applied
     */

  }, {
    key: "applyRules",
    value: function applyRules(change) {
      return this._rules.some(function (rule) {
        var isTrue = rule(change);
        return isTrue;
      });
    }

    /**
     * Return all the rules
     *
     * @name rules
     * @memberof CheckpointManager
     * @instance
     */

  }, {
    key: "rules",
    value: function rules() {
      return this._rules;
    }

    /**
     * Clears checkpoint rules
     *
     * @name clearRules
     * @memberof CheckpointManager
     * @instance
     * @param {@link Change} - change to which rules are to be applied
     */

  }, {
    key: "clearRules",
    value: function clearRules(change) {
      this._rules = [];
      return this;
    }

    /**
     * Makes a checkpoint
     *
     * @name set
     * @memberof CheckpointManager
     * @instance
     * @param {Function} callback - that gets a checkpoint
     */

  }, {
    key: "makeCheckpoint",
    value: function makeCheckpoint(change) {

      // Hold `this`
      var thiss = this;

      // If change is the current change then get fresh checkpoint data from viz
      // Else compute a state and set as checkpoint data
      var new_checkpoint = false;
      if (change.nodeInMasterTrail() === thiss._trail.currentNode()) {
        change.checkpointData(thiss._trail._getStateCallback());
        new_checkpoint = true;
      } else {
        var bestPath = (0, _navigation.computeBestPath)(thiss._trail, thiss._trail.currentNode(), change.nodeInMasterTrail(), true, true);
        if (bestPath) {
          var state = null;
          bestPath.forEach(function (c) {
            state = c.run(state);
          });
          if (state) {
            change.checkpointData(state);
            new_checkpoint = true;
          }
        }
      }

      // Event callback
      if (new_checkpoint) {
        thiss._trail._events.checkpointCreated.forEach(function (cb) {
          cb(null, change);
        });
      }
    }

    /**
     * Checks sub tree for checkpoint
     *
     * @name set
     * @memberof CheckpointManager
     * @instance
     * @param {Function} callback - that gets a checkpoint
     */

  }, {
    key: "checkSubTree",
    value: function checkSubTree(currentNode) {

      var thiss = this;

      // Recur over outer nodes
      (function recurOuter(outerNode, visited) {

        // Start Exploring Children
        var found = function recur(node, visited) {

          // Check if already visited
          if (visited.indexOf(node) > -1) return;

          // Add to Visited
          visited.push(node);

          // Change in Node
          var change = thiss._trail.getActionById(node.data().key);

          // Check for checkpoint
          if (change.isCheckpoint()) return;

          // Apply Rules
          if (thiss.applyRules(change)) {
            thiss.makeCheckpoint(change);
          }

          // Recur over childs
          node.childNodes().forEach(function (_child) {
            recur(_child, visited);
          });
        }(outerNode, visited);

        // Go to Parent
        if (outerNode.parentNode()) {
          return recurOuter(outerNode.parentNode(), visited);
        }
      })(currentNode, []);
    }
  }, {
    key: "allCheckpoints",
    value: function allCheckpoints() {
      // traversal
      var visited = new Set();
      var queue = [this._trail.getActionById('root-node').nodeInMasterTrail()];
      while (queue.length > 0) {
        var node = queue.shift();
        if (node && !visited.has(node)) {
          visited.add(node);
          var action = this._trail.getActionById(node.data().key);
          if (!action.hasCheckpoint() && this.applyRules(action)) {
            this.makeCheckpoint(action);
          }
          queue.push.apply(queue, _toConsumableArray(node.childNodes()));
        }
      }
    }
  }]);

  return CheckpointManager;
}();

exports.CheckpointManager = CheckpointManager;

},{"../navigation":24,"clone":4}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

exports.guid = guid;

},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTime = exports.guid = undefined;

var _guid = require("./guid");

var _parseTime = require("./parseTime");

exports.guid = _guid.guid;
exports.parseTime = _parseTime.parseTime;

},{"./guid":17,"./parseTime":19}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function parseTime(timestamp, timezoneOffset) {

    // Validate offset
    if (!timezoneOffset) timezoneOffset = 0;

    // Month Names
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Create Date
    var date = new Date(timestamp + timezoneOffset);

    // Return Parsed Date
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

exports.parseTime = parseTime;

},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Trail = undefined;

var _masterTrail = require("./trails/masterTrail");

exports.Trail = _masterTrail.Trail;

},{"./trails/masterTrail":31}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AttrsMixin = function AttrsMixin(superclass) {
    return function (_superclass) {
        _inherits(_class, _superclass);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'attr',

            // Set or Get attrs
            value: function attr(key, value) {
                if (!this.hasOwnProperty('_attrs')) this._attrs = {};
                if (!key || typeof key !== 'string') {
                    return this._attrs;
                } else {
                    if (arguments.length > 1) {
                        this._attrs[key] = value;
                        return this;
                    } else if (this._attrs.hasOwnProperty(key)) {
                        return this._attrs[key];
                    }
                }
            }

            // Extend Attrs

        }, {
            key: 'attrs',
            value: function attrs(atrs) {
                if (!this.hasOwnProperty('_attrs')) this._attrs = {};
                if (arguments.length) {
                    if ((typeof atrs === 'undefined' ? 'undefined' : _typeof(atrs)) === 'object') {
                        for (var key in atrs) {
                            if (atrs.hasOwnProperty(key)) {
                                this._attrs[key] = atrs[key];
                            }
                        }
                    }
                    return this;
                }
                return this._attrs;
            }

            // Remove Attrts

        }, {
            key: 'removeAttr',
            value: function removeAttr(key) {
                if (!this.hasOwnProperty('_attrs')) this._attrs = {};
                if (key && this._attrs.hasOwnProperty(key)) {
                    delete this._attrs[key];
                }
            }
        }]);

        return _class;
    }(superclass);
};

// ------------------------------
// Export
// ------------------------------

exports.AttrsMixin = AttrsMixin;

},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventMixin = function EventMixin(superclass) {
    return function (_superclass) {
        _inherits(_class, _superclass);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'on',

            // Register Handlers
            value: function on(evt, callback) {

                // Hold `this`
                var thiss = this;

                // Check `_events` exists
                if (!thiss.hasOwnProperty('_events')) thiss._events = {};

                // Check if array
                if (Array.isArray(evt)) evt.forEach(addEvt);else addEvt(evt);

                // Add callback to event list
                function addEvt(evt) {
                    if (typeof evt === 'string' && thiss._events.hasOwnProperty(evt)) {
                        thiss._events[evt].push(callback);
                    }
                }

                return this;
            }

            // Trigger Event

        }, {
            key: 'triggerEvent',
            value: function triggerEvent(evts, args) {

                // Hold `this`
                var thiss = this;

                // Convert Array
                if (!Array.isArray(evts)) evts = [evts];

                // Prepend event name to argument list before trigerring
                evts.forEach(function (evt) {
                    if (thiss._events && thiss._events.hasOwnProperty(evt)) {
                        thiss._events[evt].forEach(function (cb) {
                            var nArgs = args.slice();
                            nArgs.unshift(evt);
                            cb.apply(thiss, nArgs);
                        });
                    }
                });
            }
        }]);

        return _class;
    }(superclass);
};

// ------------------------------
// Export
// ------------------------------

exports.EventMixin = EventMixin;

},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventMixin = exports.AttrsMixin = undefined;

var _attrs = require("./attrs");

var _events = require("./events");

exports.AttrsMixin = _attrs.AttrsMixin;
exports.EventMixin = _events.EventMixin;

},{"./attrs":21,"./events":22}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.computeBestPath = undefined;

var _change = require("./change");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var clone = require("clone");

function nearestCheckpoints(trail, toNode) {
    var useInverses = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var num = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;


    // Check if checkpoint rules are set
    if (num < 1 || trail.checkpoint().rules().length === 0) {
        return [];
    }

    var checkpoints = [];
    var count = 0;
    // Check if destination itself is checkpoint
    if (toNode && trail.getActionById(toNode.data().key).hasCheckpoint()) {
        checkpoints.push(toNode);
        count += 1;
    }

    // BFS search
    var visited = new Set();
    var queue = [toNode];
    while (count < num && queue.length > 0) {
        var node = queue.shift();
        if (node && !visited.has(node)) {
            visited.add(node);
            if (trail.getActionById(node.data().key).hasCheckpoint()) {
                checkpoints.push(node);
                count += 1;
            }
            queue.push(node.parentNode());
            if (useInverses) {
                queue.push.apply(queue, _toConsumableArray(node.childNodes()));
            }
        }
    }

    return checkpoints;
}

function computeBestPath(trail, fromNode, toNode) {
    var useInverses = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var useOnlyState = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var maxCheckpoints = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 5;
    var logOptions = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

    // set maxCheckpoints=0 for no state

    // options:
    // * if new node is descendant, change down to new node
    // * if new node is descendant, changeState down to new node
    // * reset to root and change down to new node
    // * grab root state and stateChange down to new node, then set to state
    // * if new node is parent, inverse up to new node (requires all inverses to exist)
    // * if new node is parent, stateInverse up to new node (requires all stateInverses to exist)
    // * if new node is neither child or descendant, have inverse path + forward path possible
    //   -- again can do either stateInverses/stateChanges or inverses/changes dependending on availability
    // * if have checkpoints, find nearest N? and the paths from those checkpoint, choose lowest cost

    // need paths to be able to check
    // want to have cost for each action type and state setting...

    var tree = trail.versionTree();

    // need to reset useOnlyState if we cannot get state...
    if (useOnlyState && trail.getState() === null) {
        useOnlyState = false;
    }

    // TODO how to determine when to not search inverse checkpoints?
    var checkpoints = nearestCheckpoints(trail, toNode, useInverses, maxCheckpoints);
    // console.log("CHECKPOINTS",checkpoints);
    var rootNode = trail.getActionById('root-node').nodeInMasterTrail();
    var starts = [].concat(_toConsumableArray(checkpoints));
    if (starts.indexOf(fromNode) <= -1) {
        starts = [fromNode].concat(_toConsumableArray(starts));
    }
    if (starts.indexOf(rootNode) <= -1) {
        starts = [].concat(_toConsumableArray(starts), [rootNode]);
    }

    if (logOptions) console.log("STARTS:", starts);

    var changelists = starts.map(function (startNode) {
        // calculate path
        var changes = [];
        var stateChanges = [];
        var commonParent = tree.findCommonParent(startNode, toNode);
        var changesValid = true;
        var stateChangesValid = true;

        var node = startNode;
        if (startNode === rootNode) {
            changes.push(trail.resetChange);
            var action = trail.getActionById(rootNode.data().key);
            if (maxCheckpoints > 0 && action.checkpoint) {
                stateChanges.push(action.checkpoint);
            } else {
                stateChangesValid = false;
            }
        } else if (startNode !== fromNode) {
            changesValid = false;
            var _action = trail.getActionById(startNode.data().key);
            stateChanges.push(_action.checkpoint);
        } else if (trail.getState() !== null) {
            // have fromNode, but don't necessarily want to create this...
            stateChanges.push(new _change.OnDemandState(trail.getState()));
        } else {
            stateChangesValid = false;
        }
        while (node !== commonParent) {
            var _action2 = trail.getActionById(node.data().key);
            if (useInverses && changesValid && _action2.hasInverse()) {
                changes.push(_action2.inverse);
            } else {
                changesValid = false;
            }
            if (useInverses && stateChangesValid && _action2.hasStateInverse()) {
                stateChanges.push(_action2.stateInverse);
            } else {
                stateChangesValid = false;
            }
            node = node.parentNode();
        }
        var revChanges = [];
        var revStateChanges = [];
        node = toNode;
        while (node !== commonParent) {
            var _action3 = trail.getActionById(node.data().key);
            if (changesValid) {
                revChanges.push(_action3.change);
            }
            if (stateChangesValid && _action3.hasStateChange()) {
                revStateChanges.push(_action3.stateChange);
            } else {
                stateChangesValid = false;
            }
            node = node.parentNode();
        }
        revChanges.reverse();
        revStateChanges.reverse();
        changes.push.apply(changes, revChanges);
        stateChanges.push.apply(stateChanges, revStateChanges);

        // console.log('CHANGES:', changes);
        // console.log('STATE CHANGES:', stateChanges);

        var retval = [];
        if (!useOnlyState && changesValid) {
            var cost = changes.reduce(function (total, c) {
                return total + c.cost;
            }, 0);
            if (logOptions) {
                console.log('CHANGES:', cost, changes);
            }
            retval.push({ 'cost': cost, 'changes': changes });
        }
        if (stateChangesValid) {
            var _cost = stateChanges.reduce(function (total, c) {
                return total + c.cost;
            }, 0);
            if (logOptions) {
                console.log('STATE CHANGES:', _cost, stateChanges);
            }
            retval.push({ 'cost': _cost, 'changes': stateChanges });
        }
        return retval;
    });

    var options = [].concat.apply([], changelists);
    if (logOptions) {
        console.log("OPTIONS:", options);
    }
    if (options.length < 1) {
        return null;
    }

    var best = options.reduce(function (a, b) {
        return a.cost < b.cost ? a : b;
    });
    if (logOptions) {
        console.log("BEST:", best);
    }

    return best.changes;
}

exports.computeBestPath = computeBestPath;

},{"./change":15,"clone":4}],25:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var rasterizeHTML = require('rasterizehtml/dist/rasterizeHTML.allinone'),
    cssExtractor = require('./css-extractor');

module.exports = function (doc) {

  // Hold extracted CSS
  var extractedCSSDOM = null;

  // Capture HTML
  var captureHTML = function captureHTML(selector, options, callback) {

    try {
      // Default Options
      var opts = {
        fillStyle: '#FFFFFF',
        encoding: 'png',
        scale: 1,
        quality: 1.0,
        targetHeight: 200
      };

      // Format Options
      if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
        Object.keys(opts).forEach(function (key) {
          if (options.hasOwnProperty(key)) {
            opts[key] = options[key];
          }
        });
      }

      // Extract and Save CSS
      if (!extractedCSSDOM) {
        extractedCSSDOM = cssExtractor.extract(doc);
      }

      // Clone document and append extracted css to document.body
      var clonedDocument = doc.cloneNode(true);
      clonedDocument.body.appendChild(extractedCSSDOM);

      // Get Body and HTML
      var body = doc.body,
          html = doc.documentElement;

      // Compute Max Height
      var maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

      // Compute Max Width
      var maxWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

      // Create temporary canvas element
      var canvas = clonedDocument.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      canvas.id = "ra-canvas";

      // Modify Context of Canvas
      var context = canvas.getContext("2d");
      context.fillStyle = opts.fillStyle;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Rasterize the entire document
      var elementDOM = doc.querySelector(selector);

      // Size and Offsets
      var height = Math.max(elementDOM.clientHeight, elementDOM.scrollHeight),
          width = Math.max(elementDOM.clientWidth, elementDOM.scrollWidth),
          topOffset = elementDOM.offsetTop,
          leftOffset = elementDOM.offsetLeft;

      // Draw HTML
      // Draw rasterized document
      rasterizeHTML.drawHTML(clonedDocument.body.outerHTML, canvas).then(function (renderResult) {

        // Scale
        var scale = opts.scale,
            canvasCtx = canvas.getContext("2d");

        // Clear existing content
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Resize Canvas
        var aspectRatio = width / height;
        var targetHeight = opts.targetHeight * scale;
        var targetWidth = aspectRatio * targetHeight;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        // canvas.width = width * scale;
        // canvas.height = height * scale;

        // Draw Image
        canvasCtx.drawImage(renderResult.image, leftOffset, topOffset, width, height, 0, 0, targetWidth, targetHeight);

        // Get base64
        var imageBase64 = canvas.toDataURL("image/" + opts.encoding, opts.quality);

        // Send result back
        if (callback) callback(null, imageBase64);
      }, function error(e) {
        console.log("ERROR", e);
        if (callback) return callback(e, null);
      });
    } catch (e) {
      console.log("ERROR", e);
      if (callback) return callback(e, null);
    }
  };

  return captureHTML;
}(typeof window !== 'undefined' ? window.document : null);

},{"./css-extractor":26,"rasterizehtml/dist/rasterizeHTML.allinone":11}],26:[function(require,module,exports){
'use strict';

module.exports = function () {

  var cssExtractor = {
    extract: function extract(doc) {

      // Create Style Element
      var styleDOM = doc.createElement('style');
      styleDOM.type = 'text/css';

      // Hold Extracted CSS
      var css = "";

      // Loop Over Stylesheets
      for (var s = doc.styleSheets.length - 1; s >= 0; s--) {
        var cssRules = doc.styleSheets[s].rules || doc.styleSheets[s].cssRules || []; // IE supp
        for (var c = 0; c < cssRules.length; c++) {
          css += cssRules[c].cssText;
        }
      }

      // Add css to created style element
      if (styleDOM.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        styleDOM.appendChild(doc.createTextNode(css));
      }

      return styleDOM;
    }
  };

  return cssExtractor;
}();

},{}],27:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// -----------------------------------------------------
// Note:
// -----------------------------------------------------
// This module is required `src/core/change` module
// while working in browser to capture thumbnails. It
// will be bundled by browserify into SIMProv.rasterizer.
// Do not - require('rasterizer') as it will break the
// unit tests in node.
// ------------------------------------------------------

(function () {

  // Rasterizer
  var rasterizer = {
    captureHTML: require('./captureHTML')
  };

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  // Taken From: Underscore.js - https://github.com/jashkenas/underscore
  var root = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self.self === self && self || (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global.global === global && global || this;

  // Export
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = rasterizer;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return rasterizer;
    });
  }if (root.SIMProv) root.SIMProv.rasterizer = rasterizer;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./captureHTML":25}],28:[function(require,module,exports){
"use strict";

module.exports = function () {

  'use strict';

  // ------------------------------
  // Basic Setup
  // ------------------------------

  // Request Maker

  function RequestMaker(url, verb) {

    // Fields
    this.url = url;
    this.headers = [];

    // Add header
    this.header = function (key, value) {
      this.headers.push({ key: key, value: value });
      return this;
    };

    // Prepare XHR
    this.make = function (method, data, success, fail) {

      // XHR Request
      var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
      xhr.open(method, this.url, true);

      // Add Headers
      this.headers.forEach(function (header) {
        xhr.setRequestHeader(header.key, header.value);
      });

      // Ready State Change
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            success(xhr.responseText);
          } else {
            fail({ status: xhr.status, statusText: xhr.statusText });
          }
        }
      };

      // Send Request
      try {
        xhr.send(data);
      } catch (e) {
        reject(e);
      }

      return xhr;
    };

    // Get
    this.get = function () {
      var thiss = this;
      return new Promise(function (resolve, reject) {
        thiss.make("GET", null, resolve, reject);
      });
    };

    // Post
    this.post = function (data) {
      var thiss = this;
      return new Promise(function (resolve, reject) {
        var xhr = thiss.make("POST", data, resolve, reject);
      });
    };
  }

  // API
  var request = {
    xhr: function xhr(url) {
      return new RequestMaker(url);
    }
  };

  // ------------------------------
  // Export
  // ------------------------------

  return request;
}();

},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Exports the trail information in json
 *
 * @module share/exporter
 */
var Exporter = function () {
  function Exporter() {
    _classCallCheck(this, Exporter);
  }

  _createClass(Exporter, null, [{
    key: 'export',


    /**
     * Exports the trail
     *
     * @name export
     * @memberof exporter
     */
    value: function _export(trail, signature) {
      var thumbnails = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      console.log("RUNNING EXPORT", signature);

      // If not signature
      if (!signature || typeof signature !== 'string' || signature.length === 0) throw new Error('Invalid Signature. Aborting Export.');

      // Export Version Store
      // Format of export is iterable array using which Map can be re-constructed
      var versions = [];
      trail.versionStore().forEach(function (value, key) {
        console.log("EXPORTING ACTION", trail.getActionById(key));
        versions.push([key, trail.getActionById(key).export(thumbnails)]);
      });

      // Current Timestamp
      var timestamp = new Date().getTime();

      return {

        // Trail Setup
        trailId: trail.id(),
        sessions: trail.sessions().concat([{
          'sessionId': SIMProv.sessionId,
          'author': signature,
          'sessionStart': SIMProv.sessionStart,
          'sessionEnd': timestamp
        }]),
        createdAt: trail.createdAt(),
        timezoneOffset: trail.timezoneOffset(),
        exportedAt: timestamp,
        attrs: trail.attrs(),
        url: window.location.href,

        // Current Version Tracking
        currentVersion: trail.currentVersion(),
        currentBranchVersions: trail.currentBranchVersions(),

        // Version Store
        // version Store gets exported in an array
        versionStore: versions,

        // Version Tree
        versionTree: trail.versionTree().export(function (data) {
          return {
            key: data.key
          };
        })

      };
    }

    // /**
    //  * Exports a change
    //  *
    //  * @name exportAction
    //  * @memberof Exporter
    //  */
    // exportAction(action) {
    //   return {
    //     id: action.id(),
    //     attrs: action.attrs(),
    //     uplinkTag: action.uplinkTag(),
    //     recordedAt: action.recordedAt(),
    //     timezoneOffset: action.timezoneOffset(),
    //     // data: action.data(),
    //     // action: action.action() ? action.action().label() : null,
    //     // checkpointData: action.checkpointData(),
    //     thumbnail: action.thumbnail(),
    //     comments: action.comments(),
    //     sessionId: action.sessionId(),
    //   };
    // }

  }]);

  return Exporter;
}();

exports.Exporter = Exporter;

},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Importer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//import { Navigation } from "../navigation";


require("data-tree");

var _change = require("../change");

var _asyncTask = require("../asyncTask");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Imports the trail
 *
 * @module share/exporter
 */
var Importer = function () {
  function Importer() {
    _classCallCheck(this, Importer);
  }

  _createClass(Importer, [{
    key: "buildVersionTree",


    /**
     * Builds a version tree
     *
     * @name buildVersionTree
     * @memberof importer
     */
    value: function buildVersionTree(data) {
      var tree = dataTree.create();
      tree.import(data, 'children', function (nodeData) {
        return nodeData;
      });
      return tree;
    }

    /**
     * Imports a change
     *
     * @name importer
     * @memberof importer
     */

  }, {
    key: "importChange",
    value: function importChange(record, trail) {
      //TODO: Fix this, moved data
      var change = new _change.Change();
      change._id = record.id;
      change._recordedAt = record.recordedAt;
      change._data = record.data;
      change._checkpointData = record.checkpointData;
      change._uplinkTag = record.uplinkTag;
      change._thumbnail = record.thumbnail;
      change._timezoneOffset = record.timezoneOffset;
      change._comments = record.comments;
      change._sessionId = record.sessionId;
      change._action = importer.getActionByLabel(trail, record.action);
      return change;
    }
  }, {
    key: "getActionByLabel",
    value: function getActionByLabel(trail, label) {
      var action = null;
      trail.actions().some(function (ac) {
        if (ac.label() === label) {
          action = ac;
          return true;
        }
      });
      return action;
    }
  }], [{
    key: "import",


    /**
     * Imports the trail
     *
     * @name importer
     * @memberof importer
     */
    value: function _import(trail, trailData) {
      console.log("data", trail, trailData);

      // Validate
      if (!trailData || !trailData.trailId || typeof trailData.trailId !== 'string') return alert('Import Failed.\nError: Invalid trail id');

      // Import and override trail properties
      trail._id = trailData.trailId;
      trail._sessions = trailData.sessions;
      trail._initiatedAt = trailData.initiatedAt;
      trail._currentBranchVersions = trailData.currentBranchVersions;

      // Import and Override attributes
      trail._attrs = trailData.attrs;

      // Import Version Store
      // Also creates and imports changes
      // Does not set nodeInMasterTrail yet
      trail._versionStore = new Map();
      if (trailData.versionStore && Array.isArray(trailData.versionStore)) {
        trailData.versionStore.forEach(function (record) {
          if (record[0].length) {
            trail._versionStore.set(record[0], trail.importAction(record[1]));
          }
        });
      }

      // Import Master Version Tree
      trail._versionTree = dataTree.create();
      trail._versionTree.import(trailData.versionTree, 'children', function (nodeData) {
        return nodeData;
      });

      // Set Nodes in Master Trail
      // Set Uplink
      trail._versionTree.traverser().traverseBFS(function (node) {
        var action = trail.getActionById(node.data().key);
        action.nodeInMasterTrail(node);
        if (action.uplinkTag() && !action.uplink()) {
          new _asyncTask.AsyncTask(function () {
            (function recur(innerNode) {
              if (innerNode) {
                if (trail.getActionById(innerNode.data().key).uplinkTag() === action.uplinkTag()) {
                  action.uplink(trail.getActionById(innerNode.data().key));
                } else {
                  recur(innerNode.parentNode());
                }
              }
            })(action.nodeInMasterTrail().parentNode());
          });
        }
      });

      // Import is success
      // Load current version from trailData
      trail.changeVersion(trailData.currentVersion);
    }
  }]);

  return Importer;
}();

exports.Importer = Importer;

},{"../asyncTask":14,"../change":15,"data-tree":5}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Trail = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require("../helpers");

var _action = require("../action");

var _change = require("../change");

var _checkpointManager = require("../checkpoint/checkpointManager");

var _navigation = require("../navigation");

var _exporter = require("../share/exporter");

var _importer = require("../share/importer");

var _request = require("../request");

var _asyncTask = require("../asyncTask");

var _mixins = require("../mixins");

require("data-tree");

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clone = require("clone");

/**
 * Trail represents a master trail using which sub trails can be created.
 * Sub trails watches over the state of visualization and records changes
 * upon interaction while master trail maintains the sequence of records
 * occured in sub trails.
 *
 * @module trails/masterTrail
 */

var TrailBase = function TrailBase() {
  _classCallCheck(this, TrailBase);
};

var Trail = function (_AttrsMixin) {
  _inherits(Trail, _AttrsMixin);

  /**
   * Initializes the class
   *
   * @name initialize
   * @memberof Trail
   * @instance
   */
  function Trail() {
    _classCallCheck(this, Trail);

    // Hold `this`
    var _this = _possibleConstructorReturn(this, (Trail.__proto__ || Object.getPrototypeOf(Trail)).call(this));

    var thiss = _this;

    // Guid that uniqly identifies the trail
    _this._id = (0, _helpers.guid)();

    // Timestamp at which trail was created
    _this._createdAt = new Date().getTime();

    // Timezone in which trail is created
    _this._timezoneOffset = new Date().getTimezoneOffset();

    // Last Exported
    _this._lastExportedAt = null;

    // Attributes
    _this._attrs = {};

    // Version Tree
    _this._versionTree = dataTree.create();

    // Config
    _this._configs = {
      checkpointStepSize: 5
    };

    // Version Store
    // Add a root node
    _this._versionStore = new Map();

    // Current Branch versions
    _this._currentBranchVersions = ['root-node'];

    // Wait State
    _this._isIdle = false;

    // Add CheckpointManager
    _this._checkpointManager = new _checkpointManager.CheckpointManager(_this);

    // Github access token
    _this._githubAccessToken = null;

    // Get and Set State Callback
    _this._getStateCallback = null;
    _this._setStateCallback = null;

    _this._resetChange = null;

    // Holds actions created so that they should not get
    // lost across trail import. Actions does not get overwritten
    // upon new trail import.
    _this._actions = [];

    // Previous Sessions
    _this._sessions = [];

    // Add Master Trail specific events
    // Events
    _this._events = {
      'changeRecorded': [],
      'thumbnailCaptured': [],
      'trailExported': [],
      'trailImported': [],
      'gistExported': [],
      'gistImported': [],
      'changeVersion': [],
      'checkpointCreated': []
    };

    // Current Version Node
    _this._versionTree.insert({
      key: 'root-node',
      trailId: thiss._id
    });

    // Add Root Node and Update Id
    _this._versionStore.set('root-node', new _action.Action("ROOT"));
    _this._versionStore.get('root-node')._id = 'root-node';
    _this._versionStore.get('root-node').attr('order', 0);
    _this._versionStore.get('root-node').nodeInMasterTrail(_this._versionTree.rootNode());
    _this._versionStore.get('root-node').on('thumbnailCaptured', function (img, change) {
      thiss._events.thumbnailCaptured.forEach(function (cb) {
        cb(img, change);
      });
    });

    // Add Checkpoint Rule
    _this._checkpointManager.addRule(function (change) {
      return change.attr('order') % thiss._configs.checkpointStepSize === 0;
    });

    _this._classes = new Map();
    _this._classes.set("Action", _action.Action);
    _this._classes.set("Checkpoint", _change.Checkpoint);
    return _this;
  }

  // ------------------------------
  // Getters and Setters
  // ------------------------------

  /**
   * Return a GUID that uniqly identifies the trail. GUID is a 16 character alphanumeric string.
   *
   * @name id
   * @memberof BaseTrail
   * @instance
   * @return {String} - GUID
   */


  _createClass(Trail, [{
    key: "id",
    value: function id() {
      return this._id;
    }
  }, {
    key: "registerClass",
    value: function registerClass(cls) {
      //TODO fix this and make things work with static, etc.
      this._classes.set(cls.getClassName(), cls);
      // console.log(this._classes);
    }
  }, {
    key: "registerClasses",
    value: function registerClasses(cls_list) {
      var _this2 = this;

      cls_list.forEach(function (cls) {
        _this2.registerClass(cls);
      });
    }
  }, {
    key: "getClass",
    value: function getClass(cls_name) {
      return this._classes.get(cls_name);
    }
  }, {
    key: "getClassMap",
    value: function getClassMap() {
      return this._classes;
    }

    /**
     * Returns a timestamp at which trail was created.
     *
     * @name id
     * @memberof BaseTrail
     * @instance
     * @return {Number} - Timestamp in milliseconds
     */

  }, {
    key: "createdAt",
    value: function createdAt() {
      return this._createdAt;
    }

    /**
     * Returns a timestamp at which trail was exported last.
     *
     * @name lasExportedAt
     * @memberof BaseTrail
     * @instance
     * @return {Number} - Timestamp in milliseconds
     */

  }, {
    key: "lasExportedAt",
    value: function lasExportedAt() {
      return this._lastExportedAt;
    }

    /**
     * Returns a timezone offset
     *
     * @name timezoneOffset
     * @memberof BaseTrail
     * @instance
     * @return {Number} - Timezone Offset
     */

  }, {
    key: "timezoneOffset",
    value: function timezoneOffset() {
      return this._timezoneOffset;
    }

    /**
     * Returns a version tree
     *
     * @name versionTree
     * @memberof BaseTrail
     * @instance
     * @return {object} - a version tree
     */

  }, {
    key: "versionTree",
    value: function versionTree() {
      return this._versionTree;
    }

    /**
     * Returns current version
     *
     * @name currentVersion
     * @memberof BaseTrail
     * @instance
     * @return {String} - Version Key
     */

  }, {
    key: "currentVersion",
    value: function currentVersion(callback) {
      return this.currentNode().data().key;
    }

    /**
     * Returns current change
     *
     * @name currentAction
     * @memberof BaseTrail
     * @instance
     * @return {@link Change} - current change
     */

  }, {
    key: "currentAction",
    value: function currentAction(callback) {
      return this.versionStore().get(this.currentVersion());
    }

    /**
     * Returns current version node
     *
     * @name currentNode
     * @memberof BaseTrail
     * @instance
     * @return {object} - current node of version tree
     */

  }, {
    key: "currentNode",
    value: function currentNode(node) {
      if (arguments.length > 0) {
        this.versionTree()._currentNode = node;
        return this;
      }
      return this.versionTree().currentNode();
    }

    /**
     * Returns a change by id
     *
     * @name versionStore
     * @memberof BaseTrail
     * @instance
     * @return {@link Change} - change that matches id provided
     */

  }, {
    key: "getActionById",
    value: function getActionById(id) {
      if (this.versionStore().has(id)) {
        return this.versionStore().get(id);
      }
      return null;
    }

    /**
     * Sets and Gets the trail configurations
     *
     * @name configs
     * @memberof Trail
     * @instance
     * @return {@link Trail}
     */

  }, {
    key: "configs",
    value: function configs(cfgs) {
      if (arguments.length) {
        var thiss = this;
        return Object.keys(cfgs).forEach(function (cfg) {
          if (thiss.configs().hasOwnProperty(cfg)) {
            thiss._configs[cfg] = cfgs[cfg];
          }
        });
      }
      return this._configs;
    }

    /**
     * Return a version store
     *
     * @name versionStore
     * @memberof Trail
     * @instance
     * @return {Array} - array of version ids
     */

  }, {
    key: "versionStore",
    value: function versionStore() {
      return this._versionStore;
    }

    /**
     * Sets or gets the github access token
     *
     * @name renderedTo
     * @memberof Trail
     * @instance
     * @return {String} - Query Seelctor in which control box is rendered
     */

  }, {
    key: "githubAccessToken",
    value: function githubAccessToken(token) {
      if (arguments.length > 0) {
        this._githubAccessToken = token;
        return this;
      } else {
        return this._githubAccessToken;
      }
    }

    /**
     * Return whether trail is idle
     *
     * @name isIdle
     * @memberof Trail
     * @instance
     * @return {Boolean} - whether state is idle
     */

  }, {
    key: "isIdle",
    value: function isIdle() {
      return this._isIdle;
    }

    /**
     * Returns current branch version
     *
     * @name currentBranchVersions
     * @memberof Trail
     * @instance
     * @return {Array} - current versions
     */

  }, {
    key: "currentBranchVersions",
    value: function currentBranchVersions() {
      return this._currentBranchVersions;
    }

    /**
     * Gets a checkpoint Manager
     *
     * @name checkpointManager
     * @memberof Trail
     * @instance
     * @return {@link CheckpointManager}
     */

  }, {
    key: "checkpoint",
    value: function checkpoint() {
      return this._checkpointManager;
    }

    /**
     * Gets an array of actions
     *
     * @name actions
     * @memberof Trail
     * @instance
     * @return {Array} actions
     */

  }, {
    key: "actions",
    value: function actions() {
      return this._actions;
    }

    /**
     * Gets an array of previous sessions
     *
     * @name sessions
     * @memberof Trail
     * @instance
     * @return {Array} sessions
     */

  }, {
    key: "sessions",
    value: function sessions() {
      return this._sessions;
    }

    /**
     * Gets an author by session id
     *
     * @name getAuthorBySessionId
     * @memberof Trail
     * @instance
     * @return {String} author
     */

  }, {
    key: "getAuthorBySessionId",
    value: function getAuthorBySessionId(sid) {
      var author = "You";
      this.sessions().some(function (session) {
        if (session.sessionId === sid) {
          author = session.author;
          return true;
        }
      });
      return author;
    }

    // ------------------------------
    // Methods
    // ------------------------------

    /**
     * Sets the initial state of version tree.
     *
     * @name init
     * @memberof Trail
     * @instance
     * @return {@link Trail}
     */

  }, {
    key: "init",
    value: function init(state) {
      this.getActionById('root-node').checkpointData(state);
      return this;
    }

    /**
     * Gets the state of visualization
     *
     * @name getState
     * @memberof Trail
     * @instance
     * @return {@link Trail}
     */

  }, {
    key: "getState",
    value: function getState(callback) {
      if (arguments.length) {
        console.log("SETTING CALLBACK", callback);
        this._getStateCallback = callback;
        return this;
      }return this._getStateCallback;
    }

    /**
     * Sets the state into visualization
     *
     * @name setState
     * @memberof Trail
     * @instance
     * @return {@link Trail}
     */

  }, {
    key: "setState",
    value: function setState(callback) {
      if (arguments.length) {
        this._setStateCallback = callback;
        return this;
      }return this._setStateCallback;
    }
  }, {
    key: "waitFor",


    /**
     * Does not records event if trail is idle
     *
     * @name waitFor
     * @memberof Trail
     * @instance
     * @param {Function} callback
     * @return {@link Trail}
     */
    value: function waitFor(callback) {
      this._isIdle = true;
      callback();
      this._isIdle = false;
    }

    /**
     * Does not records event if trail is idle
     *
     * @name waitFor
     * @memberof Trail
     * @instance
     * @param {Function} callback
     * @return {@link Trail}
     */

  }, {
    key: "waitForAsync",
    value: function waitForAsync(callback) {
      var thiss = this;
      thiss._isIdle = true;
      callback(function () {
        thiss._isIdle = false;
      });
    }

    /**
     * Creates an action
     *
     * @name createAction
     * @memberof Trail
     * @instance
     * @param {String} label - A label for an action
     */

  }, {
    key: "createAction",
    value: function createAction(label) {

      // Create Action
      var action = new _action.Action(label);

      // Add to Array
      this._actions.push(action);

      // Return
      return action;
    }

    /**
     * Records a change
     *
     * @name record
     * @memberof Trail
     * @instance
     * @param {@link Change} - A change recorded
     */

  }, {
    key: "record",
    value: function record(action, uplinkTag) {

      // Hold This
      var thiss = this,
          args = arguments;

      // Promise
      return new Promise(function (resolve, reject) {

        // Reject if trail is idle
        if (thiss.isIdle()) return reject(new Error('Trail is idle. Looks like an unintended record.'));

        // // Create a change
        // var change = new Change(action, data);

        // Capture
        action.on('thumbnailCaptured', function (image) {
          thiss._events.thumbnailCaptured.forEach(function (cb) {
            cb(image);
          });
        });

        // Count
        action.attr('order', thiss.versionStore().size + 1);

        // Add Action to Version Store
        thiss.versionStore().set(action.id(), action);

        // Add Action to version tree and update the current version
        thiss.versionTree().insertToNode(thiss.currentNode(), {
          key: action.id(),
          trailId: thiss.id()
        });

        // Add Node
        action.nodeInMasterTrail(thiss.currentNode());

        // Set uplinkTag and Fetch Uplink
        if (uplinkTag) {
          action.uplinkTag(uplinkTag);
          new _asyncTask.AsyncTask(function () {
            (function recur(node) {
              if (node) {
                if (thiss.getActionById(node.data().key).uplinkTag() === uplinkTag) {
                  action.uplink(thiss.getActionById(node.data().key));
                } else {
                  recur(node.parentNode());
                }
              }
            })(action.nodeInMasterTrail().parentNode());
          });
        }

        // Filter Current Branch
        thiss._currentBranchVersions = thiss.currentBranchVersions().filter(function (key) {
          return thiss.versionStore().get(key).nodeInMasterTrail().depth() < action.nodeInMasterTrail().depth();
        });

        // Add to Current Branch version
        thiss._currentBranchVersions.push(action.id());

        // Checkpoint
        thiss.checkpoint().checkSubTree(thiss.currentNode());

        // Fire `changeRecorded` event
        thiss._events.changeRecorded.forEach(function (cb) {
          cb(action);
        });

        // Resolve
        resolve(action);
      });
    }
  }, {
    key: "makeAllCheckpoints",
    value: function makeAllCheckpoints() {
      this.checkpoint().allCheckpoints();
    }

    /**
     * Changes the version
     *
     * @name changeVersion
     * @memberof Trail
     * @instance
     * @param {String} vid - The version id to change to
     */

  }, {
    key: "changeVersion",
    value: function changeVersion(vid) {
      var useInverses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var useOnlyState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var maxCheckpoints = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
      var logOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;


      // Hold `this`
      var thiss = this;

      // Return if Current Version
      if (vid == thiss.currentVersion()) {
        return;
      }

      var startTime = performance.now();
      var bestPath = (0, _navigation.computeBestPath)(thiss, thiss.currentNode(), thiss.getActionById(vid).nodeInMasterTrail(), useInverses, useOnlyState, maxCheckpoints, logOptions);
      if (!bestPath) {
        console.log("NO BEST PATH!!!");
      }
      var pathTime = performance.now();

      // if these are not state changes, passing state should do nothing
      var state = null;
      bestPath.forEach(function (c) {
        console.log(c, state);state = c.run(state);
      });
      if (state) {
        thiss.setState().call(thiss, clone(state));
      }
      var finalTime = performance.now();
      if (logOptions) {
        console.log("PATH TIME:", pathTime - startTime);
        console.log("MATERIALIZE TIME:", finalTime - pathTime);
      }

      // Update Current
      thiss.currentNode(thiss.getActionById(vid).nodeInMasterTrail());

      // Filter Current Branch
      thiss._currentBranchVersions = [];

      // Get Parent Thumbnails
      var node = thiss.currentNode();
      while (node.childNodes().length > 0) {
        node = node.childNodes()[node.childNodes().length - 1];
      }

      // Get Ancestry of node
      node.getAncestry().reverse().forEach(function (node) {
        thiss._currentBranchVersions.push(node.data().key);
      });

      // Event Callback
      this._events.changeVersion.forEach(function (cb) {
        cb();
      });
    }
  }, {
    key: "getBestPath",
    value: function getBestPath(vid) {
      var useInverses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var useOnlyState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var maxCheckpoints = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
      var logOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      var thiss = this;
      return (0, _navigation.computeBestPath)(thiss, thiss.currentNode(), thiss.getActionById(vid).nodeInMasterTrail(), useInverses, useOnlyState, maxCheckpoints, logOptions);
    }

    /**
     * Loads previous version from trail
     *
     * @name previous
     * @memberof MasterTrail
     * @instance
     */

  }, {
    key: "previous",
    value: function previous() {

      // If Root Node
      if (this.currentAction().id() === 'root-node') return;

      // Hold `this`
      var thiss = this;

      // Get Changes in Current Version
      var curAction = thiss.currentAction();

      // Check if not-invertible
      if (!curAction.hasInverse()) {

        // Update version using state computation
        thiss.changeVersion(curAction.nodeInMasterTrail().parentNode().data().key);

        // Still trigger an undo callback because from user's point of view,
        // it is still an undo action.
        this._events.changeVersion.forEach(function (cb) {
          cb();
        });
      } else {
        // Call Undo on Change
        thiss.waitFor(function () {
          // Fire Undo
          curAction.undo();

          // Update Current
          thiss.currentNode(thiss.currentNode().parentNode());

          // Event Callback
          thiss._events.changeVersion.forEach(function (cb) {
            cb();
          });
        });
      }
    }

    /**
     * Loads next version from trail
     *
     * @name next
     * @memberof MasterTrail
     * @instance
     */

  }, {
    key: "next",
    value: function next() {

      // Hold `this`
      var thiss = this;

      // Get Current Node
      var currentNode = thiss.currentNode();

      // If has child nodes
      if (currentNode.childNodes().length) {

        // Get Index from current version
        var idx = thiss.currentBranchVersions().indexOf(currentNode.data().key);

        // If There is a trail ahead of current node already in current branch
        var nextAction = thiss.versionStore().get(idx < thiss.currentBranchVersions().length - 1 ? thiss.currentBranchVersions()[idx + 1] : currentNode.childNodes()[currentNode.childNodes().length - 1].key);

        // Get Changes in Current Version
        var curAction = thiss.currentAction();

        // Forward on current node
        thiss.waitFor(function () {
          // Fire Redo
          nextAction.redo();

          // Update Current
          thiss.currentNode(nextAction.nodeInMasterTrail());

          // Event Callback
          thiss._events.changeVersion.forEach(function (cb) {
            cb();
          });
        });
      }
    }

    /**
     * Exports a trail
     *
     * @name export
     * @memberof BaseTrail
     * @instance
     */

  }, {
    key: "export",
    value: function _export(signature) {
      // try{
      console.log("RUNNING EXPORT");
      var exported = _exporter.Exporter.export(this, signature);
      console.log("DONE EXPORT");
      this._events.trailExported.forEach(function (cb) {
        cb(null, exported);
      });return exported;
      // }catch(e){
      //   this._events.trailExported.forEach(function(cb){
      //     cb(e, null);
      //   });
      // }
    }

    /**
     * Exports a trail
     *
     * @name export
     * @memberof BaseTrail
     * @instance
     */

  }, {
    key: "exportToGist",
    value: function exportToGist(accessToken, callback) {

      // Export
      var exportable = this.export();

      // Hold `this`
      var thiss = this;

      // Prepare Gist Template
      var gistTemplate = {
        "description": "Trail exported at: " + new Date().toLocaleTimeString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        "public": accessToken === null,
        "files": {}
      };

      // Add File
      gistTemplate.files["trail-" + thiss.id() + ".json"] = {};
      gistTemplate.files["trail-" + thiss.id() + ".json"].content = JSON.stringify(exportable, null, 2);

      // Use d3 xhr to post gist
      var url = accessToken ? "https://api.github.com/gists?access_token=" + accessToken : 'https://api.github.com/gists';

      // Promise
      return new Promise(function (resolve, reject) {
        _request.request.xhr(url).header("Content-Type", "application/json").post(JSON.stringify(gistTemplate)).then(function (response) {

          // Resolve
          resolve(response);

          // Event Callback
          thiss._events.gistExported.forEach(function (cb) {
            cb(null, response);
          });
        }).catch(function (e) {

          // Error
          var err = new Error("Status: " + e.status + "\nStatus Text: " + e.statusText);

          // Reject
          reject(err);

          // Event Callback
          thiss._events.gistExported.forEach(function (cb) {
            cb(err, null);
          });
        });
      });
    }

    /**
     * Exports a trail
     *
     * @name export
     * @memberof BaseTrail
     * @instance
     */

  }, {
    key: "import",
    value: function _import(trailData) {
      // try{
      var that = this;
      _importer.Importer.import(that, trailData);
      this._events.trailImported.forEach(function (cb) {
        cb(null, trailData);
      });
      // }catch(e){
      //   this._events.trailImported.forEach(function(cb){
      //     cb(e, null);
      //   });
      // }
    }
  }, {
    key: "importAction",
    value: function importAction(d) {
      return _action.Action.import(this.getClassMap(), d);
    }

    /**
     * Imports data from gist
     *
     * @name importGist
     * @memberof BaseTrail
     * @instance
     */

  }, {
    key: "importGist",
    value: function importGist(gistId, callback) {

      // Hold `this`
      var thiss = this;

      // Create Promise
      return new Promise(function (resolve, reject) {

        // Validate Gist Id
        if (!gistId || typeof gistId !== 'string' || gistId.trim().length === 0) {
          return reject(new Error('Invalid gist id'));
        }

        // Request
        _request.request.xhr('https://api.github.com/gists/' + gistId).get().then(function (response) {

          try {

            // Parse Response
            response = JSON.parse(response);
            var fileName = Object.keys(response.files)[0];
            var content = null;

            // If Gist is truncated; make a request to raw_url field in response
            if (response.files[fileName].truncated) {
              _request.request.xhr(response.files[fileName].raw_url).get().then(function (rawResponse) {
                if (rawResponse) {

                  // Parse, Update and Resolve
                  rawResponse = JSON.parse(rawResponse);
                  trail.waitFor(function () {
                    trail.import(rawResponse);
                  });resolve(rawResponse);

                  // Event Callback
                  thiss._events.gistImported.forEach(function (cb) {
                    cb(null, rawResponse);
                  });
                }
              }).catch(function (e) {

                // Error
                var err = new Error("Status: " + e.status + "\nStatus Text: " + e.statusText);

                // Reject
                reject(err);

                // Event Callback
                thiss._events.gistImported.forEach(function (cb) {
                  cb(err, null);
                });
              });
            } else {

              // Update and Resolve
              trail.waitFor(function () {
                trail.import(JSON.parse(response.files[fileName].content));
              });resolve(response);

              // Event Callback
              thiss._events.gistImported.forEach(function (cb) {
                cb(null, response);
              });
            }
          } catch (e) {

            // Reject
            reject(e);

            // Event Callback
            thiss._events.gistImported.forEach(function (cb) {
              cb(e, null);
            });
          }
        }).catch(function (e) {

          // Error
          var err = new Error("Status: " + e.status + "\nStatus Text: " + e.statusText);

          // Reject
          reject(err);

          // Event Callback
          thiss._events.gistImported.forEach(function (cb) {
            cb(err, null);
          });
        });
      });
    }
  }, {
    key: "storeLocal",
    value: function storeLocal() {
      // use the exporter to dump the trail to localStorage
      var exportable = this.export();
      if (!exportable) return false;
      localStorage.setItem("simprov" + window.location.pathname, JSON.stringify(exportable));
      return true;
    }
  }, {
    key: "loadLocal",
    value: function loadLocal() {
      var serialized = localStorage.getItem("simprov" + window.location.pathname);
      if (!serialized) return false;
      var dataObject = JSON.parse(serialized);
      var that = this;
      this.waitFor(function () {
        setTimeout(function () {
          that.import(dataObject);
        }, 1000);
      });
      return true;
    }
  }, {
    key: "resetTrail",
    value: function resetTrail() {
      localStorage.removeItem("simprov" + window.location.pathname);

      var thiss = this;

      // Guid that uniqly identifies the trail
      this._id = (0, _helpers.guid)();

      // Timestamp at which trail was created
      this._createdAt = new Date().getTime();

      // Timezone in which trail is created
      this._timezoneOffset = new Date().getTimezoneOffset();

      // Last Exported
      this._lastExportedAt = null;

      // Attributes
      this._attrs = {};

      // Version Tree
      this._versionTree = dataTree.create();

      // Version Store
      // Add a root node
      this._versionStore = new Map();

      // Current Branch versions
      this._currentBranchVersions = ['root-node'];

      // Current Version Node
      this._versionTree.insert({
        key: 'root-node',
        trailId: this._id
      });

      if (this.resetChange) {
        this.resetChange.run();
      }

      // Add Root Node and Update Id
      this._versionStore.set('root-node', new _action.Action("ROOT"));
      this._versionStore.get('root-node')._id = 'root-node';
      this._versionStore.get('root-node').attr('order', 0);
      this._versionStore.get('root-node').nodeInMasterTrail(this._versionTree.rootNode());
      this._versionStore.get('root-node').on('thumbnailCaptured', function (img, change) {
        thiss._events.thumbnailCaptured.forEach(function (cb) {
          cb(img, change);
        });
      });
    }
  }, {
    key: "resetChange",
    get: function get() {
      return this._resetChange;
    },
    set: function set(c) {
      this._resetChange = c;
    }
  }]);

  return Trail;
}((0, _mixins.AttrsMixin)((0, _mixins.EventMixin)(TrailBase)));

// ------------------------------
// Private Functions
// ------------------------------

// ------------------------------
// Export
// ------------------------------

exports.Trail = Trail;

},{"../action":13,"../asyncTask":14,"../change":15,"../checkpoint/checkpointManager":16,"../helpers":18,"../mixins":23,"../navigation":24,"../request":28,"../share/exporter":29,"../share/importer":30,"clone":4,"data-tree":5}]},{},[1,27]);
