<div class="tilted-section"><div markdown="1">

# Postman collection to OpenAPI specs

🛸 Convert postman collection to OpenAPI specification, or in other words, transform [this specification](https://schema.getpostman.com/json/collection/v2.1.0/collection.json) to [this one](https://swagger.io/specification/)

[![build](https://github.com/joolfe/postman-to-openapi/workflows/Node.js%20CI/badge.svg)](https://github.com/joolfe/postman-to-openapi/actions)
[![codecov](https://codecov.io/gh/joolfe/postman-to-openapi/branch/master/graph/badge.svg)](https://codecov.io/gh/joolfe/postman-to-openapi)
[![npm version](https://badge.fury.io/js/postman-to-openapi.svg)](https://www.npmjs.com/package/postman-to-openapi)

## Features at a glance

- Postman Collection v2.1
- OpenApi 3.0
- Basic info API from Postman info or customizable.
- Basic method conversion (GET, POST, PUT...).
- Support Postman folders as tags.
- Transform query, headers and path parameters.
- Postman variables as Path parameters.
- Automatic infer types from query and headers parameters.
- Support Json and Text body formats.
- Global Authorization parse or by configuration (Basic and Bearer).

See [Features](#features) section for more details about how to use each of this features.

</div></div>
<div class="tilted-section"><div markdown="1">

# Install

```bash
npm i postman-to-openapi --save
```

To use as a cli coming soon...

</div></div>
<div class="tilted-section"><div markdown="1">

# Usage

Use the library is as easy as use a single method `async postmanToOpenApi(inputPath, outputPath, options)`, the parameters are:

| Param        | Description                                                                                 |
|--------------|---------------------------------------------------------------------------------------------|
| `inputPath`  | String. Path of the Postman collection file.                                                |
| `outputPath` | String. Path of the output file where the OpenAPi will be stored. This param is optional if not provided (`undefined` or `null`) no file will be saved. |
| `options`    | Object. Optional configuration, see [options](#options) section for a detailed description. |

The method return a promise string that contain the yml OpenAPI specification, only is saved to a file if the `outputPath` parameter is provided.

An example of usage:

```js
const postmanToOpenApi = require('postman-to-openapi')

const postmanCollection = './path/to/postman/collection.json'
const outputFile = './api/collection.yml'

// Async/await
try {
    const result = await postmanToOpenApi(postmanCollection, outputFile, { save: true })
    // Without save the result in a file
    const result2 = await postmanToOpenApi(postmanCollection, null, { save: true })
    console.log(`OpenAPI specs: ${result}`)
} catch (err) {
    console.log(err)
}

// Promise callback style
postmanToOpenApi(postmanCollection, outputFile, { save: true })
    .then(result => {
        console.log(`OpenAPI specs: ${result}`)
    })
    .catch(err => {
        console.log(err)
    })
```

## Options

The third parameter used in the library method is an `options` object containing the optional parameters for the transformation, the allowed parameters are:

### info (Object)

The basic information of the API is obtained from Postman collection as described in section [default info](#basic-api-info), but you can customize this parameters using the `info` options that can contain the next parameters:

| Param            | Description                                                                        |
|------------------|------------------------------------------------------------------------------------|
| `title`          | String. The title of the API.                                                      |
| `version`        | String. The version of the OpenAPI document.                                       |
| `description`    | String. A short description of the API.                                            |
| `termsOfService` | String. A URL to the Terms of Service for the API. MUST be in the format of a URL. |

Basically this are the required and relevant parameters defined in OpenAPI spec [info object](https://swagger.io/specification/#info-object), an example of the option will be:

```js
{
    info: {
        title: 'Options title',
        version: '6.0.7-beta',
        description: 'Description from options',
        termsOfService: 'http://tos.myweb.com'
    }
}
```

### defaultTag (String)

By default the [tag value](https://swagger.io/specification/#tag-object) "default" is added to all the operations during transformation, unless this operations are inside a folder as described in section [folder as tags](#folders-as-tags).

If you want to customize the default tag use the options `defaultTag` to indicate the desired value.

```js
const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'API' })
```

### auth (Object)

The global authorization info can be parse from the Postman collection as described in [Global authorization](#global-authorization) section, but you can customize this info using the `auth` option, this param is a Object that follow the structure of OpenAPI [Security Scheme](https://swagger.io/specification/#security-scheme-object), in this moment only type `http` is supported and schemes `basic` and `bearer`, as an example of this option:

```js
{
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
    }
}
```

### servers (Array)

The global servers list can be parse from the Postman collection as described in [Global servers configuration](#global-servers-configuration) section, but you can customize this info using the `servers` option, this param is an array of objects that follow the structure of OpenAPI [Server Objects](https://swagger.io/specification/#server-object), only `url` and `description` field are supported in this moment, as an example of how to use this option:

```js
{
    servers: [
    {
        url: 'https://awesome.api.sandbox.io',
        description: 'Sandbox environment server'
    },
    {
        url: 'https://awesome.api.io',
        description: 'Production environment server'
    }
    ]
}
```

</div></div>
<div class="tilted-section"><div markdown="1">

# Features

## Basic conversion

This library support the transformation from Postman collection to all the basic HTTP method as GET, POST, PUT... and also parse the body request of type raw `Json` or `Text` type. [Query parameters](#parameters-parsing) are also supported.

Have a look to the [PostmantoOpenAPI collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/PostmantoOpenAPI.json) file for an example of how to use this feature.

## Basic API info

For fill the OpenAPI [info object](https://swagger.io/specification/#info-object) this library use the information defined in Postman [collection](https://learning.postman.com/docs/sending-requests/intro-to-collections/#creating-collections) level as "name" and "description".

Postman don't have any field at collection level that feat with OpenAPI "version" field (is a required field in OpenAPI specification), so this library look for a variable with name `version` in Postman [collection variables](https://learning.postman.com/docs/sending-requests/variables/#defining-collection-variables) or if variable is not defined then will use the default value `1.0.0`.

You can customize all this information with the [Info option](#info-(object)).

Have a look to the [SimplePost collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/SimplePost.json) file for an example of how to use this feature.

## Folders as tags

In postman you can add [folders](https://learning.postman.com/docs/sending-requests/intro-to-collections/) inside your collection to group requests and keep the collection clean, in OpenAPI there are no folders but exist the concept of [tags](https://swagger.io/specification/#tag-object) that has the same approximate meaning, this library automatically detect folders and use the name of the folder as tag name in the transformation. Right now is not possible to have more than one tag value for each operation.

Have a look to the [FolderCollection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/FolderCollection.json) file for an example of how to use this feature.

## Parameters parsing

This library automatically transform query and headers parameters from Postman operations tp OpenAPI specification, the populated info is the name, description and use the value of the parameter as an example.

The default schema used for parameters is `string` but the library try to infer the type of the parameters based on the value using regular expressions, the detected types are `integer`, `number`, `boolean` and `string`, if you find any problem in the inference process please open an issue.

Path parameters are also automatically detected, this library look for [Postman variables](https://learning.postman.com/docs/sending-requests/variables/) in the url as `{{variable}}` and transform to a single curly brace expression as `{variable}` as supported by OpenAPI, also create the parameter definition using the variable name.

Have a look to the [GetMethods collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/GetMethods.json), [Headers collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/Headers.json) and [PathParams collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/PathParams.json) files for examples of how to use this features.

## Global authorization

The OpenAPI root [security]https://swagger.io/specification/#openapi-object) definition is filled using the authorization method defined at Postman Collection [authorization config](https://learning.postman.com/docs/sending-requests/authorization/#inheriting-auth).

Only types 'Basic Auth' and 'Bearer Token' are supported now and not operation individual definition is supported.

You can customize the global authorization definition using the [Auth option](#auth-(object)).

Have a look to the collections [AuthBasic](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/AuthBasic.json) and [AuthBearer](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/AuthBearer.json) for examples of how to use this feature.

## Global servers configuration

The OpenAPI root [servers](https://swagger.io/specification/#openapi-object) definition is filled parsing the urls used in the Postman collections requests, the library use all the different urls for create an array of server (removing duplicated), but normally this is not to usefully as Postman collection only will have one environment url, for this reason you can customize the global servers definition using the [server option](#servers-(array))

If you don't want to include a `servers` array in your OpenAPI spec file you just need to pass an empty array as server option, as for example:

```js
const result = await postmanToOpenApi(postmanCollection, outputFile, { servers: [] })
```

This will remove the `servers` field from the yml specification result.

</div></div>
<div class="tilted-section"><div markdown="1">

# Postman collection examples

</div></div>