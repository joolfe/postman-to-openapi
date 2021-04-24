'use strict'

const { Command, CommanderError } = require('commander')
const { version } = require('../package.json')
const postmanToOpenApi = require('../lib')

/*
const { readFileSync } = require('fs')
*/

// TODO
// - usage move options after collection
// - output should be an option better than an arguments?
// - how to pass options
// - error when colletcion doesnt exist
// - r
// - handle error in a homogeneous way
// - add example usage
// - check the input field or should be test inside library?
// - Add some debug or is not needed?

// Requeriments
// - input file
// - output file or if not just return to can pipe the command?? have think about this.

const program = new Command()

program
  .version(version, '-v, --vers', 'output the current version')
  .name('p2o')
  .usage('<collection> [options]')
  .arguments('<collection>')
  .description('Transform postman collection to OpenAPI', {
    collection: 'Relative path to the Postman collection json file'
  })
  .option('-f, --file <file>', 'Relative path to the file where result will be saved. If empty result will be returned by cli.')
  .option('-o, --options <option>', 'Options object containing the optional parameters for the transformation')
  .action(async (collection, options, command) => {
    try {
      console.log(collection)
      const result = await postmanToOpenApi(collection, null, {})
      console.info(result)
    } catch (err) {
      // TODO normalize errors here
      throw new Error(err)
    }
  })

module.exports = program

/*
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
*/

// p2o ./test/resources/input/v2/SimplePost.json -p ./test/resources/options/info.json
