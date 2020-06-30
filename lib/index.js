'use strict'

const { promises: { writeFile, readFile } } = require('fs')
const { safeDump } = require('js-yaml')

async function postmanToOpenApi (input, output, { save = true }) {
  // TODO validate?
  const collectionFile = await readFile(input)
  const postmanJson = JSON.parse(collectionFile)
  const { item: items, info: { name: title, description } } = postmanJson
  const paths = {}

  for (const item of items) {
    const { request: { url: { path }, method, body }, name: summary } = item
    const compiledPath = '/' + path.join('/')
    if (!paths[compiledPath]) paths[compiledPath] = {}
    paths[compiledPath][method.toLowerCase()] = {
      summary,
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
    info: {
      title,
      description,
      version: '1.0.0'
    },
    paths
  }

  if (save) {
    await writeFile(output, safeDump(openApi), 'utf8')
  }

  return openApi
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

module.exports = postmanToOpenApi
