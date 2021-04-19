<div class="tilted-section"><div markdown="1">

# Postman collection to OpenAPI specs

🛸 Convert Postman Collection v2.1 and v2.0 to OpenAPI v3.0, or in other words, transform [this specification](https://schema.getpostman.com/json/collection/v2.1.0/collection.json) and also [this one](https://schema.getpostman.com/json/collection/v2.0.0/collection.json) to [this one](http://spec.openapis.org/oas/v3.0.3.html)

[![build](https://github.com/joolfe/postman-to-openapi/workflows/Build/badge.svg)](https://github.com/joolfe/postman-to-openapi/actions)
[![codecov](https://codecov.io/gh/joolfe/postman-to-openapi/branch/master/graph/badge.svg)](https://codecov.io/gh/joolfe/postman-to-openapi)
[![npm version](https://badge.fury.io/js/postman-to-openapi.svg)](https://www.npmjs.com/package/postman-to-openapi)

## Index

* TOC
{:toc}

## Features at a glance

- Postman Collection v2.1 and v2.0.
- OpenApi 3.0
- Basic info API from Postman info or customizable.
- Basic method conversion (GET, POST, PUT...).
- Support Postman folders as tags.
- Transform query, headers and path parameters (description, required...).
- Postman variables as Path parameters.
- Automatic infer types from query and headers parameters.
- Support Json and Text body formats.
- Global Authorization parse or by configuration (Basic and Bearer).
- Contact and License from variables or by configuration.
- Provide meta-information as a markdown table.
- Path depth configuration.
- Response status code parse from test.

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
    const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' })
    // Without save the result in a file
    const result2 = await postmanToOpenApi(postmanCollection, null, { defaultTag: 'General' })
    console.log(`OpenAPI specs: ${result}`)
} catch (err) {
    console.log(err)
}

// Promise callback style
postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' })
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
| `title`          | String. The title of the API. |
| `version`        | String. The version of the OpenAPI document. |
| `description`    | String. A short description of the API.                                            |
| `termsOfService` | String. A URL to the Terms of Service for the API. MUST be in the format of a URL. |
| `contact`        | Object. The contact information for the exposed API. See details in [License and Contact configuration](#license-and-contact-configuration) section.                             |
| `license`        | Object. The license information for the exposed API.See details in [License and Contact configuration](#license-and-contact-configuration) section. |

Basically this are the required and relevant parameters defined in OpenAPI spec [info object](http://spec.openapis.org/oas/v3.0.3.html#info-object), an example of the option will be:

```js
{
    info: {
        title: 'Options title',
        version: '6.0.7-beta',
        description: 'Description from options',
        termsOfService: 'http://tos.myweb.com',
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
}
```

### defaultTag (String)

By default the [tag value](http://spec.openapis.org/oas/v3.0.3.html#tag-object) "default" is added to all the operations during transformation, unless this operations are inside a folder as described in section [folder as tags](#folders-as-tags).

If you want to customize the default tag use the options `defaultTag` to indicate the desired value.

```js
const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'API' })
```

### pathDepth (number)

Sometimes the URL of an API depends of environments prefix or accounts id that are not part of the resource path, as for example `http://api.io/dev/users`, `http://api.io/acc/235647467/users` or `http://api.io/v2/users`, by default this will results in Paths as `/dev/users`, `/acc/235647467/users` and `/v2/users`.

To indicate the library that you want to avoid this prefixes to be part of the OpenAPI operation path you can use the `pathDepth` option, this option is a integer value that indicates how many paths/prefixs should be jump in the parse from the domain, as an example:

```js
// Having a postman request with the url "http://api.io/dev/users"
const result = await postmanToOpenApi(postmanCollection, outputFile, { pathDepth: 1 })
// Will result in a path of "/users"
const result = await postmanToOpenApi(postmanCollection, outputFile, { pathDepth: 0 })
// Will result in a path of "/dev/users"
```

The default value is `0`, so all prefix will be added to Open APi operations Paths.

### auth (Object)

The global authorization info can be parse from the Postman collection as described in [Global authorization](#global-authorization) section, but you can customize this info using the `auth` option, this param is a Object that follow the structure of OpenAPI [Security Scheme](http://spec.openapis.org/oas/v3.0.3.html#security-scheme-object), in this moment only type `http` is supported and schemes `basic` and `bearer`, as an example of this option:

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

The global servers list can be parse from the Postman collection as described in [Global servers configuration](#global-servers-configuration) section, but you can customize this info using the `servers` option, this param is an array of objects that follow the structure of OpenAPI [Server Objects](http://spec.openapis.org/oas/v3.0.3.html#server-object), only `url` and `description` field are supported in this moment, as an example of how to use this option:

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

### externalDocs (Object)

The info about the API external documentation, as described in OpenAPI spec [External Docs Object](https://swagger.io/specification/#external-documentation-object), as an example of how to use this option:

```js
{
    externalDocs: {
        url: 'https://docs.example.com',
        description: 'Find more info here or there'
    }
}
```

This info can be provided as collection variables in the same way as described in section [License and Contact configuration](#license-and-contact-configuration), you can setup the variables `externalDocs.url` and `externalDocs.description` for provide the information.

### folders (Object)

This library support the use of folders and nested folders as OpenAPI `tags`, see [Folders as tags](#folders-as-tags) section for more info, with this options you can configure the behavior of the tags calculation when there exist multiple level of folders in the Postman collection, the fields inside `folders` object are:

| Param            | Description                    |
|------------------|--------------------------------|
| `concat`         | Boolean. Indicated if in case of multiple levels of folders the tag used in the request is a concatenation of the folders name. Default value `true`. |
| `separator`      | String. Separator used to concatenate the names of the different folders. Default value ` > ` |

If we have a Postman collection with an structure as:

```txt
|- Domestic Payments (folder)
    |- Consent (folder)
        |- request 1
    |- request 2
|- Scheduled payments (folder)
    |- Consent (folder)
        |- request 3
    |- request 4
```

The tags for each request would be:

| Request   | Default config                 | Custom separator             | Avoid concatenation  |
|-----------|--------------------------------|------------------------------|----------------------|
| request 1 | `Domestic Payments > Consent`  | `Domestic Payments-Consent`  | `Consent`            |
| request 2 | `Domestic Payments`            | `Domestic Payments`          | `Domestic Payments`  |
| request 3 | `Scheduled payments > Consent` | `Scheduled payments-Consent` | `Consent`            |
| request 4 | `Scheduled payments`           | `Scheduled payments`         | `Scheduled payments` |

Default config:

```js
{
    concat = true,
    separator = ' > '
}
```

Custom separator:

```js
{
    separator = '-'
}
```

Avoid concatenation

```js
{
    concat = false
}
```

</div></div>
<div class="tilted-section"><div markdown="1">

# Features

## Basic conversion

This library support the transformation from Postman collection to all the basic HTTP method as GET, POST, PUT... and also parse the body request of type raw `Json` or `Text` type. [Query parameters](#parameters-parsing) are also supported.

Have a look to the [PostmantoOpenAPI collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/PostmantoOpenAPI.json) file for an example of how to use this feature.

## Basic API info

For fill the OpenAPI [info object](http://spec.openapis.org/oas/v3.0.3.html#info-object) this library use the information defined in Postman [collection](https://learning.postman.com/docs/sending-requests/intro-to-collections/#creating-collections) level as "name" and "description".

Postman don't have any field at collection level that feat with OpenAPI "version" field (is a required field in OpenAPI specification), so this library look for a variable with name `version` in Postman [collection variables](https://learning.postman.com/docs/sending-requests/variables/#defining-collection-variables) or if variable is not defined then will use the default value `1.0.0`.

You can customize all this information with the [Info option](#info-(object)).

For info about how to setup the `contact` and `license` properties have a look to section [License and Contact configuration](#license-and-contact-configuration).

Have a look to the [SimplePost collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/v21/SimplePost.json) file for an example of how to use this feature.

## Folders as tags

In postman you can add [folders](https://learning.postman.com/docs/sending-requests/intro-to-collections/) inside your collection to group requests and keep the collection clean, in OpenAPI there are no folders but exist the concept of [tags](http://spec.openapis.org/oas/v3.0.3.html#tag-object) that has the same approximate meaning, this library automatically detect folders and use the name of the folder as tag name in the transformation.

If you have more than one level of folders you can configure the behavior to calculate the tag of the request, See option [folders](#folders-object) for more info about how to configure this feature and some examples.

As part of the implementation we now support `description` for [tags](http://spec.openapis.org/oas/v3.0.3.html#tag-object), just add a description into the Postman Collection folder and automatically the `tags` section will be filled in the he OpenApi spec.

Have a look to the [FolderCollection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/FolderCollection.json) file for an example of how to use this feature.

## Parameters parsing

This library automatically transform query and headers parameters from Postman operations tp OpenAPI specification, the populated info is the name, description and use the value of the parameter as an example.

The default schema used for parameters is `string` but the library try to infer the type of the parameters based on the value using regular expressions, the detected types are `integer`, `number`, `boolean` and `string`, if you find any problem in the inference process please open an issue.

Path parameters are also automatically detected, this library look for [Postman variables](https://learning.postman.com/docs/sending-requests/variables/) in the url as `{{{variable}}}` and transform to a single curly brace expression as `{variable}` as supported by OpenAPI, also create the parameter definition using the variable name. To provide additional information about a path parameter you can [Pass Meta-information as markdown](#pass-meta-information-as-markdown).

For headers and query fields you can indicate that this parameter is mandatory/required adding into the description the literal `[required]`. The library use a case insensitive regexp so all variations are supported (`[REQUIRED]`, `[Required]`...) and never mind the location inside the description (at the beginning, at the end...).

Have a look to the [GetMethods collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/GetMethods.json), [Headers collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/Headers.json) and [PathParams collection](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/PathParams.json) files for examples of how to use this features.

## Global authorization

The OpenAPI root [security](http://spec.openapis.org/oas/v3.0.3.html#openapi-object) definition is filled using the authorization method defined at Postman Collection [authorization config](https://learning.postman.com/docs/sending-requests/authorization/#inheriting-auth).

Only types 'Basic Auth' and 'Bearer Token' are supported now and not operation individual definition is supported.

You can customize the global authorization definition using the [Auth option](#auth-(object)).

Have a look to the collections [AuthBasic](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/AuthBasic.json) and [AuthBearer](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/AuthBearer.json) for examples of how to use this feature.

## Global servers configuration

The OpenAPI root [servers](http://spec.openapis.org/oas/v3.0.3.html#openapi-object) definition is filled parsing the urls used in the Postman collections requests, the library use all the different urls for create an array of server (removing duplicated), but normally this is not to usefully as Postman collection only will have one environment url, for this reason you can customize the global servers definition using the [server option](#servers-array)

If you don't want to include a `servers` array in your OpenAPI spec file you just need to pass an empty array as server option, as for example:

```js
const result = await postmanToOpenApi(postmanCollection, outputFile, { servers: [] })
```

This will remove the `servers` field from the yml specification result.

## License and Contact configuration

Inside the [info object](http://spec.openapis.org/oas/v3.0.3.html#info-object) of OpenAPI definition exist two Object fields called `contact` and `license`, this fields are very useful for provide information to developers, but inside a Postman collection not exist any "standard" way to save this information, for this reason we use [Postman collection variables](https://learning.postman.com/docs/sending-requests/variables/) to define this options.

Is as easy as define the values in the "Edit Collection" form page inside the tab "Variables", as showed in the next image:

![contact and license variables](images/variables.png)

The variables names will be in dot notation, for example for `contact` fields will be as `contact.name`, `contact.url`... Take into account that fields that are required by OpenAPI specs, as `contact.name`, if not provided then all the section will be ignored.

You can also customize this information using the [Info option](#info-(object)), note that info provided by options will overwrite the variables inside the Postman collection (has more priority) but values will be merged from both sources (postman variables and options).

## Pass Meta-information as markdown

As Postman don't provide a free way to pass meta information in all the sections, for example you cannot describe a Path parameter in Postman, the easy way we have found is to provide this information in the `options` parameter when calling the library, although this solution is not a bad solution, and give lot of freedom about where you store the info, we think that have all the info about the API in the Postman Collection is the best solution as you only have a source of information for document your APIs.

That's the reason why API `version` can be defined as a postman collection variable, as described in [Basic API Info](#basic-api-info) section, but for some other information as for example describing a Path parameter where you should indicate multiples values as the description, if it is required, an example, schema type.... the solution of use collection variables don't fit too well, for this reason we have add support for provide Meta-Information as a markdown table.

Taking advantage that Postman support markdown in description fields we have defined a especial section delimited with a md header `# postman-to-openapi`, where you can define a markdown table for provide Meta-Information. As an example:

```markdown
# postman-to-openapi

| object | name     | description                    | required | type   | example   |
|--------|----------|--------------------------------|----------|--------|-----------|
| path   | user_id  | This is just a user identifier | true     | number | 476587598 |
| path   | group_id | Group of the user              | true     | string | RETAIL    |
```

This table is providing additional information about a Path parameter, the supported field in this moment are the column thats appear in the example. This way of provide Meta-information is supported in the Postman request description in this moment.

Take into account that `postman-to-openapi` remove from the description all the content after the key header `# postman-to-openapi`, so the meta-information table should be the last content of the description field.

Have a look to the collections [PathParams](https://github.com/joolfe/postman-to-openapi/blob/master/test/resources/input/v21/PathParams.json) for examples of how to use this feature.

## Response status code parse from Test

By default the library use the value `200` as the response status code in all the operations, but this can be customize from Postman test "Test" script, if you operation contain a status check in the tests tab as:

```js
pm.response.to.have.status(201)
// or
pm.expect(pm.response.code).to.eql(202)
```

The status code will be automatically parsed and used in the OpenAPI specification.

</div></div>
<div class="tilted-section"><div markdown="1">

# Postman collection examples

All the featured described in this doc are unit tested using real postman collections files as examples, we encourage you to use this collections files as an example of your own implementation.

You can found the examples collections inside the github repo in [postman-to-openapi/test/resources/input/](https://github.com/joolfe/postman-to-openapi/tree/master/test/resources/input) folder, names of the files are self-descriptive.

</div></div>
