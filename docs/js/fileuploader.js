/*!
  * File Uploader v0.1.0 (https://iqbalfn.github.io/fileuploader/)
  * Copyright 2020 Iqbal Fauzi
  * Licensed under MIT (https://github.com/iqbalfn/fileuploader/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.fileuploader = {}));
}(this, (function (exports) { 'use strict';

    /**
     * --------------------------------------------------------------------------
     * FileUploader (v0.1.0): fileuploader.js
     * Licensed under MIT (https://github.com/iqbalfn/fileuploader/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */
    var FileUploader = /*#__PURE__*/function () {
      function FileUploader(options) {
        this._queries = options.queries || {};
        this._fields = options.fields || {};
        this._files = options.files || {};
        this._headers = options.headers || {};
        this._url = options.url;
        this._response = null;
        this._xhr = null;
        this._chunks = null; // {
        //    chunk::int  Chunk index
        //    chunks::int  Chunk total
        //    options::obj {
        //        minSize::int  Minimum size of file to chunk the upload
        //        chunkSize:int  Each chunk file size to upload
        //        test::func  Function to call to test chunk upload
        //        after::func  Function to call right after last chunk
        //        before::func  Function to call before the first chunk
        //    }
        // }

        if (!Object.keys(this._files).length) throw 'No file provided';

        this._registerEvents(options);

        this._buildUrl();

        this._parseChunkOption(options);
      } // events callback


      var _proto = FileUploader.prototype;

      _proto.onChankUploaded = function onChankUploaded(up, xhr, res, cb) {
        cb(true);
      };

      _proto.onComplete = function onComplete() {};

      _proto.onError = function onError() {};

      _proto.onProgress = function onProgress() {};

      _proto.onStart = function onStart() {};

      _proto.onSuccess = function onSuccess() {} // public
      // actions
      ;

      _proto.getResponse = function getResponse() {
        return this._response;
      };

      _proto.send = function send() {
        var _this = this;

        if (!this._chunks) return this._sendSingle();

        this._chunks.options.before(this, function (cont) {
          _this._sendChunks();
        });
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

      _proto._buildUrl = function _buildUrl() {
        var queries = [];
        var usign = this._url.includes('?') ? '&' : '?';

        for (var k in this._queries) {
          queries.push(this._qs(k) + '=' + this._qs(this._queries[k]));
        }

        if (queries.length) this._url += usign + queries;
      };

      _proto._parseChunkOption = function _parseChunkOption(options) {
        if (!options.chunks) return;
        var file = null;
        var config = {};
        var useChunk = false;
        var defs = {
          chunkSize: 200000,
          minSize: 500000,
          after: function after(p, r, cb) {
            cb(r);
          },
          before: function before(up, cb) {
            cb(true);
          },
          test: function test() {
            return true;
          }
        };

        for (var k in defs) {
          config[k] = options.chunks[k] || defs[k];
        }

        for (var _k in this._files) {
          file = this._files[_k];
          if (file.size < config.minSize) continue;
          var proc = config.test(this, file, config);
          if (!proc) continue;
          useChunk = true;
          break;
        }

        if (useChunk && Object.keys(this._files).length > 1) throw 'Multiple file is not supported for chunk upload';
        this._chunks = {
          chunk: 0,
          chunks: Math.ceil(file.size / config.chunkSize),
          options: config
        };
      };

      _proto._qs = function _qs(str) {
        return encodeURIComponent(str);
      };

      _proto._registerEvents = function _registerEvents(options) {
        var _this2 = this;

        var events = ['onChankUploaded', 'onComplete', 'onError', 'onProgress', 'onSuccess', 'onStart'];
        events.forEach(function (i) {
          if (options[i]) _this2[i] = options[i];
        });
      };

      _proto._sendSingle = function _sendSingle() {
        var _this3 = this;

        this.onStart(this);

        this._upload(this._files, this._fields, function (err, res) {
          _this3.onProgress(_this3, 100);

          _this3.onComplete(_this3, _this3._xhr);

          if (err) return _this3.onError(_this3, _this3._xhr);

          _this3.onSuccess(_this3, _this3._xhr, res);
        });
      };

      _proto._sendChunks = function _sendChunks() {
        var _this4 = this;

        var file;

        for (var k in this._files) {
          file = this._files[k];
        }

        var nextChunkIndex = this._chunks.chunk + 1;
        var config = this._chunks;
        var opts = config.options;
        if (config.chunk) this.onStart(this);
        var chunkStart = config.chunk * opts.chunkSize;
        var chunkEnd = chunkStart + opts.chunkSize;
        if (chunkEnd > file.size) chunkEnd = file.size;
        var chunkFile = file.slice(chunkStart, chunkEnd);

        if (!chunkFile.size) {
          this.onComplete(this, this._xhr);
          var res;

          try {
            res = JSON.parse(this._response);
          } catch (e) {
            res = this._response;
          }

          return this._chunks.options.after(this, res, function (r) {
            _this4.onSuccess(_this4, _this4._xhr, r);
          });
        }

        var chunkFields = this._fields;
        chunkFields.chunk = this._chunks.chunk;
        chunkFields.chunks = this._chunks.chunks;
        var chunkProgress = Math.round(nextChunkIndex / this._chunks.chunks * 100);
        this._chunks.chunk = nextChunkIndex;

        this._upload({
          fkey: chunkFile
        }, chunkFields, function (err, res) {
          _this4.onProgress(_this4, chunkProgress);

          if (err) return _this4.onError(_this4, _this4._xhr);

          _this4.onChankUploaded(_this4, _this4._xhr, res, function (next) {
            if (next === true) return setTimeout(function () {
              return _this4._sendChunks();
            }, 100);
            return _this4.onError(_this4, _this4._xhr);
          });
        });
      };

      _proto._upload = function _upload(files, fields, callback) {
        var _this5 = this;

        var formData = new FormData(),
            xhr = new XMLHttpRequest();
        this._xhr = xhr;

        for (var field in fields) {
          formData.append(field, fields[field]);
        }

        for (var _field in files) {
          formData.append(_field, files[_field], files[_field].name);
        }

        xhr.open('POST', this._url, true);

        xhr.onreadystatechange = function (e) {
          if (xhr.readyState != 4) return;
          _this5._response = xhr.responseText;
          if (xhr.status != 200) return callback(xhr.status, 'Invalid server response');
          var res = null;

          try {
            res = JSON.parse(xhr.responseText);
          } catch (e) {
            res = xhr.responseText;
          }

          callback(0, res);
        };

        xhr.send(formData);
      };

      return FileUploader;
    }();

    window.FileUploader = FileUploader;

    exports.FileUploader = FileUploader;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=fileuploader.js.map
