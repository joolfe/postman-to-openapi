function replaceUrlPath (url, globalVariable) {
  const newUrl = globalVariable.find((variable) => variable.key === 'url')
  url.raw = url.raw.replace(/({{url}})/g, newUrl.value)
  const objUrl = new URL(url.raw)
  url.host = url.host.map((val) => val.replace(/({{url}})/g, objUrl.host))
  url.protocol = objUrl.protocol.substring(0, objUrl.protocol.length - 1)
  return url
}

function parsePathParameters (variables = [], globalVariable = []) {
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

  return {
    paramsMeta
  }
}

function replaceGlobalVariable (value, globalVariable) {
  const param = value.replace(/{{(.*)}}/g, '$1')
  const variable = globalVariable.find((val) => val.key === param)
  if (variable) return variable.value
  else return value
}

function replaceParameterPath (paths = [], pathDepth) {
  paths = paths.slice(pathDepth) // path depth
  // replace repeated '{' and '}' chars
  return '/' + paths.map((path) => path.replace(/^:(.*)/g, '{$1}')).join('/')
}

module.exports = {
  replaceUrlPath,
  parsePathParameters,
  replaceParameterPath
}
