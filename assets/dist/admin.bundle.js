/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./front/js/Admin.js":
/*!***************************!*\
  !*** ./front/js/Admin.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _scss_Admin_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/Admin.scss */ \"./front/scss/Admin.scss\");\n/* harmony import */ var _utils_Kom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/Kom */ \"./front/js/utils/Kom.js\");\n\n\nvar kom = new _utils_Kom__WEBPACK_IMPORTED_MODULE_1__.default();\nvar rolesList = document.querySelector('#roles-list');\nvar usersList = document.querySelector('#users-list');\n\nif (rolesList && usersList) {\n  var _loop = function _loop(i) {\n    var roles = usersList.children[i].querySelector('.user-roles');\n\n    var _loop2 = function _loop2(j) {\n      var revokeRoleInput = roles.children[j].lastElementChild;\n      revokeRoleInput.addEventListener('change', function () {\n        var processResponse = function processResponse(res) {\n          if (res.status === 200) {\n            window.location = '/admin/users';\n          }\n        };\n\n        var parameters = {\n          checked: revokeRoleInput.checked,\n          roleId: revokeRoleInput.dataset.id,\n          userId: usersList.children[i].dataset.id\n        };\n        kom.post('/api/user/update/role', parameters).then(processResponse)[\"catch\"](processResponse);\n      });\n    };\n\n    for (var j = 0; j < roles.children.length; ++j) {\n      _loop2(j);\n    }\n\n    var deleteButton = usersList.children[i].querySelector('.delete-user');\n    deleteButton.addEventListener('click', function () {\n      var processResponse = function processResponse(res) {\n        if (res.status === 200) {\n          window.location = '/admin/users';\n        }\n      };\n\n      var parameters = {\n        userId: usersList.children[i].dataset.id\n      };\n      kom.post('/api/user/delete', parameters).then(processResponse)[\"catch\"](processResponse);\n    });\n  };\n\n  for (var i = 0; i < usersList.children.length; ++i) {\n    _loop(i);\n  }\n}\n\n//# sourceURL=webpack://UserStack/./front/js/Admin.js?");

/***/ }),

