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
    const { request: { url: { path }, method, body, description }, name: summary, tag = defaultTag } = element
    const compiledPath = '/' + path.join('/')
    if (!paths[compiledPath]) paths[compiledPath] = {}
    paths[compiledPath][method.toLowerCase()] = {
      tags: [tag],
      summary,
      ...(description ? { description } : {}),
      requestBody: parseBody(body),
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
  const { info: { name, description: desc }, variable } = postmanJson
  const ver = getVarValue(variable, 'version', '1.0.0')
  const { title = name, description = desc, version = ver, termsOfService } = optsInfo
  return {
    title,
    description,
    version,
    ...(termsOfService ? { termsOfService } : {})
  }
}

function parseBody (body) {
  if (body.mode === 'raw') {
    return {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            example: JSON.parse(body.raw)
          }
        }
      }
    }
  } else {
    return {
      content: {
        'text/plain': {}
      }
    }
  }
}

function getVarValue (variables, name, def) {
  const variable = variables.find(({ key }) => key === name)
  return variable ? variable.value : def
}

module.exports = postmanToOpenApi
