#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const postmanToOpenApi = require('../lib/index');
const fs = require('fs');

const args = yargs(hideBin(process.argv))
  .usage('$0 output', 'Convert the input file, usually json, ' +
    'with Postman collections to OpenAPI by applying the given options file, also json, ' +
    'and save as the output file, usually yml.', (yargs) => {
    yargs
      .positional('output', {
        desc: 'Save the output OpenAPI with this name',
        type: 'string',
      })
      .options('i', {
        alias: 'input',
        demandOption: true,
        desc: 'Path to the Postman collection json file',
        type: 'string',
      })
      .options('o', {
        alias: 'options',
        desc: 'Path to the Options json file',
        type: 'string',
      })
  }).argv;

const json_str = args.options && fs.readFileSync(args.options, 'utf8');
const options = json_str && JSON.parse(json_str);
console.log(`Converting ${args.input} to ${args.output}, with options:\n${json_str || 'NONE'}`);

postmanToOpenApi(args.input, args.output, options)
  .then(_ => {
    console.log(`Done !`);
  })
  .catch(err => {
    console.log(err);
  });
