'use strict'

const { promises: { writeFile, readFile } } = require('fs')
const { dump } = require('js-yaml')
const { parseMdTable } = require('./md-utils')
const { version } = require('../package.json')
const { replaceParameterPath, getParamsMeta } = require('./external')
let gParamsMeta
async function postmanToOpenApi (input, output, {
  info = {}, defaultTag = 'default', pathDepth = 0,
  auth: optsAuth, servers, externalDocs = {}, folders = {},
  responseHeaders = true, values = []
} = {}) {
  // TODO validate?
  const collectionFile = await readFile(input)
  const postmanJson = JSON.parse(collectionFile)
  const { item: items, variable = [] } = postmanJson
  const paths = {}
  const domains = new Set()
  const tags = {}
  const securitySchemes = {}

  for (let [i, element] of items.entries()) {
    while (element.item != null) { // is a folder
      const { item, description: tagDesc } = element
      const tag = calculateFolderTag(element, folders)
      const tagged = item.map(e => ({ ...e, tag }))
      tags[tag] = tagDesc
      items.splice(i, 1, ...tagged)
      // Empty folders will have tagged empty
      element = (tagged.length > 0) ? tagged.shift() : items[i]
    }
    const {
      request: { url, method, body, description: rawDesc, header, auth },
      name: summary, tag = defaultTag, event: events, response
    } = element
    gParamsMeta = getParamsMeta(url, values, variable)
    const { path, query, protocol, host, port, valid } = scrapeURL(url)
    if (valid) {
      domains.add(calculateDomains(protocol, host, port))
      const joinedPath = calculatePath(path, pathDepth)
      if (!paths[joinedPath]) paths[joinedPath] = {}
      const { description, paramsMeta } = descriptionParse(rawDesc)
      paths[joinedPath][method.toLowerCase()] = {
        tags: [tag],
        summary,
        ...(description ? { description } : {}),
        ...parseBody(body, method),
        ...parseOperationAuth(auth, securitySchemes, optsAuth),
        ...parseParameters(query, header, joinedPath, paramsMeta),
        ...parseResponse(response, events, responseHeaders)
      }
    }
  }

  const openApi = {
    openapi: '3.0.0',
    info: compileInfo(postmanJson, info),
    ...parseExternalDocs(variable, externalDocs),
    ...parseServers(domains, servers),
    ...parseAuth(postmanJson, optsAuth, securitySchemes),
    ...parseTags(tags),
    paths
  }
  const openApiYml = dump(openApi, { skipInvalid: true })
  if (output != null) {
    await writeFile(output, openApiYml, 'utf8')
  }
  return openApiYml
}

/* Calculate the tags for folders items based on the options */
function calculateFolderTag ({ tag, name }, { separator = ' > ', concat = true }) {
  return (tag && concat) ? `${tag}${separator}${name}` : name
}

function compileInfo (postmanJson, optsInfo) {
  const { info: { name, description: desc }, variable = [] } = postmanJson
  const ver = getVarValue(variable, 'version', '1.0.0')
  const {
    title = name, description = desc, version = ver,
    termsOfService, license, contact, xLogo
  } = optsInfo
  return {
    title,
    description,
    version,
    ...parseXLogo(variable, xLogo),
    ...(termsOfService ? { termsOfService } : {}),
    ...parseContact(variable, contact),
    ...parseLicense(variable, license)
  }
}

function parseXLogo (variables, xLogo = {}) {
  const urlVar = getVarValue(variables, 'x-logo.urlVar')
  const backgroundColorVar = getVarValue(variables, 'x-logo.backgroundColorVar')
  const altTextVar = getVarValue(variables, 'x-logo.altTextVar')
  const hrefVar = getVarValue(variables, 'x-logo.hrefVar')
  const {
    url = urlVar, backgroundColor = backgroundColorVar,
    altText = altTextVar, href = hrefVar
  } = xLogo
  return (url != null) ? { 'x-logo': { url, backgroundColor, altText, href } } : {}
}

