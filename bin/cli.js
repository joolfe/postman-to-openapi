#!/usr/bin/env node

const { program } = require('commander')
const { version } = require('../package.json')
const postmanToOpenApi = require('../lib')
const { promises: { readFile } } = require('fs')

const additionalHelp = `

Example calls:
  $ p2o ./path/to/PostmantoCollection.json -f ./path/to/result.yml -o ./path/to/options.json

For more info about how to use it visit our documentation in <https://joolfe.github.io/postman-to-openapi/>
`

program
  .version(version, '-v, --vers', 'Output the current version of the library.')
  .name('p2o')
  .usage('<collection> [options]')
  .addHelpText('after', additionalHelp)
  .arguments('<collection>')
  .description('Transform a postman collection to OpenAPI specification yml.', {
    collection: 'Relative path to the Postman collection json file'
  })
  .option('-f, --file <file>', 'Relative path to the file where result will be saved. If empty result will be returned by cli.')
  .option('-o, --options <options>', 'Relative path to json file that contain the optional parameters for the transformation.')
  .action(async (collection, { file, options }, command) => {
    try {
      const parsedOptions = await parseOptions(options)
      const result = await postmanToOpenApi(collection, file, parsedOptions)
      console.info(result)
    } catch (err) {
      throw new Error(err)
    }
  })

program
  .parseAsync()
  .catch(err => {
    process.exitCode = 1
    console.error(err.message)
  })

async function parseOptions (optionsPath) {
  try {
    return optionsPath ? JSON.parse(await readFile(optionsPath)) : {}
  } catch (err) {
    throw new Error(`invalid "options" parameter -> ${err.message}`)
  }
}
