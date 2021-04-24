'use strict'

const { describe, it } = require('mocha')
const { readFileSync } = require('fs')
const { equal, rejects } = require('assert').strict
const execa = require('execa')

const cliPath = './bin/cli.js'

const COLLECTION_BASIC = './test/resources/input/v21/PostmantoOpenAPI.json'
const EXPECTED_BASIC = readFileSync('./test/resources/output/Basic.yml', 'utf8')

describe.only('Cli specs', function () {
  it('should transform correctly a basic collection (HP)', async function () {
    const { stdout } = await execa('node', [cliPath, COLLECTION_BASIC])
    equal(stdout, EXPECTED_BASIC)
  })

  it('should return an error when collection argument is not provided', async function () {
    await rejects(execa('node', [cliPath]), {
      name: 'Error',
      stderr: "error: missing required argument 'collection'",
      exitCode: 1
    })
  })

  it('should print an error when collection file doesn\'t exist', async function () {
    await rejects(execa('node', [cliPath, './none/file.json']), {
      name: 'Error',
      stderr: "Error: ENOENT: no such file or directory, open './none/file.json'",
      exitCode: 1
    })
  })

  it.only('should print an error when result file cannot be created', async function () {
    await rejects(execa('node', [cliPath, COLLECTION_BASIC, '-f', './no_exist/result.yml']), {
      name: 'Error',
      stderr: "Error: ENOENT: no such file or directory, open './none/file.json'",
      exitCode: 1
    })
  })

  it('should transform and write into a file the output (HP)')
  it('should transform and write into a file the output if file already exist (HP)')

  it('should print correctly help command')
  it('should print correctly the version of the cli')
  it('should fail if no postman collection is informed')

  it('should accept options file as input')
  it('should fail if options file doesn\'t exist')
  it('should accept options string as input')
  it('should fail if options string is malformed')
})
