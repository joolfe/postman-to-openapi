const yargs = require('yargs')
const { readFileSync } = require('fs')
const postmanToOpenApi = require('../lib')

// TODO
// - handle error in a homogeneous way
// - add example usage
// - add test for all code here (less cli i think....)
// - check the input field or should be test inside library?
// - silent option to not return in console the result if we have the file...

const parser = yargs
  .scriptName('p2o')
  .command('$0 <collection> [options]',
    'Convert a Postman collection (json) to OpenAPI spec (yml)',
    (yargs) => {
      yargs
        .positional('collection', {
          demandOption: true,
          desc: 'Path to the Postman collection json file',
          type: 'string'
        })
        .options('o', {
          alias: 'output',
          desc: 'Path to the file where OpenAPI should be saved. If not provided result will be printed in console',
          type: 'string'
        })
        .options('p', {
          alias: 'params',
          desc: 'Path to the Options json file with config parameters',
          type: 'string'
        })
        .epilog('for more information, find our docs at https://joolfe.github.io/postman-to-openapi/')
    },
    async ({ collection, output, options }) => {
      console.log('Command run')
      const result = await postmanToOpenApi(collection, output, options)
      console.log(result)
    })
  .middleware((argv) => {
    if (argv.params) {
      argv.options = JSON.parse(readFileSync(argv.params))
    }
  })
  .showHelpOnFail(false, 'Specify --help for available options')
  .fail(function (msg, err, yargs) {
    console.error('You broke it!')
    console.error(msg)
    process.exit(1)
  })
  .help('h')
  .alias('h', 'help')

module.exports = parser

// p2o ./test/resources/input/v2/SimplePost.json -p ./test/resources/options/info.json
