'use strict'

const marked = require('marked')
const supHeaders = ['object', 'name', 'description', 'example', 'type', 'required']

function mdTableSelector (md, select) {
  let goal = 1
  const parsed = marked.lexer(md)
  for (const el of parsed) {
    goal += 1
    if (el.type === 'heading') {
      if (el.text === select) break
    }
  }

  const table = parsed.find((el) => {
    goal -= 1
    if (el.type === 'table') {
      if (goal === 0) return el
    }
    return null
  })

  return table
}

function parseMdTable (md) {
  const table = mdTableSelector(md, 'path')
  if (table == null) return {}
  const { header, cells } = table
  if (!header.includes('object') || !header.includes('name')) return {}
  const headers = header.map(h => supHeaders.includes(h) ? h : false)
  const tableObj = cells.reduce((accTable, cell, i) => {
    const cellObj = cell.reduce((accCell, field, index) => {
      if (headers[index]) {
        accCell[headers[index]] = field
      }
      return accCell
    }, {})
    accTable[cellObj.name] = cellObj
    return accTable
  }, {})
  return tableObj
}

function parseMdTableForMultipleStruct (md) {
  const table = mdTableSelector(md, 'body')
  if (table == null) return {}
  const { header, cells } = table
  // if table doesn't contain name, return empty object
  if (!header.includes('name')) return {}
  const headers = header.map(h => supHeaders.includes(h) ? h : false)
  const tableObj = parseDeepCell(cells, headers, 1)
  return tableObj
}

function parseDeepCell (cells, headers, level) {
  const tableObj = cells.reduce((accTable, cell, i, array) => {
    const nameIndex = headers.indexOf('name')
    // when cell name split by '.', that's length not equal the level return the acc table
    if (cell[nameIndex].split('.').length !== level) {
      return accTable
    }
    const cellObj = cell.reduce((accCell, field, index) => {
      if (field === 'object' || field === 'object[]') {
        // type is object do parser Deep cell again, add next level and put last array
        const deepObject = parseDeepCell(array.slice(i + 1, array.length), headers, level + 1)
        accCell.object = deepObject
      }
      if (headers[index]) {
        /**
         * septate the name and get last key
         * user.id -> [user, id] -> id
         */
        field = field.split('.')
        accCell[headers[index]] = field[field.length - 1]
      }
      return accCell
    }, {})
    accTable[cellObj.name] = cellObj
    return accTable
  }, {})
  return tableObj
}

module.exports = { mdTableSelector, parseMdTable, parseMdTableForMultipleStruct }
