![logo](./docs/assets/img/logo.png)

# [postman-to-openapi](https://joolfe.github.io/postman-to-openapi/)

🛸 Convert postman collection to OpenAPI specification.

Or in other words, transform [this specification](https://schema.getpostman.com/json/collection/v2.1.0/collection.json) to [this one](https://swagger.io/specification/)

[![build](https://github.com/joolfe/postman-to-openapi/workflows/Node.js%20CI/badge.svg)](https://github.com/joolfe/postman-to-openapi/actions)
[![codecov](https://codecov.io/gh/joolfe/postman-to-openapi/branch/master/graph/badge.svg)](https://codecov.io/gh/joolfe/postman-to-openapi)
[![npm version](https://img.shields.io/npm/v/postman-to-openapi
)](https://www.npmjs.com/package/postman-to-openapi)
[![dcos](https://img.shields.io/badge/docs-here-yellow)](https://joolfe.github.io/postman-to-openapi/)

## Documentation

All features, usage instructions and help can be found in the [Documentation page](https://joolfe.github.io/postman-to-openapi/)

## Development

This project use for development:

- Node.js v10.15.3 or higher
- [Standard JS](https://standardjs.com/) rules to maintain clean code.
- Use [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.
- Test with [mocha.js](https://mochajs.org/).

Use the scripts in `package.json`:

- `test:unit`: Run mocha unit test.
- `test`: Execute `test:lint` plus code coverage.
- `lint`: Execute standard lint to review errors in code.
- `lint:fix`: Execute standard lint and automatically fix errors.
- `changelog`: Update changelog automatically.

[Husky](https://www.npmjs.com/package/husky) is configured to avoid push incorrect content to git.

## Tags

`Nodejs` `Javascript` `OpenAPI` `Postman` `Newman` `Collection` `Transform` `Convert`

## License

See the [LICENSE](LICENSE.txt) file.