!function(){"use strict";var e=Object.freeze({OK:200,NOT_FOUND:404,FORBIDDEN:403,INTERNAL_ERROR:500});function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var n=function(){function n(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,n),this._jwtToken=e||null,this._headers=this._createRequestHeaders()}var r,o;return r=n,(o=[{key:"_createRequestHeaders",value:function(){return[["Content-Type","application/json; charset=UTF-8"],["Accept","application/json"],["X-XSRF-TOKEN",this._jwtToken]]}},{key:"_getErrorCodeFromHTTPStatus",value:function(t){return t===e.NOT_FOUND?"B_KOM_NOT_FOUND":t===e.FORBIDDEN?"B_KOM_ACCESS_FORBIDDEN":t===e.INTERNAL_ERROR?"B_KOM_INTERNAL_ERROR":"B_KOM_UNKNOWN_ERROR"}},{key:"_resolveAs",value:function(t,n){var r=this;return new Promise((function(o,s){n?"raw"===t?n.status===e.OK?o(n.responseText):s(r._getErrorCodeFromHTTPStatus(n.status)):"json"===t||"text"===t?n[t]?o(n[t]()):s(r._getErrorCodeFromHTTPStatus(n.status)):s("F_KOM_UNSUPPORTED_TYPE"):s("F_KOM_MISSING_ARGUMENT")}))}},{key:"_resolveAsJSON",value:function(e){return this._resolveAs("json",e)}},{key:"_resolveAsText",value:function(e){return this._resolveAs("text",e)}},{key:"_resolveAsRaw",value:function(e){return this._resolveAs("raw",e)}},{key:"_xhrCall",value:function(e,t,n){var r=this;return new Promise((function(o,s){var i=new XMLHttpRequest;i.open(t,e,!0),i.overrideMimeType("text/plain; charset=x-user-defined"),i.onreadystatechange=function(e){4===e.target.readyState&&r._resolveAsRaw(e.target).then(o).catch(s)},i.onerror=function(){s({code:"F_KOM_XHR_ERROR"})},i.send(n)}))}},{key:"get",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._resolveAsJSON.bind(this);return new Promise((function(r,o){var s={method:"GET",headers:new Headers([t._headers[0]])};fetch(e,s).then(n).then(r).catch(o)}))}},{key:"getText",value:function(e){return this.get(e,this._resolveAsText.bind(this))}},{key:"getRaw",value:function(e){var t=this;return new Promise((function(n,r){t._xhrCall(e,"GET",null).then(n).catch(r)}))}},{key:"post",value:function(e,t){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this._resolveAsJSON.bind(this);return new Promise((function(o,s){var i={method:"POST",headers:new Headers(n._headers),body:JSON.stringify(t)};fetch(e,i).then(r).then(o).catch(s)}))}},{key:"postText",value:function(e,t){return this.post(e,t,this._resolveAsText.bind(this))}},{key:"postRaw",value:function(e,t){var n=this;return new Promise((function(r,o){n._xhrCall(e,"POST",JSON.stringify(t)).then(r).catch(o)}))}},{key:"postForm",value:function(e,t){return new Promise((function(n,r){var o=document.createElement("FORM");for(var s in o.method="POST",o.action=e,t)if(Object.prototype.hasOwnProperty.call(t,s)){var i=document.createElement("INPUT");i.type="hidden",i.name=s,i.value=t[s],o.appendChild(i)}var a=new XMLHttpRequest;a.open("POST",e),a.onreadystatechange=function(e){if(4===e.target.readyState)try{var t=JSON.parse(e.target.response);n(t)}catch(t){r(e.target.response)}},a.onerror=function(){r("F_KOM_XHR_ERROR")};var u=new FormData(o);a.send(u)}))}},{key:"xhr",value:function(e,t,n){return new Promise((function(r,o){var s=new XMLHttpRequest;s.open(e,t,!0),s.onreadystatechange=function(){4===s.readyState&&r(JSON.parse(s.responseText))},s.onerror=function(){o({code:"F_KOM_XHR_ERROR"})},s.send(n)}))}},{key:"jwtToken",get:function(){return this._jwtToken},set:function(e){this._jwtToken=e}}])&&t(r.prototype,o),n}();function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var i=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];o(this,e),"boolean"!=typeof t&&(t=!1),this._debug=t,this._idIncrementor=5678*Math.floor(Math.random()*Math.floor(256)),this._regularEvents=[],this._customEvents={},this.version="1.2.1"}var t,n;return t=e,(n=[{key:"destroy",value:function(){var e=this;this._raise("log","CustomEvents.destroy"),this.removeAllEvents(),Object.keys(this).forEach((function(t){delete e[t]}))}},{key:"addEvent",value:function(e,t,n){var o=this,s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:t,i=arguments.length>4&&void 0!==arguments[4]&&arguments[4];if(this._raise("log","CustomEvents.addEvent: ".concat(e," ").concat(t," ").concat(n," ").concat(s," ").concat(i)),null==e||null==t||null==n)return this._raise("error","CustomEvents.addEvent: Missing mandatory arguments"),!1;var a=function(){o._raise("error","CustomEvents.addEvent: Wrong type for argument")};return"string"!=typeof e||"object"!==r(t)||"function"!=typeof n||null!=s&&"object"!==r(s)||null!=i&&"object"!==r(i)&&"boolean"!=typeof i?(a(),!1):(n=n.bind(s),this._regularEvents.push({id:this._idIncrementor,element:t,eventName:e,scope:s,callback:n,options:i}),t.addEventListener(e,n,i),this._idIncrementor++)}},{key:"removeEvent",value:function(e){if(this._raise("log","Events.removeEvent: ".concat(e)),null==e)return this._raise("error","CustomEvents.removeEvent: Missing mandatory arguments"),!1;if("number"!=typeof e)return this._raise("error","CustomEvents.removeEvent: Wrong type for argument"),!1;for(var t=!1,n=this._regularEvents.length-1;n>=0;--n)this._regularEvents[n].id===e&&(t=!0,this._clearRegularEvent(n));return t}},{key:"removeAllEvents",value:function(){this._raise("log","CustomEvents.removeAllEvents");for(var e=!1,t=this._regularEvents.length>0,n=this._regularEvents.length-1;n>=0;--n)this._clearRegularEvent(n);return 0===this._regularEvents.length&&t&&(e=!0),e}},{key:"_clearRegularEvent",value:function(e){if(this._raise("log","CustomEvents._clearRegularEvent: ".concat(e)),null==e)return this._raise("error","CustomEvents._clearRegularEvent: Missing mandatory argument"),!1;if("number"!=typeof e)return this._raise("error","CustomEvents._clearRegularEvent: Wrong type for argument"),!1;if(this._regularEvents[e]){var t=this._regularEvents[e];return t.element.removeEventListener(t.eventName,t.callback,t.options),this._regularEvents.splice(e,1),!0}return!1}},{key:"subscribe",value:function(e,t){var n=this,r=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(this._raise("log","CustomEvents.subscribe: ".concat(e," ").concat(t," ").concat(r)),null==e||null==t)return this._raise("error","CustomEvents.subscribe","Missing mandatory arguments"),!1;var o=function(){n._raise("error","CustomEvents.subscribe: Wrong type for argument")};return"string"!=typeof e||"function"!=typeof t||null!=r&&"boolean"!=typeof r?(o(),!1):(this._customEvents[e]||(this._customEvents[e]=[]),this._customEvents[e].push({id:this._idIncrementor,name:e,os:r,callback:t}),this._idIncrementor++)}},{key:"unsubscribe",value:function(e){if(this._raise("log","CustomEvents.unsubscribe: ".concat(e)),null==e)return this._raise("error","CustomEvents.unsubscribe: Missing mandatory arguments"),!1;if("number"!=typeof e)return this._raise("error","CustomEvents.unsubscribe: Wrong type for argument"),!1;for(var t=!1,n=Object.keys(this._customEvents),r=n.length-1;r>=0;--r)for(var o=this._customEvents[n[r]],s=0;s<o.length;++s)if(o[s].id===e){this._raise("log","CustomEvents.unsubscribe: subscription found\n",o[s],"\nSubscription n°".concat(e," for ").concat(o.name," has been removed")),t=!0,o.splice(s,1),0===o.length&&delete this._customEvents[n[r]];break}return t}},{key:"unsubscribeAllFor",value:function(e){if(this._raise("log","CustomEvents.unsubscribeAllFor: ".concat(e)),null==e)return this._raise("error","CustomEvents.unsubscribeAllFor: Missing mandatory arguments"),!1;if("string"!=typeof e)return this._raise("error","CustomEvents.unsubscribeAllFor: Wrong type for argument"),!1;for(var t=!1,n=Object.keys(this._customEvents),r=0;r<n.length;++r)if(n[r]===e)for(var o=this._customEvents[n[r]],s=o.length-1;s>=0;--s)t=!0,o.splice(s,1),0===o.length&&delete this._customEvents[n[r]];return t}},{key:"publish",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(this._raise("log","CustomEvents.publish: ".concat(e," ").concat(t)),null==e)return this._raise("error","CustomEvents.publish: Missing mandatory arguments"),!1;if("string"!=typeof e||void 0!==t&&"object"!==r(t))return this._raise("error","CustomEvents.publish: Wrong type for argument"),!1;for(var n=!1,o=Object.keys(this._customEvents),s=0;s<o.length;++s)if(o[s]===e){n=!0;for(var i=this._customEvents[o[s]],a=i.length-1;a>=0;--a)this._raise("log","CustomEvents.publish: fire callback for ".concat(e,", subscription n°").concat(i[a].id),i[a]),i[a].callback(t),i[a].os&&(this._raise("log","CustomEvents.publish: remove subscription because one shot usage is done"),i.splice(a,1),0===i.length&&delete this._customEvents[o[s]])}return n}},{key:"_raise",value:function(e,t){this._debug&&console[e](t)}}])&&s(t.prototype,n),e}();function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function u(e){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function l(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e,t,n){return(c="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=f(e)););return e}(e,t);if(r){var o=Object.getOwnPropertyDescriptor(r,t);return o.get?o.get.call(n):o.value}})(e,t,n||e)}function v(e,t){return(v=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function h(e,t){return!t||"object"!==u(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function f(e){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function d(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _={DeleteAccountModal:function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&v(e,t)}(i,e);var t,n,r,o,s=(r=i,o=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=f(r);if(o){var n=f(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return h(this,e)});function i(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i),(t=s.call(this,e))._cb=e.cb,t._deleteButton=null,t._deleteEvtId=-1,t}return t=i,(n=[{key:"destroy",value:function(){c(f(i.prototype),"destroy",this).call(this),window.events.removeEvent(this._deleteEvtId)}},{key:"_fillAttributes",value:function(){this._deleteButton=this._modalOverlay.querySelector("#modal-user-delete-button"),this._events()}},{key:"_events",value:function(){this._deleteEvtId=window.events.addEvent("click",this._deleteButton,this._deleteClicked,this)}},{key:"_deleteClicked",value:function(e){e.preventDefault(),this.close(),this._cb()}}])&&l(t.prototype,n),i}(function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._url=t.url,this._modalOverlay=null,this._overlayClickedEvtId=-1,this._closeButtons=null,this._closeClickedEvtIds=[],this._loadTemplate()}var t,n;return t=e,(n=[{key:"destroy",value:function(){window.events.removeEvent(this._overlayClickedEvtId);for(var e=0;e<this._closeButtons.length;++e)window.events.removeEvent(this._closeClickedEvtIds[e]);delete this._url,delete this._modalOverlay,delete this._overlayClickedEvtId,delete this._closeButtons,delete this._closeClickedEvtIds}},{key:"_loadTemplate",value:function(){var e=this;window.kom.getText(this._url).then((function(t){e._modalOverlay=e.parseHTMLFragment(t),e._closeButtons=e._modalOverlay.querySelectorAll(".modal-close"),e.open(),e._fillAttributes()})).catch((function(e){console.error(e)}))}},{key:"_fillAttributes",value:function(){}},{key:"parseHTMLFragment",value:function(e){return(new DOMParser).parseFromString(e,"text/html").body.firstChild}},{key:"open",value:function(){document.body.appendChild(this._modalOverlay),this._overlayClickedEvtId=window.events.addEvent("click",this._modalOverlay,this.close,this);for(var e=0;e<this._closeButtons.length;++e)this._closeClickedEvtIds.push(window.events.addEvent("click",this._closeButtons[e],this.close,this))}},{key:"close",value:function(e){for(var t=0;t<this._closeButtons.length;++t)if(!e||e&&(e.target===this._modalOverlay||e.target===this._closeButtons[t]))return document.body.removeChild(this._modalOverlay),void this.destroy()}}])&&a(t.prototype,n),e}())},y=function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return d(this,e),new(_["".concat(t,"Modal")])(n)},m=new n;window.kom=m;var p=new i;window.events=p;var g=document.querySelector("#lock-registration"),b=document.querySelector("#users-list");g&&b&&function(){for(var e=document.querySelector("#error-output"),t=function(t){for(var n=b.children[t].querySelector(".user-roles"),r=function(e){var r=n.children[e].lastElementChild;r.addEventListener("change",(function(){var e=function(e){200===e.status&&(window.location="/admin/users")},n={checked:r.checked,roleId:r.dataset.id,userId:b.children[t].dataset.id};m.post("/api/user/update/role",n).then(e).catch(e)}))},o=0;o<n.children.length;++o)r(o);b.children[t].querySelector(".delete-user").addEventListener("click",(function(){var n=function(t){200===t.status?window.location="/admin/users":"B_NEVER_KILL_ROOT"===t.code&&(e.innerHTML=t.message)};new y("DeleteAccount",{url:"/template/modal/delete/user",cb:function(){var e={userId:b.children[t].dataset.id};m.post("/api/user/delete",e).then(n).catch(n)}})}))},n=0;n<b.children.length;++n)t(n);g.addEventListener("change",(function(){var t=function(t){200===t.status?window.location="/admin/users":"B_NEVER_KILL_ROOT"===t.code&&(e.innerHTML=t.message)},n={lockRegistration:g.checked};m.post("/api/admin/update/settings",n).then(t).catch(t)}))}(),window.UserStack={}.default}();