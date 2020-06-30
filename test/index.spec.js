'use strict'

const { describe, it } = require('mocha')
const postmanToOpenApi = require('../lib')
const path = require('path')

describe('First test', function () {
  it('should work with a basic transform', async function () {
    const input = path.join(__dirname, '/resources/PostmantoOpenAPI.postman_collection.json')
    const output = path.join(__dirname, '/openAPIRes.yml')
    await postmanToOpenApi(input, output, {})
  })

  it('should work when no save', async function () {
    const input = path.join(__dirname, '/resources/PostmantoOpenAPI.postman_collection.json')
    await postmanToOpenApi(input, '', { save: false })
  })
})
