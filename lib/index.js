'use strict'

const { promises: { writeFile, readFile } } = require('fs')
const { safeDump } = require('js-yaml')

async function postmanToOpenApi (input, output, { info = {}, defaultTag = 'default', auth, servers } = {}) {
  // TODO validate?
  const collectionFile = await readFile(input)
  const postmanJson = JSON.parse(collectionFile)
  const { item: items } = postmanJson
  const paths = {}
  const domains = new Set()

  for (let [i, element] of items.entries()) {
    const { item, name } = element
    if (item != null) { // is a folder
      const tagged = item.map(e => ({ ...e, tag: name }))
      items.splice(i, 1, ...tagged)
      element = tagged.shift()
    }
    const {
      request: { url: { path, query, protocol, host }, method, body, description, header },
      name: summary, tag = defaultTag
    } = element
    domains.add(calculateDomains(protocol, host))
    const joinedPath = calculatePath(path)
    if (!paths[joinedPath]) paths[joinedPath] = {}
    paths[joinedPath][method.toLowerCase()] = {
      tags: [tag],
      summary,
      ...(description ? { description } : {}),
      ...parseBody(body, method),
      ...parseParameters(query, header, joinedPath),
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
    ...parseServers(domains, servers),
    ...parseAuth(postmanJson, auth),
    paths
  }

  const openApiYml = safeDump(openApi)
  if (output != null) {
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
  const { mode, raw, options } = body
  let content = {}
  switch (mode) {
    case 'raw': {
      const { raw: { language } } = options
      if (language === 'json') {
        content = {
          'application/json': {
            schema: {
              type: 'object',
              example: JSON.parse(raw)
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
  }
  return { requestBody: { content } }
}

/* Parse the Postman query and header and transform into OpenApi parameters */
function parseParameters (query = [], header, paths) {
  // parse Headers
  let parameters = header.reduce(mapParameters('header'), [])
  // parse Query
  parameters = query.reduce(mapParameters('query'), parameters)
  // Path params
  parameters.push(...extractPathParameters(paths))
  return (parameters.length) ? { parameters } : {}
}

/* Accumulator function for different types of parameters */
function mapParameters (type) {
  return (parameters, { key, description, value }) => {
    parameters.push({
      name: key,
      in: type,
      schema: { type: inferType(value) },
      ...(description ? { description } : {}),
      ...(value ? { example: value } : {})
    })
    return parameters
  }
}

function extractPathParameters (path) {
  const matched = path.match(/{\s*[\w]+\s*}/g) || []
  return matched.map(match => ({
    name: match.slice(1, -1),
    in: 'path',
    schema: { type: 'string' },
    required: true
  }))
}

function getVarValue (variables, name, def) {
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
function parseAuth ({ auth }, optAuth) {
  if (optAuth != null) {
    return parseOptsAuth(optAuth)
  }
  return parsePostmanAuth(auth)
}

/* Parse a postman auth definition */
function parsePostmanAuth (postmanAuth = {}) {
  const { type } = postmanAuth
  return (type != null) ? {
    components: {
      securitySchemes: {
        [type + 'Auth']: {
          type: 'http',
          scheme: type
        }
      }
    },
    security: [{
      [type + 'Auth']: []
    }]
  } : {}
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
  return {
    components: { securitySchemes },
    security
  }
}

/* From the path array compose the real path for OpenApi specs */
function calculatePath (paths) {
  // replace repeated '{' and '}' chars
  return '/' + paths.map(path => path.replace(/([{}])\1+/g, '$1'))
    .join('/')
}

function calculateDomains (protocol, hosts) {
  return protocol + '://' + hosts.join('.')
}

/* Parse domains from operations or options */
function parseServers (domains, serversOpts) {
  let servers
  if (serversOpts != null) {
    servers = serversOpts.map(({ url, description }) => ({ url, description }))
  } else {
    servers = Array.from(domains).map(domain => ({ url: domain }))
  }
  return (servers.length > 0) ? { servers } : {}
}

module.exports = postmanToOpenApi
