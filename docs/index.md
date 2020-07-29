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

```
const postmanToOpenApi = require('postman-to-openapi')

const result = await postmanToOpenApi('./path/to/postman/collection.json', './api/collection.yml', { save: true })
```

## Options

</div></div>
<div class="tilted-section"><div markdown="1">

# Features

</div></div>
<div class="tilted-section"><div markdown="1">

# Postman collections

</div></div>