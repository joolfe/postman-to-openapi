'use strict'

const { describe, it } = require('mocha')
const { readFileSync } = require('fs')
const { equal } = require('assert').strict
const replacePostmanVariables = require('../lib/var-replacer')

describe('replacePostmanVariables specs', function () {
  const VARIABLES_COLLECTION_V2 = readFileSync('./test/resources/input/v2/Variables.json', 'utf8')
  const VARIABLES_COLLECTION_V21 = readFileSync('./test/resources/input/v21/Variables.json', 'utf8')
  const RESULT_V2 = readFileSync('./test/resources/var-replace/VariablesReplacedV2.json', 'utf8')
  const RESULT_V21 = readFileSync('./test/resources/var-replace/VariablesReplacedV21.json', 'utf8')
  const RESULT_ADDITIONAL_V2 = readFileSync('./test/resources/var-replace/VariablesReplacedV2additional.json', 'utf8')
  const RESULT_ADDITIONAL_V21 = readFileSync('./test/resources/var-replace/VariablesReplacedV21additional.json', 'utf8')

  it('should replace all variables successfully v2', async function () {
    const output = replacePostmanVariables(VARIABLES_COLLECTION_V2)
    equal(output, RESULT_V2)
  })

  it('should replace all variables successfully v2.1', async function () {
    const output = replacePostmanVariables(VARIABLES_COLLECTION_V21)
    equal(output, RESULT_V21)
  })

  it('should use additional vars', async function () {
    const output = replacePostmanVariables(VARIABLES_COLLECTION_V2, {
      company: 'myCompany',
      service: 'myService'
    })
    equal(output, RESULT_ADDITIONAL_V2)
  })

  it('should replace all variables successfully v2.1', async function () {
    const output = replacePostmanVariables(VARIABLES_COLLECTION_V21, {
      company: 'myCompany',
      service: 'myService'
    })
    equal(output, RESULT_ADDITIONAL_V21)
  })
})
