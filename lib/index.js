'use strict'

const { promises: { writeFile, readFile } } = require('fs')
const { safeDump } = require('js-yaml')

async function postmanToOpenApi (input, output, { save = true, info = {}, defaultTag = 'default' } = {}) {
  // TODO validate?
  const collectionFile = await readFile(input)
  const postmanJson = JSON.parse(collectionFile)
  const { item: items } = postmanJson
  const paths = {}

  for (let [i, element] of items.entries()) {
    const { item, name } = element
    if (item != null) { // is a folder
      const tagged = item.map(e => ({ ...e, tag: name }))
      items.splice(i, 1, ...tagged)
      element = tagged.shift()
    }
    const { request: { url: { path, query }, method, body, description }, name: summary, tag = defaultTag } = element
    const compiledPath = '/' + path.join('/')
    if (!paths[compiledPath]) paths[compiledPath] = {}
    paths[compiledPath][method.toLowerCase()] = {
      tags: [tag],
      summary,
      ...(description ? { description } : {}),
      ...parseBody(body, method),
      ...parseParams(query),
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {}
          }
        }
      }
    }
  }

  const openApi = {
    openapi: '3.0.0',
    info: compileInfo(postmanJson, info),
    paths
  }

  const openApiYml = safeDump(openApi)
  if (save) {
    await writeFile(output, openApiYml, 'utf8')
  }
  return openApiYml
}

function compileInfo (postmanJson, optsInfo) {
  const { info: { name, description: desc }, variable = [] } = postmanJson
  const ver = getVarValue(variable, 'version', '1.0.0')
  const { title = name, description = desc, version = ver, termsOfService } = optsInfo
  return {
    title,
    description,
    version,
    ...(termsOfService ? { termsOfService } : {})
  }
}

function parseBody (body = {}, method) {
  // Swagger validation return an error if GET has body
  if (['GET'].includes(method)) return {}
  const { mode, raw } = body
  let content = {}
  switch (mode) {
    case 'raw':
      content = {
        'application/json': {
          schema: {
            type: 'object',
            example: JSON.parse(raw)
          }
        }
      }
      break
    case 'file':
      content = {
        'text/plain': {}
      }
      break
    default:
      content = {}
      break
  }
  return { requestBody: { content } }
}

function parseParams (query = []) {
  const parameters = query.map(({ key, description }) => ({
    name: key,
    in: 'query',
    schema: {
      type: 'string'
    },
    ...(description ? { description } : {})
  }))
  return (parameters.length) ? { parameters } : {}
}

function getVarValue (variables, name, def) {
  const variable = variables.find(({ key }) => key === name)
  return variable ? variable.value : def
}

module.exports = postmanToOpenApi
