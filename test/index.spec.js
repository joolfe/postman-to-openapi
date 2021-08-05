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
const EXPECTED_AUTH_MULTIPLE = readFileSync('./test/resources/output/AuthMultiple.yml', 'utf8')
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
const EXPECTED_EMPTY_URL = readFileSync('./test/resources/output/EmptyUrl.yml', 'utf8')
const EXPECTED_X_LOGO = readFileSync('./test/resources/output/XLogo.yml', 'utf8')
const EXPECTED_X_LOGO_VAR = readFileSync('./test/resources/output/XLogoVar.yml', 'utf8')
const EXPECTED_AUTH_OPTIONS = readFileSync('./test/resources/output/AuthOptions.yml', 'utf8')
const EXPECTED_RESPONSES = readFileSync('./test/resources/output/Responses.yml', 'utf8')
const EXPECTED_RESPONSES_MULTI_LANG = readFileSync('./test/resources/output/ResponsesMultiLang.yml', 'utf8')
const EXPECTED_AUTH_REQUEST = readFileSync('./test/resources/output/AuthRequest.yml', 'utf8')
const EXPECTED_RESPONSES_NO_HEADERS = readFileSync('./test/resources/output/ResponsesNoHeaders.yml', 'utf8')
const EXPECTED_FORM_DATA = readFileSync('./test/resources/output/FormData.yml', 'utf8')
const EXPECTED_FORM_URLENCODED = readFileSync('./test/resources/output/FormUrlencoded.yml', 'utf8')
const EXPECTED_VARIABLES = readFileSync('./test/resources/output/Variables.yml', 'utf8')
const EXPECTED_VARIABLES_ADDITIONAL = readFileSync('./test/resources/output/VariablesAdditional.yml', 'utf8')

const AUTH_DEFINITIONS = {
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
      const COLLECTION_EMPTY_URL = `./test/resources/input/${version}/EmptyUrl.json`
      const COLLECTION_XLOGO = `./test/resources/input/${version}/XLogo.json`
      const COLLECTION_MULTI_AUTH = `./test/resources/input/${version}/AuthMultiple.json`
      const COLLECTION_RESPONSES = `./test/resources/input/${version}/Responses.json`
      const COLLECTION_RESPONSES_MULTI_LANG = `./test/resources/input/${version}/ResponsesMultiLang.json`
      const COLLECTION_AUTH_REQUEST = `./test/resources/input/${version}/AuthRequest.json`
      const COLLECTION_FORM_DATA = `./test/resources/input/${version}/FormData.json`
      const COLLECTION_FORM_URLENCODED = `./test/resources/input/${version}/FormUrlencoded.json`
      const COLLECTION_VARIABLES = `./test/resources/input/${version}/Variables.json`

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

      it('should not fail if license and/or contact are empty', async function () {
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH,
          {
            info: {
              license: {},
              contact: {}
            }
          })
        equal(result, EXPECTED_BASIC)
      })

      it('should not fail if auth is empty object', async function () {
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH,
          {
            auth: {}
          })
        equal(result, EXPECTED_BASIC)
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
        const result = await postmanToOpenApi(COLLECTION_BASIC, OUTPUT_PATH, { auth: AUTH_DEFINITIONS })
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

      it('should not transform empty url request', async function () {
        const result = await postmanToOpenApi(COLLECTION_EMPTY_URL, OUTPUT_PATH)
        equal(result, EXPECTED_EMPTY_URL)
      })

      it('should accept "x-logo" extension by option', async function () {
        const result = await postmanToOpenApi(COLLECTION_XLOGO, OUTPUT_PATH, {
          info: {
            xLogo: {
              url: 'https://github.com/joolfe/logoBanner.png',
              backgroundColor: '#FFFFFF',
              altText: 'Example logo'
            }
          }
        })
        equal(result, EXPECTED_X_LOGO)
      })

      it('should use only "x-logo" standard fields', async function () {
        const result = await postmanToOpenApi(COLLECTION_XLOGO, OUTPUT_PATH, {
          info: {
            xLogo: {
              url: 'https://github.com/joolfe/logoBanner.png',
              backgroundColor: '#FFFFFF',
              altText: 'Example logo',
              incorrect: 'field'
            }
          }
        })
        equal(result, EXPECTED_X_LOGO)
      })

      it('should use "x-logo" from variables', async function () {
        const result = await postmanToOpenApi(COLLECTION_XLOGO, OUTPUT_PATH, {})
        equal(result, EXPECTED_X_LOGO_VAR)
      })

      it('should support auth definition at request level', async function () {
        const result = await postmanToOpenApi(COLLECTION_MULTI_AUTH, OUTPUT_PATH, {})
        equal(result, EXPECTED_AUTH_MULTIPLE)
      })

      it('should ignore operational auth when auth options are provided', async function () {
        const result = await postmanToOpenApi(COLLECTION_MULTI_AUTH, OUTPUT_PATH, { auth: AUTH_DEFINITIONS })
        equal(result, EXPECTED_AUTH_OPTIONS)
      })

      it('should add responses from postman examples', async function () {
        const result = await postmanToOpenApi(COLLECTION_RESPONSES, OUTPUT_PATH, { pathDepth: 2 })
        equal(result, EXPECTED_RESPONSES)
      })

      it('should add responses from multiple format for the same status code (text and json)', async function () {
        const result = await postmanToOpenApi(COLLECTION_RESPONSES_MULTI_LANG, OUTPUT_PATH, { pathDepth: 2 })
        equal(result, EXPECTED_RESPONSES_MULTI_LANG)
      })

      it('should work if auth only defined at request level', async function () {
        const result = await postmanToOpenApi(COLLECTION_AUTH_REQUEST, OUTPUT_PATH, {})
        equal(result, EXPECTED_AUTH_REQUEST)
      })

      it('should avoid headers in response', async function () {
        const result = await postmanToOpenApi(COLLECTION_RESPONSES, OUTPUT_PATH, { pathDepth: 2, responseHeaders: false })
        equal(result, EXPECTED_RESPONSES_NO_HEADERS)
      })

      it('should parse POST methods with form data', async function () {
        const result = await postmanToOpenApi(COLLECTION_FORM_DATA, OUTPUT_PATH, {})
        equal(result, EXPECTED_FORM_DATA)
      })

      it('should parse POST methods with www form urlencoded', async function () {
        const result = await postmanToOpenApi(COLLECTION_FORM_URLENCODED, OUTPUT_PATH, {})
        equal(result, EXPECTED_FORM_URLENCODED)
      })

      it('should replace postman variables if feature activated', async function () {
        const result = await postmanToOpenApi(COLLECTION_VARIABLES, OUTPUT_PATH, { replaceVars: true })
        equal(result, EXPECTED_VARIABLES)
      })

      it('should use additional variables for replace', async function () {
        const result = await postmanToOpenApi(COLLECTION_VARIABLES, OUTPUT_PATH, {
          replaceVars: true,
          additionalVars: {
            company: 'myCompany',
            service: 'myService'
          }
        })
        equal(result, EXPECTED_VARIABLES_ADDITIONAL)
      })

      it('should not fail if no variable are defined and want to replace', async function () {
        const result = await postmanToOpenApi(COLLECTION_FORM_DATA, OUTPUT_PATH, { replaceVars: true })
        equal(result, EXPECTED_FORM_DATA)
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