function parseLicense (variables, optsLicense = {}) {
  const nameVar = getVarValue(variables, 'license.name')
  const urlVar = getVarValue(variables, 'license.url')
  const { name = nameVar, url = urlVar } = optsLicense
  return (name != null) ? { license: { name, ...(url ? { url } : {}) } } : {}
}

function parseContact (variables, optsContact = {}) {
  const nameVar = getVarValue(variables, 'contact.name')
  const urlVar = getVarValue(variables, 'contact.url')
  const emailVar = getVarValue(variables, 'contact.email')
  const { name = nameVar, url = urlVar, email = emailVar } = optsContact
  return [name, url, email].some(e => e != null)
    ? {
        contact: {
          ...(name ? { name } : {}),
          ...(url ? { url } : {}),
          ...(email ? { email } : {})
        }
      }
    : {}
}

function parseExternalDocs (variables, optsExternalDocs) {
  const descriptionVar = getVarValue(variables, 'externalDocs.description')
  const urlVar = getVarValue(variables, 'externalDocs.url')
  const { description = descriptionVar, url = urlVar } = optsExternalDocs
  return (url != null) ? { externalDocs: { url, ...(description ? { description } : {}) } } : {}
}

function parseBody (body = {}, method) {
  // Swagger validation return an error if GET has body
  if (['GET', 'DELETE'].includes(method)) return {}
  const { mode, raw, options = { raw: { language: 'json' } } } = body
  let content = {}
  switch (mode) {
    case 'raw': {
      const { raw: { language } } = options
      if (language === 'json') {
        content = {
          'application/json': {
            schema: {
              type: 'object',
              example: raw ? JSON.parse(raw) : ''
            }
          }
        }
      } else {
        content = {
          'application/json': {
            schema: {
              type: 'string',
              example: raw
            }
          }
        }
      }
      break
    }
    case 'file':
      content = {
        'text/plain': {}
      }
      break
    case 'formdata':
      content = {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: body.formdata.reduce(mapFormData(), {})
          }
        }
      }
      break
    case 'urlencoded':
      content = {
        'application/x-www-form-urlencoded': {
          schema: {
            properties: body.urlencoded.reduce(mapFormData(), {})
          }
        }
      }
      break
  }
  return { requestBody: { content } }
}

/* Accumulator function for form data values */
function mapFormData () {
  return (obj, { key, type, description, value }) => {
    obj[key] = {
      type: inferType(value),
      ...(description ? { description: description.replace(/ ?\[required\] ?/gi, '') } : {}),
      ...(value ? { example: value } : {}),
      ...(type === 'file' ? { format: 'binary' } : {})
    }
    return obj
  }
}

/* Parse the Postman query and header and transform into OpenApi parameters */
function parseParameters (query = [], header, paths, paramsMeta = {}) {
  // parse Headers
  let parameters = header.reduce(mapParameters('header'), [])
  // parse Query
  parameters = query.reduce(mapParameters('query'), parameters)
  // Path params
  parameters.push(...extractPathParameters(paths, paramsMeta))
  return (parameters.length) ? { parameters } : {}
}

/* Accumulator function for different types of parameters */
function mapParameters (type) {
  return (parameters, { key, description, value }) => {
    const required = /\[required\]/gi.test(description)
    parameters.push({
      name: key,
      in: type,
      schema: { type: inferType(value) },
      ...(required ? { required } : {}),
      ...(description ? { description: description.replace(/ ?\[required\] ?/gi, '') } : {}),
      ...(value ? { example: value } : {})
    })
    return parameters
  }
}

function extractPathParameters (path, paramsMeta) {
  const matched = path.match(/{\s*[\w-]+\s*}/g) || []
  return matched.map(match => {
    const name = match.slice(1, -1)
    const { type = 'string', description, example } = paramsMeta[name] || {}
    return {
      name,
      in: 'path',
      schema: { type },
      required: true,
      ...(description ? { description } : {}),
      ...(example ? { example } : {})
    }
  }
  )
}

