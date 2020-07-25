'use strict'

const { describe, it, afterEach } = require('mocha')
const postmanToOpenApi = require('../lib')
const path = require('path')
const { equal, ok } = require('assert').strict
const { readFileSync, existsSync, unlinkSync } = require('fs')

const OUTPUT_PATH = path.join(__dirname, '/openAPIRes.yml')

const COLLECTION_BASIC = './test/resources/input/PostmantoOpenAPI.json'
const COLLECTION_SIMPLE = './test/resources/input/SimplePost.json'
const COLLECTION_NO_VERSION = './test/resources/input/NoVersion.json'
const COLLECTION_FOLDERS = './test/resources/input/FolderCollection.json'
const COLLECTION_GET = './test/resources/input/GetMethods.json'

const EXPECTED_BASIC = readFileSync('./test/resources/output/Basic.yml', 'utf8')
const EXPECTED_INFO_OPTS = readFileSync('./test/resources/output/InfoOpts.yml', 'utf8')
const EXPECTED_NO_VERSION = readFileSync('./test/resources/output/NoVersion.yml', 'utf8')
const EXPECTED_CUSTOM_TAG = readFileSync('./test/resources/output/CustomTag.yml', 'utf8')
const EXPECTED_FOLDERS = readFileSync('./test/resources/output/Folders.yml', 'utf8')
const EXPECTED_GET_METHODS = readFileSync('./test/resources/output/GetMethods.yml', 'utf8')

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

  it('should use default version if not informed and not in postman variables', async function () {
    const result = await postmanToOpenApi(COLLECTION_NO_VERSION, OUTPUT_PATH, {})
    equal(EXPECTED_NO_VERSION, result)
  })

  it('should use "defaultTag" provided by config', async function () {
    const result = await postmanToOpenApi(COLLECTION_SIMPLE, OUTPUT_PATH, { defaultTag: 'Custom Tag' })
    equal(EXPECTED_CUSTOM_TAG, result)
  })

  it('should work with folders and use as tags', async function () {
    const result = await postmanToOpenApi(COLLECTION_FOLDERS, OUTPUT_PATH)
    equal(EXPECTED_FOLDERS, result)
  })

  it('should parse GET methods with query string', async function () {
    const result = await postmanToOpenApi(COLLECTION_GET, OUTPUT_PATH)
    equal(EXPECTED_GET_METHODS, result)
  })

  // other types of params
  // do something about mandatory params?
})
