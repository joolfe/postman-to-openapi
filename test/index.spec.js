'use strict'

const { describe, it, afterEach } = require('mocha')
const postmanToOpenApi = require('../lib')
const path = require('path')
const { equal, ok } = require('assert').strict
const { readFileSync, existsSync, unlinkSync } = require('fs')

const OUTPUT_PATH = path.join(__dirname, '/openAPIRes.yml')

const COLLECTION_BASIC = './test/resources/input/PostmantoOpenAPI.postman_collection.json'
const EXPECTED_BASIC = readFileSync('./test/resources/output/Basic.yml', 'utf8')
const COLLECTION_SIMPLE = './test/resources/input/SimplePost.json'
const EXPECTED_INFO_OPTS = readFileSync('./test/resources/output/InfoOpts.yml', 'utf8')

describe('Library specs', function () {
  afterEach('remove file', function () {
    if (existsSync(OUTPUT_PATH)) {
      unlinkSync(OUTPUT_PATH)
    }
  })

  it('should work with a basic transform', async function () {
    const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH, {})
    equal(EXPECTED_BASIC, result)
    ok(existsSync(OUTPUT_PATH))
  })

  it('should work when no save', async function () {
    await postmanToOpenApi(COLLECTION_BASIC, '', { save: false })
  })

  it('should work if info is passed as parameter', async function () {
    const result = await postmanToOpenApi(COLLECTION_SIMPLE, OUTPUT_PATH, {
      info: {
        title: 'Options title',
        version: '6.0.7-beta',
        description: 'Description from options',
        termsOfService: 'http://tos.myweb.com'
      }
    })
    equal(EXPECTED_INFO_OPTS, result)
  })
})
