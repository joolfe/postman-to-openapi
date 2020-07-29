<div class="tilted-section"><div markdown="1">

# Postman collection to OpenAPI specs

🛸 Convert postman collection to OpenAPI specification, or in other words, transform [this specification](https://schema.getpostman.com/json/collection/v2.1.0/collection.json) to [this one](https://swagger.io/specification/)

[![build](https://github.com/joolfe/postman-to-openapi/workflows/Node.js%20CI/badge.svg)](https://github.com/joolfe/postman-to-openapi/actions)
[![codecov](https://codecov.io/gh/joolfe/postman-to-openapi/branch/master/graph/badge.svg)](https://codecov.io/gh/joolfe/postman-to-openapi)

## Features

- Postman Collection v2.1
- OpenApi 3.0
- Basic method conversion (GET, POST, PUT...)
- Customize general API information.
- Extract the api version from a collection general `variable`.
- Transform query, headers and path parameters.
- Postman variables in as Path parameters.
- Automatic infer types from query and headers parameters.
- Support Json and Text body formats.
- Global Authentication and Authorization parse (Basic and Bearer).
- Global Authentication and Authorization by configuration.
- Support Postman folders as tags.

</div></div>
<div class="tilted-section"><div markdown="1">

# Install

```
npm i postman-to-openapi --save
```

To use as a cli coming soon...

</div></div>
<div class="tilted-section"><div markdown="1">

# Usage

Use the library is as easy as use a single method `async postmanToOpenApi(inputPath, outputPath, options)`, the parameters are:

| Param | Description |
|-|-|
| `inputPath` | String. Path of the Postman collection file. |
| `outputPath` | String. Path of the output file where the OpenAPi will be stored. |
| `options` | Object. Optional configuration, see [options](#Options) section for a detailed description.|

An example of usage:

```
const postmanToOpenApi = require('postman-to-openapi')

const postmanCollection = './path/to/postman/collection.json'
const outputFile = './api/collection.yml'

// Async/await
try {
    const result = await postmanToOpenApi(postmanCollection, outputFile, { save: true })
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

</div></div>
<div class="tilted-section"><div markdown="1">

# Features

</div></div>
<div class="tilted-section"><div markdown="1">

# Postman collections

</div></div>