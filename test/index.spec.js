'use strict'

const { describe, it, afterEach } = require('mocha')
const postmanToOpenApi = require('../lib')
const path = require('path')
const { equal, ok } = require('assert').strict
const { readFileSync, existsSync, unlinkSync } = require('fs')
const { version } = require('../package.json')

const OUTPUT_PATH = path.join(__dirname, '/openAPIRes.yml')

const COLLECTION_NO_OPTIONS = './test/resources/input/NoOptionsInBody.json'

const EXPECTED_BASIC = readFileSync('./test/resources/output/Basic.yml', 'utf8')
const EXPECTED_INFO_OPTS = readFileSync('./test/resources/output/InfoOpts.yml', 'utf8')
const EXPECTED_NO_VERSION = readFileSync('./test/resources/output/NoVersion.yml', 'utf8')
const EXPECTED_CUSTOM_TAG = readFileSync('./test/resources/output/CustomTag.yml', 'utf8')
const EXPECTED_FOLDERS = readFileSync('./test/resources/output/Folders.yml', 'utf8')
const EXPECTED_FOLDERS_NO_CONCAT = readFileSync('./test/resources/output/FoldersNoConcat.yml', 'utf8')
const EXPECTED_FOLDERS_SEPARATOR = readFileSync('./test/resources/output/FoldersSeparator.yml', 'utf8')
const EXPECTED_GET_METHODS = readFileSync('./test/resources/output/GetMethods.yml', 'utf8')
const EXPECTED_HEADERS = readFileSync('./test/resources/output/Headers.yml', 'utf8')
const EXPECTED_AUTH_BEARER = readFileSync('./test/resources/output/AuthBearer.yml', 'utf8')
const EXPECTED_AUTH_BASIC = readFileSync('./test/resources/output/AuthBasic.yml', 'utf8')
const EXPECTED_BASIC_WITH_AUTH = readFileSync('./test/resources/output/BasicWithAuth.yml', 'utf8')
const EXPECTED_PATH_PARAMS = readFileSync('./test/resources/output/PathParams.yml', 'utf8')
const EXPECTED_MULTIPLE_SERVERS = readFileSync('./test/resources/output/MultipleServers.yml', 'utf8')
const EXPECTED_SERVERS_OPTIONS = readFileSync('./test/resources/output/ServersOpts.yml', 'utf8')
const EXPECTED_NO_SERVERS = readFileSync('./test/resources/output/NoServers.yml', 'utf8')
const EXPECTED_LICENSE_CONTACT = readFileSync('./test/resources/output/LicenseContact.yml', 'utf8')
const EXPECTED_LICENSE_CONTACT_OPT = readFileSync('./test/resources/output/LicenseContactOpts.yml', 'utf8')
const EXPECTED_LICENSE_CONTACT_PARTIAL = readFileSync('./test/resources/output/LicenseContactPartial.yml', 'utf8')
const EXPECTED_LICENSE_CONTACT_PARTIAL_2 = readFileSync('./test/resources/output/LicenseContactPartial2.yml', 'utf8')
const EXPECTED_DEPTH_PATH_PARAMS = readFileSync('./test/resources/output/DepthPathParams.yml', 'utf8')
const EXPECTED_PARSE_STATUS_CODE = readFileSync('./test/resources/output/ParseStatus.yml', 'utf8')
const EXPECTED_NO_PATH = readFileSync('./test/resources/output/NoPath.yml', 'utf8')
const EXPECTED_DELETE = readFileSync('./test/resources/output/DeleteOperation.yml', 'utf8')
const EXPECTED_URL_WITH_PORT = readFileSync('./test/resources/output/UrlWithPort.yml', 'utf8')
const EXPECTED_EXTERNAL_DOCS = readFileSync('./test/resources/output/ExternalDocs.yml', 'utf8')
const EXPECTED_EXTERNAL_DOCS_OPTS = readFileSync('./test/resources/output/ExternalDocsOpts.yml', 'utf8')
const EXPECTED_EXTERNAL_DOCS_OPTS_PARTIAL = readFileSync('./test/resources/output/ExternalDocsOptsPartial.yml', 'utf8')

