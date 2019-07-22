'use strict'

const year = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * File Uploader v0.0.1 (https://iqbalfn.github.io/fileuploader/)
  * Copyright 2019 Iqbal Fauzi
  * Licensed under MIT (https://github.com/iqbalfn/fileuploader/blob/master/LICENSE)
  */`
}

module.exports = getBanner
