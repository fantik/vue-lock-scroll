"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* safari helper */
var setAsyncTimeout = function setAsyncTimeout(cb) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return new Promise(function (resolve) {
    setTimeout(function () {
      cb();
      resolve();
    }, timeout);
  });
};

var ScrollLock =
/*#__PURE__*/
function () {
  _createClass(ScrollLock, null, [{
    key: "install",
    value: function install(Vue, options) {
      /* define defaults options */
      var defaults = {
        propName: '$scrollLock',
        gapedElements: null
        /* reassign defaults */

      };
      var populated = Object.assign(defaults, options);
      if (Vue.prototype.hasOwnProperty(populated.propName)) return;
      Object.defineProperty(Vue.prototype, populated.propName, {
        value: new ScrollLock(populated.gapedElements)
      });
    }
  }]);

  function ScrollLock(gapedElements) {
    _classCallCheck(this, ScrollLock);

    this.gapedElements = gapedElements ? gapedElements.split(', ').map(function (el) {
      return document.querySelector(el);
    }) : [];
    /* define entry values */

    this.locks = [];
    this.documentListenerAdded = false;
    this.initialClientY = -1;
    this.init();
  }

  _createClass(ScrollLock, [{
    key: "init",
    value: function init() {
      /* test if window supports passive events */
      this.testPassiveEvents();
      /* check is IOS device */

      this.testIsIos();
    }
  }, {
    key: "testPassiveEvents",
    value: function testPassiveEvents() {
      var _this = this;

      this.hasPassiveEvents = false;

      if (typeof window !== 'undefined') {
        var passiveTestOptions = {
          get passive() {
            _this.hasPassiveEvents = true;
            return undefined;
          }

        };
        window.addEventListener('testPassive', null, passiveTestOptions);
        window.removeEventListener('testPassive', null, passiveTestOptions);
      }
    }
  }, {
    key: "testIsIos",
    value: function testIsIos() {
      this.isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && /iP(ad|hone|od)/.test(window.navigator.platform);
    }
  }, {
    key: "isTouchMoveAllowed",
    value: function isTouchMoveAllowed(el) {
      this.locks.some(function (lock) {
        return lock.options.allowTouchMove && lock.options.allowTouchMove(el);
      });
    }
  }, {
    key: "preventDefault",
    value: function preventDefault(evt) {
      var e = evt || window.event; // For the case whereby consumers adds a touchmove event listener to document.
      // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
      // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
      // the touchmove event on document will break.

      if (this.isTouchMoveAllowed(e.target)) {
        return true;
      } // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom)


      if (e.touches.length > 1) return true;
      if (e.preventDefault) e.preventDefault();
      return false;
    }
  }, {
    key: "isTargetElementTotallyScrolled",
    value: function isTargetElementTotallyScrolled(targetElement) {
      return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
    }
  }, {
    key: "setOverflowHidden",
    value: function () {
      var _setOverflowHidden = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(options) {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return setAsyncTimeout(function () {
                  console.log(123);

                  if (_this2.previousBodyPaddingRight === undefined) {
                    var reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;
                    var scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

                    if (reserveScrollBarGap && scrollBarGap > 0) {
                      _this2.previousBodyPaddingRight = document.body.style.paddingRight;
                      document.body.style.paddingRight = "".concat(scrollBarGap, "px");

                      _this2.gapedElements.forEach(function (el) {
                        el.style.paddingRight = scrollBarGap + 'px';
                      });
                    }
                  } // If previousBodyOverflowSetting is already set, don't set it again.


                  if (_this2.previousBodyOverflowSetting === undefined) {
                    _this2.previousBodyOverflowSetting = document.body.style.overflow;
                    document.body.style.overflow = 'hidden';
                  }
                });

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function setOverflowHidden(_x) {
        return _setOverflowHidden.apply(this, arguments);
      }

      return setOverflowHidden;
    }()
  }, {
    key: "restoreOverflowSetting",
    value: function () {
      var _restoreOverflowSetting = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return setAsyncTimeout(function () {
                  if (_this3.previousBodyPaddingRight !== undefined) {
                    document.body.style.paddingRight = _this3.previousBodyPaddingRight;

                    _this3.gapedElements.forEach(function (el) {
                      el.style.paddingRight = _this3.previousBodyPaddingRight;
                    }); // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
                    // can be set again.


                    _this3.previousBodyPaddingRight = undefined;
                  }

                  if (_this3.previousBodyOverflowSetting !== undefined) {
                    document.body.style.overflow = _this3.previousBodyOverflowSetting; // Restore previousBodyOverflowSetting to undefined
                    // so setOverflowHidden knows it can be set again.

                    _this3.previousBodyOverflowSetting = undefined;
                  }
                });

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function restoreOverflowSetting() {
        return _restoreOverflowSetting.apply(this, arguments);
      }

      return restoreOverflowSetting;
    }()
  }, {
    key: "handleScroll",
    value: function handleScroll(event, targetElement) {
      var clientY = event.targetTouches[0].clientY - this.initialClientY;

      if (this.allowTouchMove(event.target)) {
        return false;
      }

      if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
        // element is at the top of its scroll
        return this.preventDefault(event);
      }

      if (this.isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
        // element is at the top of its scroll
        return this.preventDefault(event);
      }

      event.stopPropagation();
      return true;
    }
  }, {
    key: "lock",
    value: function () {
      var _lock = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(targetElement, options) {
        var _this4 = this;

        var _lock2, _lock3;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!this.isIosDevice) {
                  _context3.next = 7;
                  break;
                }

                if (targetElement) {
                  _context3.next = 4;
                  break;
                }

                // eslint-disable-next-line no-console
                console.error('"lock" unsuccessful - targetElement must be provided when calling "lock" on IOS devices.');
                return _context3.abrupt("return");

              case 4:
                if (targetElement && !this.locks.some(function (lock) {
                  return lock.targetElement === targetElement;
                })) {
                  _lock2 = {
                    targetElement: targetElement,
                    options: options || {}
                  };
                  this.locks = [].concat(_toConsumableArray(this.locks), [_lock2]);

                  targetElement.ontouchstart = function (event) {
                    if (event.targetTouches.length === 1) {
                      // detect single touch
                      _this4.initialClientY = event.targetTouches[0].clientY;
                    }
                  };

                  targetElement.ontouchmove = function (event) {
                    if (event.targetTouches.length === 1) {
                      // detect single touch
                      _this4.handleScroll(event, targetElement);
                    }
                  };

                  if (!this.documentListenerAdded) {
                    document.addEventListener('touchmove', this.preventDefault, this.hasPassiveEvents ? {
                      passive: false
                    } : undefined);
                    this.documentListenerAdded = true;
                  }
                }

                _context3.next = 11;
                break;

              case 7:
                _context3.next = 9;
                return this.setOverflowHidden(options);

              case 9:
                _lock3 = {
                  targetElement: targetElement,
                  options: options || {}
                };
                this.locks = [].concat(_toConsumableArray(this.locks), [_lock3]);

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function lock(_x2, _x3) {
        return _lock.apply(this, arguments);
      }

      return lock;
    }()
  }, {
    key: "unlockAll",
    value: function () {
      var _unlockAll = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this.isIosDevice) {
                  _context4.next = 7;
                  break;
                }

                // Clear all locks ontouchstart/ontouchmove handlers, and the references
                this.locks.forEach(function (lock) {
                  lock.targetElement.ontouchstart = null;
                  lock.targetElement.ontouchmove = null;
                });

                if (this.documentListenerAdded) {
                  document.removeEventListener('touchmove', this.preventDefault, this.hasPassiveEvents ? {
                    passive: false
                  } : undefined);
                  this.documentListenerAdded = false;
                }

                this.locks = []; // Reset initial clientY

                this.initialClientY = -1;
                _context4.next = 10;
                break;

              case 7:
                _context4.next = 9;
                return this.restoreOverflowSetting();

              case 9:
                this.locks = [];

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function unlockAll() {
        return _unlockAll.apply(this, arguments);
      }

      return unlockAll;
    }()
  }, {
    key: "unlock",
    value: function () {
      var _unlock = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(targetElement) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this.isIosDevice) {
                  _context5.next = 10;
                  break;
                }

                if (targetElement) {
                  _context5.next = 4;
                  break;
                }

                // eslint-disable-next-line no-console
                console.error('"unlock" unsuccessful - targetElement must be provided when calling "unlock" on IOS devices.');
                return _context5.abrupt("return");

              case 4:
                targetElement.ontouchstart = null;
                targetElement.ontouchmove = null;
                this.locks = this.locks.filter(function (lock) {
                  return lock.targetElement !== targetElement;
                });

                if (this.documentListenerAdded && this.locks.length === 0) {
                  document.removeEventListener('touchmove', this.preventDefault, this.hasPassiveEvents ? {
                    passive: false
                  } : undefined);
                  this.documentListenerAdded = false;
                }

                _context5.next = 17;
                break;

              case 10:
                if (!(this.locks.length === 1 && this.locks[0].targetElement === targetElement)) {
                  _context5.next = 16;
                  break;
                }

                _context5.next = 13;
                return this.restoreOverflowSetting();

              case 13:
                this.locks = [];
                _context5.next = 17;
                break;

              case 16:
                this.locks = this.locks.filter(function (lock) {
                  return lock.targetElement !== targetElement;
                });

              case 17:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function unlock(_x4) {
        return _unlock.apply(this, arguments);
      }

      return unlock;
    }()
  }]);

  return ScrollLock;
}();

exports["default"] = ScrollLock;