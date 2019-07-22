/*!
  * File Uploader v0.0.1 (https://iqbalfn.github.io/fileuploader/)
  * Copyright 2019 Iqbal Fauzi
  * Licensed under MIT (https://github.com/iqbalfn/fileuploader/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.fileuploader = {}));
}(this, function (exports) { 'use strict';

    /**
     * --------------------------------------------------------------------------
     * FileUploader (v0.0.1): fileuploader.js
     * Licensed under MIT (https://github.com/iqbalfn/fileuploader/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */
    var FileUploader =
    /*#__PURE__*/
    function () {
      function FileUploader(options) {
        var _this = this;

        this._queries = options.queries || {};
        this._fields = options.fields || {};
        this._files = options.files || {};
        this._headers = options.headers || {};
        this._url = options.url;
        this._response = null;
        this._xhr = null; // events

        var events = ['onStart', 'onProgress', 'onError', 'onSuccess', 'onComplete'];
        events.forEach(function (i) {
          if (options[i]) _this[i] = options[i];
        });
      } // events callback


      var _proto = FileUploader.prototype;

      _proto.onStart = function onStart() {};

      _proto.onProgress = function onProgress() {};

      _proto.onError = function onError() {};

      _proto.onSuccess = function onSuccess() {};

      _proto.onComplete = function onComplete() {} // public
      // actions
      ;

      _proto.getResponse = function getResponse() {
        return this._response;
      };

      _proto.send = function send() {
        var _this2 = this;

        var formData = new FormData(),
            xhr = new XMLHttpRequest();
        this._xhr = xhr;

        for (var field in this._fields) {
          formData.append(field, this._fields[field]);
        }

        for (var _field in this._files) {
          formData.append(_field, this._files[_field], this._files[_field].name);
        }

        var url = this._url;
        var usign = url.includes('?') ? '&' : '?';
        var queries = [];

        for (var k in this._queries) {
          queries.push(this._qs(k) + '=' + this._qs(this._queries[k]));
        }

        if (queries.length) url += usign + queries;
        xhr.open('POST', url, true);

        xhr.onreadystatechange = function () {
          _this2.onProgress(_this2, xhr.readyState);

          if (xhr.readyState != 4) return;

          if (xhr.status != 200) {
            _this2.onError(_this2, _this2._xhr);

            _this2.onComplete(_this2, _this2._xhr);

            return;
          }

          var res = null;

          try {
            res = JSON.parse(xhr.responseText);
          } catch (e) {
            res = xhr.responseText;
          }

          _this2.onSuccess(_this2, _this2._xhr, res);

          _this2.onComplete(_this2, _this2._xhr);
        };

        xhr.send(formData);
        this.onStart(this, this._xhr);
      } // setter & adder
      ;

      _proto.addField = function addField(name, value) {
        this._fields[name] = value;
      };

      _proto.addFile = function addFile(name, value) {
        this._files[name] = value;
      };

      _proto.addHeader = function addHeader(name, value) {
        this._headers[name] = value;
      };

      _proto.addQuery = function addQuery(name, value) {
        this._queries[name] = value;
      };

      _proto.setUrl = function setUrl(url) {
        this._url = url;
      } // getter
      ;

      _proto.getUrl = function getUrl() {
        return this._url;
      };

      _proto.getField = function getField(name) {
        return this._fields[name];
      };

      _proto.getFields = function getFields() {
        return this._fields;
      };

      _proto.getFile = function getFile(name) {
        return this._files[name];
      };

      _proto.getFiles = function getFiles() {
        return this._files;
      };

      _proto.getHeader = function getHeader(name) {
        return this._headers[name];
      };

      _proto.getHeaders = function getHeaders() {
        return this._headers;
      };

      _proto.getQuery = function getQuery(name) {
        return this._queries[name];
      };

      _proto.getQueries = function getQueries() {
        return this._queries;
      } // private
      ;

      _proto._qs = function _qs(str) {
        return encodeURIComponent(str);
      };

      return FileUploader;
    }();

    window.FileUploader = FileUploader;

    exports.FileUploader = FileUploader;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=fileuploader.js.map
