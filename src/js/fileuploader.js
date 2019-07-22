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

class FileUploader {
    constructor(options) {
        this._queries  = options.queries    || {}
        this._fields   = options.fields     || {}
        this._files    = options.files      || {}
        this._headers  = options.headers    || {}
        this._url      = options.url
        this._response = null
        this._xhr      = null

        // events
        let events = ['onStart', 'onProgress', 'onError', 'onSuccess', 'onComplete']
        events.forEach(i => {
            if(options[i])
                this[i] = options[i]
        })
    }

    // events callback
    onStart(){}
    onProgress(){}
    onError(){}
    onSuccess(){}
    onComplete(){}

    // public

    // actions

    getResponse(){
        return this._response
    }

    send(){
        let formData = new FormData(),
            xhr      = new XMLHttpRequest()

        this._xhr = xhr

        for(let field in this._fields)
            formData.append(field, this._fields[field])

        for(let field in this._files)
            formData.append(field, this._files[field], this._files[field].name);

        let url     = this._url
        let usign   = url.includes('?') ? '&' : '?'
        let queries = []
        for(let k in this._queries)
            queries.push( this._qs(k) + '=' + this._qs(this._queries[k]))

        if(queries.length)
            url+= usign + queries

        xhr.open('POST', url, true);

        xhr.onreadystatechange = () => {
            this.onProgress(this, xhr.readyState)

            if(xhr.readyState != 4)
                return
            
            if(xhr.status != 200){
                this.onError(this, this._xhr)
                this.onComplete(this, this._xhr)
                return
            }

            let res = null

            try{
                res = JSON.parse(xhr.responseText)
            }catch(e){
                res = xhr.responseText
            }

            this.onSuccess(this, this._xhr, res)
            this.onComplete(this, this._xhr)
        }

        xhr.send(formData);
        this.onStart(this, this._xhr)
    }

    // setter & adder
    addField(name, value){
        this._fields[name] = value
    }

    addFile(name, value){
        this._files[name] = value
    }

    addHeader(name, value){
        this._headers[name] = value
    }

    addQuery(name, value){
        this._queries[name] = value
    }

    setUrl(url){
        this._url = url
    }

    // getter
    getUrl(){
        return this._url
    }

    getField(name){
        return this._fields[name]
    }

    getFields(){
        return this._fields
    }

    getFile(name){
        return this._files[name]
    }

    getFiles(){
        return this._files
    }

    getHeader(name){
        return this._headers[name]
    }

    getHeaders(){
        return this._headers
    }

    getQuery(name){
        return this._queries[name]
    }

    getQueries(){
        return this._queries
    }

    // private

    _qs(str){
        return encodeURIComponent(str)
    }
}

window.FileUploader = FileUploader

export default FileUploader