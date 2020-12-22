'use strict'

const { describe, it } = require('mocha')
const parser = require('../bin/p2o')
const { ok } = require('assert').strict

describe('Cli specs', function () {
  it('help command should work', async function () {
    const output = await promiseParse('--help')
    ok(output.includes('Convert a Postman collection (json) to OpenAPI spec (yml)'))
  })

  it('help command should work (alias)', async function () {
    const output = await promiseParse('-h')
    ok(output.includes('Convert a Postman collection (json) to OpenAPI spec (yml)'))
  })
})

function promiseParse (command) {
  return new Promise((resolve, reject) => {
    parser.parse(command, (err, argv, output) => {
      if (err) return reject(err)
      resolve(output)
    })
  })
}
