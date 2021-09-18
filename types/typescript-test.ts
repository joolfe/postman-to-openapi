'use strict'

import postmanToOpenApi, {
    Options, ContactObject, LicenseObject, InfoObject,
    ServerObject, SecurityObject, ExternalDocsObject,
    FoldersOption, 
} from './index.d'

const contact:ContactObject = {
    name: 'My Enterprise',
    url: 'http://fancyEnterprise.com',
    email: 'support@myfancy.com'
}

const license:LicenseObject = {
    name: 'MIT',
    url: 'http://fancyEnterprise.com/mit'
}

const info:InfoObject = {
    title: 'Amazing API',
    description: 'The best API you can find out there',
    termsOfService: 'http://fancyEnterprise.com/tos',
    contact,
    license,
    version: '1.0.1'
}

const serverDev: ServerObject = {
    url: 'http://fancyEnterprise.com/dev',
    description: 'Development environment'
}

const serverPro: ServerObject = {
    url: 'http://fancyEnterprise.com/api',
    description: 'Live environment'
}

const basicAuth:SecurityObject = {
    type: 'http',
    description: 'Basic authentication using user and password',
    scheme: 'basic'
}

const bearerAuth:SecurityObject = {
    type: 'http',
    description: 'Bearer authentication',
    scheme: 'bearer', 
    bearerFormat: 'Signed JWT'
}

const externalDocs:ExternalDocsObject = {
    description: 'Fancy API documentation in detail',
    url: 'http://fancyEnterprise.com/dev'
}

const folders:FoldersOption = {
    concat: true,
    separator: '->'
}

const options:Options = {
    info,
    defaultTag: 'my Tag',
    pathDepth: 0,
    auth: {
        'basicAuth': basicAuth,
        'bearerAuth': bearerAuth
    },
    servers: [serverDev, serverPro],
    externalDocs,
    folders
};

const options2:Options = {
    info,
    defaultTag: 'my Tag',
    pathDepth: 0,
    auth: {
        'basicAuth': basicAuth,
        'bearerAuth': bearerAuth
    },
    servers: [serverDev, serverPro],
    externalDocs,
    folders,
    responseHeaders: false,
    replaceVars: false,
    additionalVars: {
        'key': 'value',
        'key2': 'value2'
    }
};

(async () => {

    const openAPI1 = postmanToOpenApi('./path/to/postman_collection.json')

    const openAPI2 = postmanToOpenApi('./path/to/postman_collection.json', './path/to/result/openApi.yml')

    const openAPI3 = postmanToOpenApi('./path/to/postman_collection.json', './path/to/result/openApi.yml', options)

    const openAPI4 = postmanToOpenApi('./path/to/postman_collection.json', './path/to/result/openApi.yml', options2)

})();