describe('Library specs', function () {
  afterEach('remove file', function () {
    if (existsSync(OUTPUT_PATH)) {
      unlinkSync(OUTPUT_PATH)
    }
  })

  const TEST_VERSIONS = ['v2', 'v21']

  TEST_VERSIONS.forEach(function (version) {
    describe(`Postman Collection ${version}`, function () {
      const COLLECTION_BASIC = `./test/resources/input/${version}/PostmantoOpenAPI.json`
      const COLLECTION_SIMPLE = `./test/resources/input/${version}/SimplePost.json`
      const COLLECTION_NO_VERSION = `./test/resources/input/${version}/NoVersion.json`
      const COLLECTION_FOLDERS = `./test/resources/input/${version}/FolderCollection.json`
      const COLLECTION_GET = `./test/resources/input/${version}/GetMethods.json`
      const COLLECTION_HEADERS = `./test/resources/input/${version}/Headers.json`
      const COLLECTION_PATH_PARAMS = `./test/resources/input/${version}/PathParams.json`
      const COLLECTION_MULTIPLE_SERVERS = `./test/resources/input/${version}/MultipleServers.json`
      const COLLECTION_LICENSE_CONTACT = `./test/resources/input/${version}/LicenseContact.json`
      const COLLECTION_DEPTH_PATH_PARAMS = `./test/resources/input/${version}/DepthPathParams.json`
      const COLLECTION_PARSE_STATUS_CODE = `./test/resources/input/${version}/ParseStatusCode.json`
      const COLLECTION_NO_PATH = `./test/resources/input/${version}/NoPath.json`
      const COLLECTION_DELETE = `./test/resources/input/${version}/DeleteOperation.json`
      const COLLECTION_AUTH_BEARER = `./test/resources/input/${version}/AuthBearer.json`
      const COLLECTION_AUTH_BASIC = `./test/resources/input/${version}/AuthBasic.json`
      const COLLECTION_URL_WITH_PORT = `./test/resources/input/${version}/UrlWithPort.json`
      const COLLECTION_EXTERNAL_DOCS = `./test/resources/input/${version}/ExternalDocs.json`

      it('should work with a basic transform', async function () {
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH, {})
        equal(result, EXPECTED_BASIC)
        ok(existsSync(OUTPUT_PATH))
      })

      it('should work when no save', async function () {
        await postmanToOpenApi(COLLECTION_BASIC, null)
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
        console.log(result)
        equal(result, EXPECTED_INFO_OPTS)
      })

      it('should use "defaultTag" provided by config', async function () {
        const result = await postmanToOpenApi(COLLECTION_SIMPLE, OUTPUT_PATH, { defaultTag: 'Custom Tag' })
        equal(result, EXPECTED_CUSTOM_TAG)
      })

      it('should use default version if not informed and not in postman variables', async function () {
        const result = await postmanToOpenApi(COLLECTION_NO_VERSION, OUTPUT_PATH, {})
        equal(result, EXPECTED_NO_VERSION)
      })

      it('should work with folders and use as tags', async function () {
        const result = await postmanToOpenApi(COLLECTION_FOLDERS, OUTPUT_PATH)
        equal(result, EXPECTED_FOLDERS)
      })

      it('should use "folders.separator" options for customize tags separators ', async function () {
        const result = await postmanToOpenApi(COLLECTION_FOLDERS, OUTPUT_PATH, { folders: { separator: '-' } })
        equal(result, EXPECTED_FOLDERS_SEPARATOR)
      })

      it('should use "folders.concat" options for not concatenate folder names as tags ', async function () {
        const result = await postmanToOpenApi(COLLECTION_FOLDERS, OUTPUT_PATH, { folders: { concat: false } })
        equal(result, EXPECTED_FOLDERS_NO_CONCAT)
      })

      it('should parse GET methods with query string', async function () {
        const result = await postmanToOpenApi(COLLECTION_GET, OUTPUT_PATH)
        equal(result, EXPECTED_GET_METHODS)
      })

      it('should parse HEADERS parameters', async function () {
        const result = await postmanToOpenApi(COLLECTION_HEADERS, OUTPUT_PATH)
        equal(result, EXPECTED_HEADERS)
      })

      it('should parse path params', async function () {
        const result = await postmanToOpenApi(COLLECTION_PATH_PARAMS, OUTPUT_PATH)
        equal(result, EXPECTED_PATH_PARAMS)
      })

      it('should parse servers from existing host in postman collection', async function () {
        const result = await postmanToOpenApi(COLLECTION_MULTIPLE_SERVERS, OUTPUT_PATH)
        equal(result, EXPECTED_MULTIPLE_SERVERS)
      })

      it('should use servers from options', async function () {
        const result = await postmanToOpenApi(COLLECTION_MULTIPLE_SERVERS, OUTPUT_PATH, {
          servers: [
            {
              url: 'https://awesome.api.sandbox.io',
              description: 'Sandbox environment server'
            },
            {
              url: 'https://awesome.api.io',
              description: 'Production env'
            }
          ]
        })
        equal(result, EXPECTED_SERVERS_OPTIONS)
      })

      it('should allow empty servers from options', async function () {
        const result = await postmanToOpenApi(COLLECTION_MULTIPLE_SERVERS, OUTPUT_PATH, { servers: [] })
        equal(result, EXPECTED_NO_SERVERS)
      })

      it('should parse license and contact from variables', async function () {
        const result = await postmanToOpenApi(COLLECTION_LICENSE_CONTACT, OUTPUT_PATH)
        equal(result, EXPECTED_LICENSE_CONTACT)
      })

      it('should use "additional info" from options', async function () {
        const result = await postmanToOpenApi(COLLECTION_LICENSE_CONTACT, OUTPUT_PATH,
          {
            info: {
              license: {
                name: 'MIT',
                url: 'https://es.wikipedia.org/wiki/Licencia_MIT'
              },
              contact: {
                name: 'My Support',
                url: 'http://www.api.com/support',
                email: 'support@api.com'
              }
            }
          })
        equal(result, EXPECTED_LICENSE_CONTACT_OPT)
      })

      it('should support optional params in license and contact options', async function () {
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH,
          {
            info: {
              license: {
                name: 'MIT'
              },
              contact: {
                name: 'My Support'
              }
            }
          })
        equal(result, EXPECTED_LICENSE_CONTACT_PARTIAL)
      })

      it('should support optional params in license and contact options (2)', async function () {
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH,
          {
            info: {
              license: {
                name: 'MIT'
              },
              contact: {
                url: 'http://www.api.com/support'
              }
            }
          })
        equal(result, EXPECTED_LICENSE_CONTACT_PARTIAL_2)
      })

      it('should use depth configuration for parse paths', async function () {
        const result = await postmanToOpenApi(COLLECTION_DEPTH_PATH_PARAMS, OUTPUT_PATH, { pathDepth: 1 })
        equal(result, EXPECTED_DEPTH_PATH_PARAMS)
      })

      it('should parse status codes from test', async function () {
        const result = await postmanToOpenApi(COLLECTION_PARSE_STATUS_CODE)
        equal(result, EXPECTED_PARSE_STATUS_CODE)
      })

      it('should parse operation when no path (only domain)', async function () {
        const result = await postmanToOpenApi(COLLECTION_NO_PATH)
        equal(result, EXPECTED_NO_PATH)
      })

      it('should support "DELETE" operations', async function () {
        const result = await postmanToOpenApi(COLLECTION_DELETE)
        equal(result, EXPECTED_DELETE)
      })

      it('should parse global authorization (Bearer)', async function () {
        const result = await postmanToOpenApi(COLLECTION_AUTH_BEARER, OUTPUT_PATH)
        equal(result, EXPECTED_AUTH_BEARER)
      })

      it('should parse global authorization (Basic)', async function () {
        const result = await postmanToOpenApi(COLLECTION_AUTH_BASIC, OUTPUT_PATH)
        equal(result, EXPECTED_AUTH_BASIC)
      })

      it('should use global authorization by configuration', async function () {
        const authDefinition = {
          myCustomAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'A resource owner JWT',
            description: 'My awesome authentication using bearer'
          },
          myCustomAuth2: {
            type: 'http',
            scheme: 'basic',
            description: 'My awesome authentication using user and password'
          },
          notSupported: {
            type: 'http',
            scheme: 'digest',
            description: 'Not supported security'
          }
        }
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH, { auth: authDefinition })
        equal(result, EXPECTED_BASIC_WITH_AUTH)
      })

      it('should parse url with port', async function () {
        const result = await postmanToOpenApi(COLLECTION_URL_WITH_PORT, OUTPUT_PATH)
        equal(result, EXPECTED_URL_WITH_PORT)
      })

      it('should parse external docs info from variables', async function () {
        const result = await postmanToOpenApi(COLLECTION_EXTERNAL_DOCS, OUTPUT_PATH)
        equal(result, EXPECTED_EXTERNAL_DOCS)
      })

      it('should parse external docs info from variables', async function () {
        const result = await postmanToOpenApi(COLLECTION_EXTERNAL_DOCS, OUTPUT_PATH,
          {
            externalDocs: {
              url: 'https://docs2.example.com',
              description: 'Find more info here or there'
            }
          })
        equal(result, EXPECTED_EXTERNAL_DOCS_OPTS)
      })

      it('should parse external docs info from variables', async function () {
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH,
          {
            externalDocs: {
              url: 'https://docs2.example.com'
            }
          })
        equal(result, EXPECTED_EXTERNAL_DOCS_OPTS_PARTIAL)
      })
    })
  })

  it('should work if no options in request body', async function () {
    const result = await postmanToOpenApi(COLLECTION_NO_OPTIONS, OUTPUT_PATH, {})
    equal(result, EXPECTED_BASIC)
  })

  it('should expose the version of the library', async function () {
    equal(postmanToOpenApi.version, version)
  })
})
