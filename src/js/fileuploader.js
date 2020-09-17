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

class FileUploader {
    constructor(options) {
        this._queries  = options.queries    || {}
        this._fields   = options.fields     || {}
        this._files    = options.files      || {}
        this._headers  = options.headers    || {}
        this._url      = options.url
        this._response = null
        this._xhr      = null
        this._chunks    = null
        // {
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

        if(!Object.keys(this._files).length)
            throw 'No file provided'

        this._registerEvents(options)
        this._buildUrl()
        this._parseChunkOption(options)
    }

    // events callback
    onChankUploaded(up, xhr, res, cb){ cb(true) }
    onComplete(){}
    onError(){}
    onProgress(){}
    onStart(){}
    onSuccess(){}

    // public

    // actions

    getResponse(){
        return this._response
    }

    send(){
        if(!this._chunks)
            return this._sendSingle()
        
        this._chunks.options.before(this, cont => {
            this._sendChunks()
        })
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

    _buildUrl(){
        let queries = []
        let usign   = this._url.includes('?') ? '&' : '?'
        for(let k in this._queries)
            queries.push( this._qs(k) + '=' + this._qs(this._queries[k]))

        if(queries.length)
            this._url+= usign + queries
    }

    _parseChunkOption(options){
        if(!options.chunks)
            return

        let file      = null
        let config    = {}
        let useChunk  = false
        let defs   = {
            chunkSize : 200000,
            minSize   : 500000,
            after(p,r,cb){ cb(r) },
            before(up,cb){ cb(true) },
            test(){ return true }
        }

        for(let k in defs)
            config[k] = options.chunks[k] || defs[k]

        for(let k in this._files){
            file = this._files[k]

            if(file.size < config.minSize)
                continue

            let proc = config.test(this, file, config)
            if(!proc)
                continue

            useChunk = true
            break
        }

        if(useChunk && Object.keys(this._files).length > 1)
            throw 'Multiple file is not supported for chunk upload'

        this._chunks = {
            chunk   : 0,
            chunks  : Math.ceil( file.size / config.chunkSize ),
            options : config
        }
    }

    _qs(str){
        return encodeURIComponent(str)
    }

    _registerEvents(options){
        let events = ['onChankUploaded', 'onComplete', 'onError', 'onProgress', 'onSuccess', 'onStart']
        events.forEach(i => {
            if(options[i])
                this[i] = options[i]
        })
    }

    _sendSingle(){
        this.onStart(this)

        this._upload(this._files, this._fields, (err,res) => {
            this.onProgress(this, 100)
            this.onComplete(this, this._xhr)
            if(err)
                return this.onError(this, this._xhr)
            this.onSuccess(this, this._xhr, res)
        })
    }

    _sendChunks(){
        let file
        let fkey
        for(let k in this._files){
            file = this._files[k]
            fkey = k
        }

        let nextChunkIndex = this._chunks.chunk + 1

        let config = this._chunks
        let opts   = config.options

        if(config.chunk)
            this.onStart(this)

        let chunkStart = config.chunk * opts.chunkSize
        let chunkEnd   = chunkStart + opts.chunkSize
        if(chunkEnd > file.size)
            chunkEnd = file.size

        let chunkFile  = file.slice( chunkStart, chunkEnd )
        if(!chunkFile.size){
            this.onComplete(this, this._xhr)
            let res

            try{
                res = JSON.parse(this._response)
            }catch(e){
                res = this._response
            }

            return this._chunks.options.after(this, res, r => {
                this.onSuccess(this, this._xhr, r)
            })
        }

        let chunkFields    = this._fields
        chunkFields.chunk  = this._chunks.chunk
        chunkFields.chunks = this._chunks.chunks

        let chunkProgress  = Math.round(nextChunkIndex / this._chunks.chunks * 100)
        
        let chunkForm = {}
        chunkForm[fkey] = chunkFile

        this._chunks.chunk = nextChunkIndex
        this._upload(chunkForm, chunkFields, (err,res) => {
            this.onProgress(this, chunkProgress)
            
            if(err)
                return this.onError(this, this._xhr)

            this.onChankUploaded(this, this._xhr, res, next => {
                if(next === true)
                    return setTimeout(() => this._sendChunks(), 100)
                return this.onError(this, this._xhr)
            })
        })
    }

    _upload(files, fields, callback){
        let formData = new FormData(),
            xhr      = new XMLHttpRequest();

        this._xhr    = xhr

        for(let field in fields)
            formData.append(field, fields[field])

        for(let field in files)
            formData.append(field, files[field], files[field].name)

        xhr.open('POST', this._url, true);

        xhr.onreadystatechange = e => {
            if(xhr.readyState != 4)
                return

            this._response = xhr.responseText

            if(xhr.status != 200)
                return callback(xhr.status, 'Invalid server response')

            let res = null
            try{
                res = JSON.parse(xhr.responseText)
            }catch(e){
                res = xhr.responseText
            }

            callback(0, res)
        }

        xhr.send(formData);
    }
}

window.FileUploader = FileUploader

export default FileUploader