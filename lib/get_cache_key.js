const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const vueCompiler = require('vue-template-compiler')

module.exports = function getCacheKey(fileData, filename, configString) {
  const parts = vueCompiler.parseComponent(fileData, { pad: true })
  let hash
  if (parts.template.src) {
    const templateFilename = path.join(filename, '..', parts.template.src)
    const templateFileData = fs.readFileSync(templateFilename, 'utf8')
    hash = getHash(templateFileData, templateFilename, configString)
  } else {
    hash = getHash(parts.template.content, filename, configString)
  }

  if (parts.script.src) {
    const scriptFilename = path.join(filename, '..', parts.script.src)
    const scriptFileData = fs.readFileSync(scriptFilename, 'utf8')
    hash = getHash(scriptFileData, scriptFilename, configString, hash)
  } else {
    hash = getHash(parts.script.content, filename, configString, hash)
  }

  for (const style of parts.styles) {
    if (style.src) {
      const styleFilename = path.join(filename, '..', style.src)
      const styleFileData = fs.readFileSync(styleFilename, 'utf8')
      hash = getHash(styleFileData, styleFilename, configString, hash)
    } else {
      hash = getHash(style.content, filename, configString, hash)
    }
  }

  return hash.digest('hex')
}

function getHash(fileData, filePath, configString, hash) {
  return (hash || crypto.createHash('md5'))
    .update(fileData + filePath + configString, 'utf8')
}
