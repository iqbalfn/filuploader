'use strict'

const year = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * File Uploader v0.1.0 (https://iqbalfn.github.io/fileuploader/)
  * Copyright 2020 Iqbal Fauzi
  * Licensed under MIT (https://github.com/iqbalfn/fileuploader/blob/master/LICENSE)
  */`
}

module.exports = getBanner
