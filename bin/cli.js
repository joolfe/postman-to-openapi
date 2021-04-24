#!/usr/bin/env node

const p2o = require('./p2o')

p2o.parseAsync()
  .catch(err => {
    process.exitCode = 1
    console.error(err.message)
  })
