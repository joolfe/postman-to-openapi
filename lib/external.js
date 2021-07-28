function replaceUrlPath (url, globalVariable) {
  const newUrl = globalVariable.find((variable) => variable.key === 'url')
  if (newUrl) {
    url.raw = url.raw.replace(/({{url}})/g, newUrl.value)
    const objUrl = new URL(url.raw)
    url.host = url.host.map((val) => val.replace(/({{url}})/g, objUrl.host))
    url.protocol = objUrl.protocol.substring(0, objUrl.protocol.length - 1)
  }
  return url
}

function parseParamsMeta (variables = [], globalVariable = []) {
  const paramsMeta = {}
  for (const variable of variables) {
    variable.value = replaceGlobalVariable(variable.value, globalVariable)
    paramsMeta[variable.key] = {
      object: 'path',
      name: variable.key,
      description: variable.description,
      required: 'true',
      type: isNaN(variable.value) ? 'string' : 'number',
      example: isNaN(variable.value) ? variable.value : Number(variable.value)
    }
  }

  return paramsMeta
}

function replaceGlobalVariable (value, globalVariable) {
  const param = value.replace(/{{(.*)}}/g, '$1')
  const variable = globalVariable.find((val) => val.key === param)
  if (variable) return variable.value
  else return value
}

function replaceParameterPath (paths = []) {
  // replace repeated `:` chars
  return paths.map((path) => path.replace(/^:(.*)/g, '{$1}'))
}

function mergeCollectionToGlobalVariable (global, collection) {
  return global.map((item, i) => {
    if (collection[i]) return collection[i]
    else return item
  })
}

function getParamsMeta (url, global, collection) {
  const globalVariable = mergeCollectionToGlobalVariable(global, collection)
  const newUrl = replaceUrlPath(url, globalVariable)
  // get path variable in url obj
  const pathVariable = newUrl.variable
  return { ...parseParamsMeta(pathVariable, globalVariable) }
}

module.exports = {
  replaceParameterPath,
  getParamsMeta
}
