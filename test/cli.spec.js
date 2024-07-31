'use strict'

const { describe, it, afterEach } = require('mocha')
const { readFileSync, existsSync, unlinkSync } = require('fs')
const { equal, rejects, ok } = require('assert').strict
const execa = require('execa')

const cliPath = './bin/cli.js'
const COLLECTION_BASIC = './test/resources/input/v21/PostmantoOpenAPI.json'
const COLLECTION_SIMPLE = './test/resources/input/v21/SimplePost.json'
const OPTIONS_INFO = './test/resources/input/options.json'
const INVALID_OPTIONS_INFO = './test/resources/input/invalidOptions.txt'
const EXPECTED_INFO_OPTS = readFileSync('./test/resources/output/InfoOpts.yml', 'utf8')
const EXPECTED_BASIC = readFileSync('./test/resources/output/Basic.yml', 'utf8')
const OUTPUT_PATH = './openAPIRes.yml'
const HELP_OUTPUT = readFileSync('./test/resources/console/help.txt', 'utf8')

const { version } = require('../package.json')

describe('Cli specs', function () {
  afterEach('remove file', function () {
    if (existsSync(OUTPUT_PATH)) {
      unlinkSync(OUTPUT_PATH)
    }
  })

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

  it('should print an error when result file cannot be created', async function () {
    await rejects(execa('node', [cliPath, COLLECTION_BASIC, '-f', './no_exist/result.yml']), {
      name: 'Error',
      stderr: "Error: ENOENT: no such file or directory, open './no_exist/result.yml'",
      exitCode: 1
    })
  })

  it('should transform and write into a file the output (HP)', async function () {
    const { stdout } = await execa('node', [cliPath, COLLECTION_BASIC, '-f', OUTPUT_PATH])
    ok(existsSync(OUTPUT_PATH))
    equal(stdout, EXPECTED_BASIC)
  })

  it('should transform correctly a basic collection when using option file (HP)', async function () {
    const { stdout } = await execa('node', [cliPath, COLLECTION_SIMPLE, '-o', OPTIONS_INFO])
    equal(stdout, EXPECTED_INFO_OPTS)
  })

  it('should print an error when "options" file doesn\'t exist', async function () {
    await rejects(execa('node', [cliPath, COLLECTION_SIMPLE, '-o', './no_exist/options.json']), {
      name: 'Error',
      stderr: "Error: invalid \"options\" parameter -> ENOENT: no such file or directory, open './no_exist/options.json'",
      exitCode: 1
    })
  })

  it('should print an error when options file is not a valid json', async function () {
    await rejects(execa('node', [cliPath, COLLECTION_SIMPLE, '-o', INVALID_OPTIONS_INFO]), (err) => {
      equal(err.name, 'Error')
      equal(err.exitCode, 1)
      ok(err.stderr === 'Error: invalid "options" parameter -> Expected property name or \'}\' in JSON at position 6' ||
      err.stderr === 'Error: invalid "options" parameter -> Unexpected token i in JSON at position 6')
      return true
    })
  })

  it('should print correctly the version of the cli', async function () {
    const { stdout } = await execa('node', [cliPath, '-v'])
    equal(stdout, version)
  })

  it('should print correctly help command', async function () {
    const { stdout } = await execa('node', [cliPath, '-h'])
    equal(stdout, HELP_OUTPUT)
  })
})