function getVarValue (variables, name, def = undefined) {
  const variable = variables.find(({ key }) => key === name)
  return variable ? variable.value : def
}

/* calculate the type of a variable based on OPenApi types */
function inferType (value) {
  if (/^\d+$/.test(value)) return 'integer'
  if (/-?\d+\.\d+/.test(value)) return 'number'
  if (/^(true|false)$/.test(value)) return 'boolean'
  return 'string'
}

/* Calculate the global auth based on options and postman definition */
function parseAuth ({ auth }, optAuth, securitySchemes) {
  if (optAuth != null) {
    return parseOptsAuth(optAuth)
  }
  return parsePostmanAuth(auth, securitySchemes)
}

/* Parse a postman auth definition */
function parsePostmanAuth (postmanAuth = {}, securitySchemes) {
  const { type } = postmanAuth
  if (type != null) {
    securitySchemes[`${type}Auth`] = {
      type: 'http',
      scheme: type
    }
    return {
      components: { securitySchemes },
      security: [{
        [`${type}Auth`]: []
      }]
    }
  }
  return (Object.keys(securitySchemes).length === 0) ? {} : { components: { securitySchemes } }
}

/* Parse Auth at operation/request level */
function parseOperationAuth (auth, securitySchemes, optsAuth) {
  if (auth == null || optsAuth != null) {
    // In case of config auth operation auth is disabled
    return {}
  } else {
    const { type } = auth
    securitySchemes[`${type}Auth`] = {
      type: 'http',
      scheme: type
    }
    return {
      security: [{ [`${type}Auth`]: [] }]
    }
  }
}

/* Parse a options global auth */
function parseOptsAuth (optAuth) {
  const securitySchemes = {}
  const security = []
  for (const [secName, secDefinition] of Object.entries(optAuth)) {
    const { type, scheme, ...rest } = secDefinition
    if (type === 'http' && ['bearer', 'basic'].includes(scheme)) {
      securitySchemes[secName] = {
        type: 'http',
        scheme,
        ...rest
      }
      security.push({ [secName]: [] })
    }
  }
  return Object.keys(securitySchemes).length === 0
    ? {}
    : {
        components: { securitySchemes },
        security
      }
}

/* From the path array compose the real path for OpenApi specs */
function calculatePath (paths = [], pathDepth) {
  paths = paths.slice(pathDepth) // path depth
  // replace repeated '{' and '}' chars
  return '/' + paths.map(path => path.replace(/([{}])\1+/g, '$1'))
    .join('/')
}

function calculateDomains (protocol, hosts, port) {
  return protocol + '://' + hosts.join('.') + (port ? `:${port}` : '')
}

/** Support for collection V2 */
function scrapeURL (url) {
  if (url === '' || url.raw === '') {
    return { valid: false }
  }
  if (typeof url === 'string' || url instanceof String) {
    const objUrl = new URL(url)
    return {
      raw: url,
      path: decodeURIComponent(objUrl.pathname).slice(1).split('/'),
      query: [],
      protocol: objUrl.protocol.slice(0, -1),
      host: decodeURIComponent(objUrl.hostname).split('.'),
      port: objUrl.port,
      valid: true
    }
  }
  return { ...url, valid: true }
}

/* Parse domains from operations or options */
function parseServers (domains, serversOpts) {
  let servers
  if (serversOpts != null) {
    // This map is just to filter not supported fields while no validations are implemented
    servers = serversOpts.map(({ url, description }) => ({ url, description }))
  } else {
    servers = Array.from(domains).map(domain => ({ url: domain }))
  }
  return (servers.length > 0) ? { servers } : {}
}

/* Transform a object of tags in an array of tags */
function parseTags (tagsObj) {
  const tags = Object.entries(tagsObj)
    .map(([name, description]) => ({ name, description }))
  return (tags.length > 0) ? { tags } : {}
}

