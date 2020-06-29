'use strict'

const { describe, it } = require('mocha')
const postmanToOpenApi = require('../lib')

describe('First test', function () {
  it('test', function () {
    postmanToOpenApi('', '', {})
  })
})
