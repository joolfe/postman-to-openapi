'use strict'

const { describe, it } = require('mocha')
const { readFileSync } = require('fs')
const { equal } = require('assert').strict
const replacePostmanVariables = require('../lib/var-replacer')

describe('replacePostmanVariables specs', function () {
  const VARIABLES_COLLECTION = readFileSync('./test/resources/input/v21/Variables.json', 'utf8')
  const RESULT = readFileSync('./test/resources/var-replace/VariablesReplaced.json', 'utf8')

  it('should replace all variables successfully', async function () {
    const output = replacePostmanVariables(VARIABLES_COLLECTION)
    equal(output, RESULT)
  })
})