function descriptionParse (description) {
  if (description == null) return { description }
  const splitDesc = description.split(/# postman-to-openapi/gi)
  if (splitDesc.length === 1) return { description }
  return {
    description: splitDesc[0].trim(),
    paramsMeta: parseMdTable(splitDesc[1])
  }
}

function parseResponse (responses, events, responseHeaders) {
  if (responses != null && Array.isArray(responses) && responses.length > 0) {
    return parseResponseFromExamples(responses, responseHeaders)
  } else {
    return { responses: parseResponseFromEvents(events) }
  }
}

function parseResponseFromEvents (events = []) {
  let status = 200
  const test = events.filter(event => event.listen === 'test')
  if (test.length > 0) {
    const script = test[0].script.exec.join()
    const result = script.match(/\.response\.code\)\.to\.eql\((\d{3})\)|\.to\.have\.status\((\d{3})\)/)
    status = (result && result[1] != null) ? result[1] : (result && result[2] != null ? result[2] : status)
  }
  return {
    [status]: {
      description: 'Successful response',
      content: {
        'application/json': {}
      }
    }
  }
}

function parseResponseFromExamples (responses, responseHeaders) {
  // Group responses by status code
  const statusCodeMap = responses
    .reduce((statusMap, { name, code, status: description, header, body, _postman_previewlanguage: language }) => {
      if (code in statusMap) {
        if (!(language in statusMap[code].bodies)) {
          statusMap[code].bodies[language] = []
        }
        statusMap[code].bodies[language].push({ name, body })
      } else {
        statusMap[code] = {
          description,
          header,
          bodies: { [language]: [{ name, body }] }
        }
      }
      return statusMap
    }, {})
  // Parse for OpenAPI
  const parsedResponses = Object.entries(statusCodeMap)
    .reduce((parsed, [status, { description, header, bodies }]) => {
      parsed[status] = {
        description,
        ...parseResponseHeaders(header, responseHeaders),
        ...parseContent(bodies)
      }
      return parsed
    }, {})
  return { responses: parsedResponses }
}

function parseContent (bodiesByLanguage) {
  const content = Object.entries(bodiesByLanguage)
    .reduce((content, [language, bodies]) => {
      if (language === 'json') {
        content['application/json'] = {
          schema: { type: 'object' },
          ...parseExamples(bodies, 'json')
        }
      } else {
        content['text/plain'] = {
          schema: { type: 'string' },
          ...parseExamples(bodies, 'text')
        }
      }
      return content
    }, {})
  return { content }
}

function parseExamples (bodies, language) {
  if (Array.isArray(bodies) && bodies.length > 1) {
    return {
      examples: bodies.reduce((ex, { name: summary, body }, i) => {
        ex[`example-${i}`] = {
          summary,
          value: (language === 'json') ? JSON.parse(body) : body
        }
        return ex
      }, {})
    }
  } else {
    return {
      example: (language === 'json') ? JSON.parse(bodies[0].body) : bodies[0].body
    }
  }
}

function parseResponseHeaders (headerArray, responseHeaders) {
  if (!responseHeaders) {
    return {}
  }
  const headers = headerArray.reduce((acc, { key, value }) => {
    acc[key] = {
      schema: {
        type: inferType(value),
        example: value
      }
    }
    return acc
  }, {})
  return (Object.keys(headers).length > 0) ? { headers } : {}
}

/* replace the calculatePath */
const oriCalculatePath = calculatePath
// eslint-disable-next-line no-func-assign
calculatePath = (paths = [], pathDepth) => {
  paths = replaceParameterPath(paths)
  return oriCalculatePath(paths, pathDepth)
}

/* replace the descriptionParse */
const oriDescriptionParse = descriptionParse
// eslint-disable-next-line no-func-assign
descriptionParse = (description) => {
  const oriDes = oriDescriptionParse(description)
  return { description: oriDes.description, paramsMeta: oriDes.paramsMeta || gParamsMeta }
}

postmanToOpenApi.version = version

module.exports = postmanToOpenApi
