const Mustache = require('mustache')

/**
 * Rewrite escapedValue() function to not delete undefined variables
 */
Mustache.Writer.prototype.escapedValue = function escapedValue (token, context, config) {
  const value = context.lookup(token[1]) || `{{${token[1]}}}`
  return String(value)
}

function replacePostmanVariables (collectionString, additionalVars = {}) {
  const postmanJson = JSON.parse(collectionString)
  const { variable = [] } = postmanJson
  const formatVars = variable.reduce((obj, { key, value }) => {
    obj[key] = value
    return obj
  }, {})
  // Merge collection vars with additional vars
  const context = { ...formatVars, ...additionalVars }
  return Mustache.render(collectionString, context)
}

module.exports = replacePostmanVariables