/***/ "./front/js/utils/Kom.js":
/*!*******************************!*\
  !*** ./front/js/utils/Kom.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _utils_enum_HttpStatusCode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/enum/HttpStatusCode.js */ \"./front/js/utils/enum/HttpStatusCode.js\");\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\nvar Kom = /*#__PURE__*/function () {\n  function Kom(jwtToken) {\n    _classCallCheck(this, Kom);\n\n    this._jwtToken = jwtToken || null;\n    this._headers = this._createRequestHeaders();\n  }\n  /*  --------------------------------------------------------------------------------------------------------------- */\n\n  /*  -------------------------------------------  CLASS INIT UTILS  -----------------------------------------------  */\n\n  /*  --------------------------------------------------------------------------------------------------------------- */\n\n  /** @method\r\n   * @name _createRequestHeaders\r\n   * @private\r\n   * @memberof Kom\r\n   * @description <blockquote>Fills Kom <code>_headers</code> private member array, to use in HTTP requests later on.\r\n   * This method is required to be called on construction.</blockquote>\r\n   * @return {array[]} - The headers array, length 3, to be used in HTTP requests */\n\n\n  _createClass(Kom, [{\n    key: \"_createRequestHeaders\",\n    value: function _createRequestHeaders() {\n      return [['Content-Type', 'application/json; charset=UTF-8'], ['Accept', 'application/json'], ['X-XSRF-TOKEN', this._jwtToken]];\n    }\n    /*  --------------------------------------------------------------------------------------------------------------- */\n\n    /*  -------------------------------------------  PRIVATE METHODS  ------------------------------------------------  */\n\n    /*  --------------------------------------------------------------------------------------------------------------- */\n\n    /** @method\r\n     * @name _getErrorCodeFromHTTPStatus\r\n     * @private\r\n     * @memberof Kom\r\n     * @description <blockquote>This method is called whenever a server request didn't went well. In case a request (from\r\n     * any type) fails, its HTTP status code have to be handle in the method, so it returns an error code can be handled\r\n     * in the user interface (with notification, console or else).</blockquote>\r\n     * @param {number} code - The HTTP status code to handle, in supported ones from HttpStatusCode enumeration\r\n     * @return {string} The HTTP status as an error code */\n\n  }, {\n    key: \"_getErrorCodeFromHTTPStatus\",\n    value: function _getErrorCodeFromHTTPStatus(code) {\n      if (code === _utils_enum_HttpStatusCode_js__WEBPACK_IMPORTED_MODULE_0__.default.NOT_FOUND) {\n        return 'B_KOM_NOT_FOUND';\n      } else if (code === _utils_enum_HttpStatusCode_js__WEBPACK_IMPORTED_MODULE_0__.default.FORBIDDEN) {\n        return 'B_KOM_ACCESS_FORBIDDEN';\n      } else if (code === _utils_enum_HttpStatusCode_js__WEBPACK_IMPORTED_MODULE_0__.default.INTERNAL_ERROR) {\n        return 'B_KOM_INTERNAL_ERROR';\n      } else {\n        return \"B_KOM_UNKNOWN_ERROR\";\n      }\n    }\n    /** @method\r\n     * @async\r\n     * @name _resolveAs\r\n     * @private\r\n     * @memberof Kom\r\n     * @description <blockquote>Generic tool method used by private methods on fetch responses to format output in the provided\r\n     * format. It must be either `json`, `text` or `raw`.</blockquote>\r\n     * @param {String} type - The type of resolution, can be `json`, `text` or `raw`\r\n     * @param {Object} response - The <code>fetch</code> response object\r\n     * @returns {Promise} The request <code>Promise</code>, format response as an object on resolve, as error code string on reject */\n\n  }, {\n    key: \"_resolveAs\",\n    value: function _resolveAs(type, response) {\n      var _this = this;\n\n      return new Promise(function (resolve, reject) {\n        if (response) {\n          if (type === 'raw') {\n            // Raw are made in XMLHttpRequest and need special handling\n            if (response.status === _utils_enum_HttpStatusCode_js__WEBPACK_IMPORTED_MODULE_0__.default.OK) {\n              resolve(response.responseText);\n            } else {\n              reject(_this._getErrorCodeFromHTTPStatus(response.status));\n            }\n          } else if (type === 'json' || type === 'text') {\n            // Call are made using fetch API\n            if (response[type]) {\n              resolve(response[type]());\n            } else {\n              // Fallback on standard error handling\n              reject(_this._getErrorCodeFromHTTPStatus(response.status));\n            }\n          } else {\n            // Resolution type doesn't exists\n            reject('F_KOM_UNSUPPORTED_TYPE');\n          }\n        } else {\n          reject('F_KOM_MISSING_ARGUMENT');\n        }\n      });\n    }\n    /** @method\r\n     * @async\r\n     * @name _resolveAsJSON\r\n     * @private\r\n     * @memberof Kom\r\n     * @description <blockquote>Tool method used by public methods on fetch responses to format output data as JSON to be\r\n     * read in JavaScript code as objects.</blockquote>\r\n     * @param {Object} response - The <code>fetch</code> response object\r\n     * @returns {Promise} The request <code>Promise</code>, format response as an object on resolve, as error code string on reject */\n\n  }, {\n    key: \"_resolveAsJSON\",\n    value: function _resolveAsJSON(response) {\n      return this._resolveAs('json', response);\n    }\n    /** @method\r\n     * @async\r\n     * @name _resolveAsText\r\n     * @private\r\n     * @memberof Kom\r\n     * @description <blockquote>Tool method used by public methods on fetch responses to format output data as text to be\r\n     * read in JavaScript code as string (mostly to parse HTML templates).</blockquote>\r\n     * @param {Object} response - The <code>fetch</code> response object\r\n     * @returns {Promise} The request <code>Promise</code>, format response as a string on resolve, as error code string on reject */\n\n  }, {\n    key: \"_resolveAsText\",\n    value: function _resolveAsText(response) {\n      return this._resolveAs('text', response);\n    }\n    /** @method\r\n     * @async\r\n     * @name _resolveAsRaw\r\n     * @private\r\n     * @memberof Kom\r\n     * @description <blockquote>Tool method used by XmlHTTPRequests to format server response as raw binary data.</blockquote>\r\n     * @param {Object} response - The <code>XmlHTTPRequest</code> response status object\r\n     * @returns {Promise} The request <code>Promise</code>, doesn't format response on resolve, send error code string on reject */\n\n  }, {\n    key: \"_resolveAsRaw\",\n    value: function _resolveAsRaw(response) {\n      return this._resolveAs('raw', response);\n    }\n  }, {\n    key: \"_xhrCall\",\n    value: function _xhrCall(url, verb, data) {\n      var _this2 = this;\n\n      return new Promise(function (resolve, reject) {\n        var xhr = new XMLHttpRequest();\n        xhr.open(verb, url, true);\n        xhr.overrideMimeType('text/plain; charset=x-user-defined');\n\n        xhr.onreadystatechange = function (response) {\n          if (response.target.readyState === 4) {\n            // Ready state changed has reach the response state\n            _this2._resolveAsRaw(response.target).then(resolve)[\"catch\"](reject);\n          }\n        };\n\n        xhr.onerror = function () {\n          reject('F_KOM_XHR_ERROR');\n        };\n\n        xhr.send(data);\n      });\n    }\n    /*  --------------------------------------------------------------------------------------------------------------- */\n\n    /*  ---------------------------------------  HTTP SERVER CALLS METHODS  ------------------------------------------  */\n\n    /*  --------------------------------------------------------------------------------------------------------------- */\n\n    /** @method\r\n     * @async\r\n     * @name get\r\n     * @public\r\n     * @memberof Kom\r\n     * @description <blockquote><code>GET</code> HTTP request using the fetch API.<br><code>resolve</code> returns the\r\n     * response as an <code>Object</code>.<br><code>reject</code> returns an error key as a <code>String</code>.\r\n     * It is meant to perform API call to access database through the user interface.</blockquote>\r\n     * @param {String} url - The <code>GET</code> url to fetch data from, in supported back URLs\r\n     * @returns {Promise} The request <code>Promise</code> */\n\n  }, {\n    key: \"get\",\n    value: function get(url) {\n      var _this3 = this;\n\n      var resolution = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._resolveAsJSON.bind(this);\n      return new Promise(function (resolve, reject) {\n        var options = {\n          method: 'GET',\n          headers: new Headers([_this3._headers[0]]) // Content type to JSON\n\n        };\n        fetch(url, options).then(resolution).then(resolve)[\"catch\"](reject);\n      });\n    }\n    /** @method\r\n     * @async\r\n     * @name getText\r\n     * @public\r\n     * @memberof Kom\r\n     * @description <blockquote><code>GET</code> HTTP request using the fetch API.<br><code>resolve</code> returns the\r\n     * response as a <code>String</code>.<br><code>reject</code> returns an error key as a <code>String</code>. It is\r\n     * meant to perform API call to get HTML templates as string to be parsed as documents/documents fragments.</blockquote>\r\n     * @param {String} url - The <code>GET</code> url to fetch data from, in supported back URLs\r\n     * @returns {Promise} The request <code>Promise</code> */\n\n  }, {\n    key: \"getText\",\n    value: function getText(url) {\n      return this.get(url, this._resolveAsText.bind(this));\n    }\n    /** @method\r\n     * @async\r\n     * @name getRaw\r\n     * @public\r\n     * @memberof Kom\r\n     * @description <blockquote><code>GET</code> HTTP request using an <code>XMLHttpRequest</code>, with an override\r\n     * mime type hack to pass bytes through unprocessed.<br><code>resolve</code> returns the response as raw binary data.<br><code>reject</code>\r\n     * returns an error code as a <code>String</code>.</blockquote>\r\n     * @param {String} url - The url to fetch raw data from\r\n     * @returns {Promise} The request <code>Promise</code> */\n\n  }, {\n    key: \"getRaw\",\n    value: function getRaw(url) {\n      var _this4 = this;\n\n      return new Promise(function (resolve, reject) {\n        _this4._xhrCall(url, 'GET', null).then(resolve)[\"catch\"](reject);\n      });\n    }\n    /** @method\r\n     * @async\r\n     * @name post\r\n     * @public\r\n     * @memberof Kom\r\n     * @description <blockquote><code>POST</code> HTTP request using the fetch API.<br>Beware that the given options\r\n     * object match the url expectations.<br><code>resolve</code>\r\n     * returns the response as an <code>Object</code>.<br><code>reject</code> returns an error key as a <code>String</code>.</blockquote>\r\n     * @param {String} url - The <code>POST</code> url to fetch data from\r\n     * @param {Object} data - The <code>JSON</code> object that contains <code>POST</code> parameters\r\n     * @returns {Promise} The request <code>Promise</code> */\n\n  }, {\n    key: \"post\",\n    value: function post(url, data) {\n      var _this5 = this;\n\n      var resolution = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._resolveAsJSON.bind(this);\n      return new Promise(function (resolve, reject) {\n        var options = {\n          method: 'POST',\n          headers: new Headers(_this5._headers),\n          // POST needs all previously defined headers\n          body: JSON.stringify(data)\n        };\n        fetch(url, options).then(resolution).then(resolve)[\"catch\"](reject);\n      });\n    }\n    /** @method\r\n     * @async\r\n     * @name postText\r\n     * @public\r\n     * @memberof Kom\r\n     * @description <blockquote><code>POST</code> HTTP request using the fetch API.<br>Beware that the given options\r\n     * object match the url expectations.<br><code>resolve</code>\r\n     * returns the response as a <code>String</code>.<br><code>reject</code> returns an error key as a <code>String</code>.</blockquote>\r\n     * @param {String} url - The <code>POST</code> url to fetch data from\r\n     * @param {Object} data - The <code>JSON</code> object that contains <code>POST</code> parameters\r\n     * @returns {Promise} The request <code>Promise</code> */\n\n  }, {\n    key: \"postText\",\n    value: function postText(url, data) {\n      return this.post(url, data, this._resolveAsText.bind(this));\n    }\n    /** @method\r\n     * @async\r\n     * @name postRaw\r\n     * @public\r\n     * @memberof Kom\r\n     * @description <blockquote><code>POST</code> HTTP request using the fetch API.<br>Beware that the given options\r\n     * object match the url expectations.<br><code>resolve</code>, with an override\r\n     * mime type hack to pass bytes through unprocessed.<br><code>resolve</code> returns the response as raw binary data.<br><code>reject</code>\r\n     * returns an error code as a <code>String</code>.</blockquote>\r\n     * @param {String} url - The url to fetch raw data from\r\n     * @param {Object} data - The <code>JSON</code> object that contains <code>POST</code> parameters\r\n     * @returns {Promise} The request <code>Promise</code> */\n\n  }, {\n    key: \"postRaw\",\n    value: function postRaw(url, data) {\n      var _this6 = this;\n\n      return new Promise(function (resolve, reject) {\n        _this6._xhrCall(url, 'POST', JSON.stringify(data)).then(resolve)[\"catch\"](reject);\n      });\n    }\n  }, {\n    key: \"postForm\",\n    value: function postForm(url, data) {\n      var _this7 = this;\n\n      return new Promise(function (resolve, reject) {\n        // Create virtual form\n        var form = document.createElement('FORM');\n        form.method = 'POST';\n        form.action = url; // Declare its virtual fields from sent data\n\n        for (var key in data) {\n          if (Object.prototype.hasOwnProperty.call(data, key)) {\n            var hiddenField = document.createElement('INPUT');\n            hiddenField.type = 'hidden';\n            hiddenField.name = key;\n            hiddenField.value = data[key];\n            form.appendChild(hiddenField);\n          }\n        } // Build XHR with xsrf token\n\n\n        var xhr = new XMLHttpRequest();\n        xhr.open('POST', url);\n        xhr.setRequestHeader('X-XSRF-TOKEN', _this7._csrfToken); // Register the state change event\n\n        xhr.onreadystatechange = function (response) {\n          if (response.target.readyState === 4) {\n            // Ready state changed has reach the response state\n            // As specified with backend, response is JSON if success, HTML otherwise\n            try {\n              // If we can parse as a JSON, everything went fine server side\n              var output = JSON.parse(response.target.response);\n              resolve(output);\n            } catch (err) {\n              // Otherwise, the server returns the template with its errors\n              reject(response.target.response);\n            }\n          }\n        }; // XHR error handling\n\n\n        xhr.onerror = function () {\n          reject('F_KOM_XHR_ERROR');\n        }; // Create form data and send it through the XHR\n\n\n        var formData = new FormData(form);\n        xhr.send(formData);\n      });\n    }\n  }, {\n    key: \"jwtToken\",\n    get: function get() {\n      return this._jwtToken;\n    },\n    set: function set(token) {\n      this._jwtToken = token;\n    }\n  }]);\n\n  return Kom;\n}();\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Kom);\n\n//# sourceURL=webpack://UserStack/./front/js/utils/Kom.js?");

/***/ }),

/***/ "./front/js/utils/enum/HttpStatusCode.js":
/*!***********************************************!*\
  !*** ./front/js/utils/enum/HttpStatusCode.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Object.freeze({\n  /* The HTTP call worked properly. */\n  OK: 200,\n\n  /* The url wasn't found. */\n  NOT_FOUND: 404,\n\n  /* The url cannot be accessed. */\n  FORBIDDEN: 403,\n\n  /* The server encountered a problem. */\n  INTERNAL_ERROR: 500\n}));\n\n//# sourceURL=webpack://UserStack/./front/js/utils/enum/HttpStatusCode.js?");

/***/ }),

/***/ "./front/scss/Admin.scss":
/*!*******************************!*\
  !*** ./front/scss/Admin.scss ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://UserStack/./front/scss/Admin.scss?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./front/js/Admin.js");
/******/ 	window.UserStack = __webpack_exports__.default;
/******/ 	
/******/ })()
;