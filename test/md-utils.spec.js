'use strict'

const { describe, it } = require('mocha')
const { mdTableSelector, parseMdTable, parseMdTableForMultipleStruct } = require('../lib/md-utils')
const { deepEqual } = require('assert').strict

describe('MD table to Json specs', function () {
  describe('mdTableSelector get right table', function () {
    const MD_PATH_PARAMTER = '## path\n| object | name | description | required | type | example |\n' +
      '|--------|----------|--------------------------------|----------|--------|-----------|\n' +
      '| path | user_id | This is just a user identifier | true | number | 476587598 |\n' +
      '| path | type | Group of the type | true | string | ADMIN |\n'
    const MD_REQUEST_BODY = '## body\n| name | description  | required | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | true | number |\n| user | Object of the user | true | object |\n' +
      '| user.id | Identifier of the user | true | number |\n'
    const MD_BOTH = '## path\n| object | name | description | required | type | example |\n' +
      '|--------|----------|--------------------------------|----------|--------|-----------|\n' +
      '| path | user_id | This is just a user identifier | true | number | 476587598 |\n' +
      '| path | type | Group of the type | true | string | ADMIN |\n' +
      '## body\n| name | description  | required | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | true | number |\n| user | Object of the user | true | object |\n' +
      '| user.id | Identifier of the user | true | number |\n'
    const MD_DIFF_POSITION = '## body\n| name | description  | required | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | true | number |\n| user | Object of the user | true | object |\n' +
      '| user.id | Identifier of the user | true | number |\n' +
      '## path\n| object | name | description | required | type | example |\n' +
      '|--------|----------|--------------------------------|----------|--------|-----------|\n' +
      '| path | user_id | This is just a user identifier | true | number | 476587598 |\n' +
      '| path | type | Group of the type | true | string | ADMIN |\n'
    const MD_BOTH_WITH_HEADER_ADDITIONS = '## path\n| object | name | description | required | type | example |\n' +
      '|--------|----------|--------------------------------|----------|--------|-----------|\n' +
      '| path | user_id | This is just a user identifier | true | number | 476587598 |\n' +
      '| path | type | Group of the type | true | string | ADMIN |\n' +
      '# hola\n' +
      '## body\n| name | description  | required | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | true | number |\n| user | Object of the user | true | object |\n' +
      '| user.id | Identifier of the user | true | number |\n'
    const MD_BOTH_WITH_TABLE_ADDITIONS = '## path\n| object | name | description | required | type | example |\n' +
      '|--------|----------|--------------------------------|----------|--------|-----------|\n' +
      '| path | user_id | This is just a user identifier | true | number | 476587598 |\n' +
      '| path | type | Group of the type | true | string | ADMIN |\n' +
      '# hola\n' +
      '| object | name | description | required | type | example |\n' +
      '|--------|----------|--------------------------------|----------|--------|-----------|\n' +
      '| path | user_name | This is just a user name | true | string | foo |\n' +
      '| path | type | Group of the type | true | string | ADMIN |\n' +
      '## body\n| name | description  | required | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | true | number |\n| user | Object of the user | true | object |\n' +
      '| user.id | Identifier of the user | true | number |\n'
    const PATH_TABLE = {
      type: 'table',
      header: ['object', 'name', 'description', 'required', 'type', 'example'],
      align: [null, null, null, null, null, null],
      cells: [
        ['path', 'user_id', 'This is just a user identifier', 'true', 'number', '476587598'],
        ['path', 'type', 'Group of the type', 'true', 'string', 'ADMIN']
      ],
      raw: '| object | name | description | required | type | example |\n|--------|----------|--------------------------------|----------|--------|-----------|\n| path | user_id | This is just a user identifier | true | number | 476587598 |\n| path | type | Group of the type | true | string | ADMIN |\n',
      tokens: {
        header: [
          [{ type: 'text', raw: 'object', text: 'object' }],
          [{ type: 'text', raw: 'name', text: 'name' }],
          [{ type: 'text', raw: 'description', text: 'description' }],
          [{ type: 'text', raw: 'required', text: 'required' }],
          [{ type: 'text', raw: 'type', text: 'type' }],
          [{ type: 'text', raw: 'example', text: 'example' }]
        ],
        cells: [
          [
            [{ type: 'text', raw: 'path', text: 'path' }],
            [{ type: 'text', raw: 'user_id', text: 'user_id' }],
            [
              {
                type: 'text',
                raw: 'This is just a user identifier',
                text: 'This is just a user identifier'
              }
            ],
            [{ type: 'text', raw: 'true', text: 'true' }],
            [{ type: 'text', raw: 'number', text: 'number' }],
            [{ type: 'text', raw: '476587598', text: '476587598' }]
          ],
          [
            [{ type: 'text', raw: 'path', text: 'path' }],
            [{ type: 'text', raw: 'type', text: 'type' }],
            [{ type: 'text', raw: 'Group of the type', text: 'Group of the type' }],
            [{ type: 'text', raw: 'true', text: 'true' }],
            [{ type: 'text', raw: 'string', text: 'string' }],
            [{ type: 'text', raw: 'ADMIN', text: 'ADMIN' }]
          ]
        ]
      }
    }
    const BODY_TABLE = {
      type: 'table',
      header: ['name', 'description', 'required', 'type'],
      align: [null, null, null, null],
      cells: [
        ['group_id', 'This is just a group identifier', 'true', 'number'],
        ['user', 'Object of the user', 'true', 'object'],
        ['user.id', 'Identifier of the user', 'true', 'number']
      ],
      raw: '| name | description  | required | type |\n| ----------------- | ------------------------------- | -------- | ------ |\n| group_id | This is just a group identifier | true | number |\n| user | Object of the user | true | object |\n| user.id | Identifier of the user | true | number |\n',
      tokens: {
        header: [
          [{ type: 'text', raw: 'name', text: 'name' }],
          [{ type: 'text', raw: 'description', text: 'description' }],
          [{ type: 'text', raw: 'required', text: 'required' }],
          [{ type: 'text', raw: 'type', text: 'type' }]
        ],
        cells: [
          [
            [{ type: 'text', raw: 'group_id', text: 'group_id' }],
            [
              {
                type: 'text',
                raw: 'This is just a group identifier',
                text: 'This is just a group identifier'
              }
            ],
            [{ type: 'text', raw: 'true', text: 'true' }],
            [{ type: 'text', raw: 'number', text: 'number' }]
          ],
          [
            [{ type: 'text', raw: 'user', text: 'user' }],
            [{ type: 'text', raw: 'Object of the user', text: 'Object of the user' }],
            [{ type: 'text', raw: 'true', text: 'true' }],
            [{ type: 'text', raw: 'object', text: 'object' }]
          ],
          [
            [{ type: 'text', raw: 'user.id', text: 'user.id' }],
            [{ type: 'text', raw: 'Identifier of the user', text: 'Identifier of the user' }],
            [{ type: 'text', raw: 'true', text: 'true' }],
            [{ type: 'text', raw: 'number', text: 'number' }]
          ]
        ]
      }
    }

    it('should return path md table', function () {
      const parsed = mdTableSelector(MD_PATH_PARAMTER, 'path')
      deepEqual(parsed, PATH_TABLE)
    })

    it('should return body md table', function () {
      const parsed = mdTableSelector(MD_REQUEST_BODY, 'body')
      deepEqual(parsed, BODY_TABLE)
    })

    it('should return path md table with both data', function () {
      const parsed = mdTableSelector(MD_BOTH, 'path')
      deepEqual(parsed, PATH_TABLE)
    })

    it('should return body md table with both data', function () {
      const parsed = mdTableSelector(MD_BOTH, 'body')
      deepEqual(parsed, BODY_TABLE)
    })

    it('should return path md table with different position both data', function () {
      const parsed = mdTableSelector(MD_DIFF_POSITION, 'path')
      deepEqual(parsed, PATH_TABLE)
    })

    it('should return body md table with different position both data', function () {
      const parsed = mdTableSelector(MD_DIFF_POSITION, 'body')
      deepEqual(parsed, BODY_TABLE)
    })

    it('should return path md table with both data contain header additions', function () {
      const parsed = mdTableSelector(MD_BOTH_WITH_HEADER_ADDITIONS, 'path')
      deepEqual(parsed, PATH_TABLE)
    })

    it('should return body md table with both data contain header additions', function () {
      const parsed = mdTableSelector(MD_BOTH_WITH_HEADER_ADDITIONS, 'body')
      deepEqual(parsed, BODY_TABLE)
    })

    it('should return path md table with both data contain table additions', function () {
      const parsed = mdTableSelector(MD_BOTH_WITH_TABLE_ADDITIONS, 'path')
      deepEqual(parsed, PATH_TABLE)
    })

    it('should return body md table with both data contain table additions', function () {
      const parsed = mdTableSelector(MD_BOTH_WITH_TABLE_ADDITIONS, 'body')
      deepEqual(parsed, BODY_TABLE)
    })
  })
  describe('parseMdTable for path parameters ', function () {
    const MD_WITH_ADDITIONS = '## path\n| object | name  | description  | required | type   | example |\n' +
      '|--------------|------|----------|-----|-------|-----|\n' +
      '| path | user_id | This is just a user identifier     | true    | string | 476587598 |\n' +
      '| path | group_id | Group of the user | true | string  | RETAIL |\n' +
      '# hola'
    const MD_ADDITIONAL_HEADER = '## path\n| object | name  | description  | required | type  | additional | example |\n' +
      '|--------------|------|----------|-----|-------|-----|-----|\n' +
      '| path | user_id | This is just a user identifier | true | string | add field 1 | 476587598 |\n' +
      '| path | group_id | Group of the user | true | string | add field 2 | RETAIL |\n' +
      '# hola'
    const MD_NO_OBJECT = '## path\n| name  | description  | required | type  | additional | example |\n' +
      '|------|----------|-----|-------|-----|-----|\n' +
      '| user_id | This is just a user identifier | true | string | add field 1 | 476587598 |\n'
    const MD_NO_NAME = '## path\n| object  | description  | required | type  | additional | example |\n' +
      '|------|----------|-----|-------|-----|-----|\n' +
      '| user_id | This is just a user identifier | true | string | add field 1 | 476587598 |\n'
    const MD_MISS_COLUMN = '## path\n| object | name  | description  | type  | additional | example |\n' +
      '|--------------|------|----------|-----|-------|-----|\n' +
      '| path | user_id | This is just a user identifier | string | add field 1 | 476587598 |\n' +
      '# hola'
    const MD_INCORRECT = '## path\n| object | name  | description  | required | type   | example |\n' +
      '|--------------|------|----------|-----|-----|\n' +
      '| path | user_id | This is just a user identifier | true | string | 476587598 |\n' +
      '| path | group_id | Group of the user | true | string  | RETAIL | RETAIL |\n' +
      '# hola'
    const PARSED_TABLE = {
      user_id: {
        object: 'path',
        name: 'user_id',
        description: 'This is just a user identifier',
        required: 'true',
        type: 'string',
        example: '476587598'
      },
      group_id: {
        object: 'path',
        name: 'group_id',
        description: 'Group of the user',
        required: 'true',
        type: 'string',
        example: 'RETAIL'
      }
    }
    const PARSED_NO_REQUIRED_TABLE = {
      user_id: {
        object: 'path',
        name: 'user_id',
        description: 'This is just a user identifier',
        type: 'string',
        example: '476587598'
      }
    }

    it('should return a json object with parsed md table', function () {
      const parsed = parseMdTable(MD_WITH_ADDITIONS)
      deepEqual(parsed, PARSED_TABLE)
    })

    it('should return empty if not a markdown string', function () {
      deepEqual(parseMdTable(''), {})
    })

    it('should return empty if not a table in the markdown', function () {
      deepEqual(parseMdTable('# headers'), {})
    })

    it('should not parse not allowed headers', function () {
      deepEqual(parseMdTable(MD_ADDITIONAL_HEADER), PARSED_TABLE)
    })

    it('should return empty if no "name" column', function () {
      deepEqual(parseMdTable(MD_NO_NAME), {})
    })

    it('should return empty if no "object" column', function () {
      deepEqual(parseMdTable(MD_NO_OBJECT), {})
    })

    it('should not fail if column as "required" not exist in md table', function () {
      const parsed = parseMdTable(MD_MISS_COLUMN)
      deepEqual(parsed, PARSED_NO_REQUIRED_TABLE)
    })

    it('should return empty if incorrect md table', function () {
      deepEqual(parseMdTable(MD_INCORRECT), {})
    })
  })

  describe('parseMdTable for json request body', function () {
    const MD_WITH_NO_DEEP_STRUCT = '## body\n| name | description | required | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | true | number |\n' +
      '| user | Object of the user | true | object |\n' +
      '| others | This is for options | true | string[] |\n'
    const MD_WITH_ADDITIONS = '## body\n| name | description | required | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | true | number |\n' +
      '| user | Object of the user | true | object |\n' +
      '| user.id | Identifier of the user | true | number |\n' +
      '| user.name | Name of the user | true | string |\n' +
      '| user.info | Information of the user | true | object |\n' +
      '| user.info.gender | Gender of the user | true | string |\n' +
      '| user.info.age | Age of the user | false | number |\n' +
      '| others | This is for options | true | string[] |\n' +
      '# hola\n'
    const MD_ADDITIONAL_HEADER = '## body\n| name | description | required | additional | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ | ------ |\n' +
      '| group_id | This is just a group identifier | true | add field 1 | number |\n' +
      '| user | Object of the user | true | add field 2 | object |\n' +
      '| user.id | Identifier of the user | true | add field 3 | number |\n' +
      '| user.name | Name of the user | true | add field 4 | string |\n' +
      '| user.info | Information of the user | true | add field 5 | object |\n' +
      '| user.info.gender | Gender of the user | true | add field 6 | string |\n' +
      '| user.info.age | Age of the user | false | add field 7 | number |\n' +
      '| others | This is for options | true | add field 8 | string[] |\n' +
      '# hola\n'
    const MD_NO_NAME = '## body\n| description | required | additional | type |\n' +
      '| ------------------------------- | -------- | ------ | ------ |\n' +
      '| This is just a group identifier | true | add field 1 | number |\n'
    const MD_MISS_COLUMN = '## body\n| name | description | additional | type |\n' +
      '| ----------------- | ------------------------------- | -------- | ------ |\n' +
      '| group_id | This is just a group identifier | add field 1 | number |\n' +
      '| user | Object of the user | add field 2 | object |\n' +
      '| user.id | Identifier of the user | add field 3 | number |\n' +
      '# hola\n'
    const MD_INCORRECT = '## body\n| name | description | additional | type |\n' +
      '| ----------------- | ------------------------------- | -------- |\n' +
      '| group_id | This is just a group identifier | add field 1 | number |\n' +
      '| user | Object of the user | add field 2 | object |\n' +
      '| user.id | Identifier of the user | add field 3 | number |\n' +
      '# hola\n'

    const PARSED_NO_DEEP_STRUCT_TABLE =
    {
      group_id: {
        description: 'This is just a group identifier',
        name: 'group_id',
        required: 'true',
        type: 'number'
      },
      others: {
        description: 'This is for options',
        name: 'others',
        required: 'true',
        type: 'string[]'
      },
      user: {
        description: 'Object of the user',
        name: 'user',
        object: {},
        required: 'true',
        type: 'object'
      }
    }
    const PARSED_TABLE =
    {
      group_id: {
        name: 'group_id',
        description: 'This is just a group identifier',
        required: 'true',
        type: 'number'
      },
      user: {
        name: 'user',
        description: 'Object of the user',
        required: 'true',
        object: {
          id: {
            name: 'id',
            description: 'Identifier of the user',
            required: 'true',
            type: 'number'
          },
          name: {
            name: 'name',
            description: 'Name of the user',
            required: 'true',
            type: 'string'
          },
          info: {
            name: 'info',
            description: 'Information of the user',
            required: 'true',
            object: {
              gender: {
                name: 'gender',
                description: 'Gender of the user',
                required: 'true',
                type: 'string'
              },
              age: {
                name: 'age',
                description: 'Age of the user',
                required: 'false',
                type: 'number'
              }
            },
            type: 'object'
          }
        },
        type: 'object'
      },
      others: {
        name: 'others',
        description: 'This is for options',
        required: 'true',
        type: 'string[]'
      }
    }
    const PARSED_NO_REQUIRED_TABLE = {
      group_id: {
        description: 'This is just a group identifier',
        name: 'group_id',
        type: 'number'
      },
      user: {
        description: 'Object of the user',
        name: 'user',
        object: {
          id: {
            description: 'Identifier of the user',
            name: 'id',
            type: 'number'
          }
        },
        type: 'object'
      }
    }
    it('should return a json object with parsed no deep struct md table', function () {
      const parsed = parseMdTableForMultipleStruct(MD_WITH_NO_DEEP_STRUCT)
      deepEqual(parsed, PARSED_NO_DEEP_STRUCT_TABLE)
    })
    it('should return a json object with parsed md table', function () {
      const parsed = parseMdTableForMultipleStruct(MD_WITH_ADDITIONS)
      deepEqual(parsed, PARSED_TABLE)
    })
    it('should return empty if not a markdown string', function () {
      deepEqual(parseMdTableForMultipleStruct(''), {})
    })
    it('should return empty if not a table in the markdown', function () {
      deepEqual(parseMdTableForMultipleStruct('# headers'), {})
    })
    it('should not parse not allowed headers', function () {
      deepEqual(parseMdTableForMultipleStruct(MD_ADDITIONAL_HEADER), PARSED_TABLE)
    })
    it('should return empty if no "name" column', function () {
      deepEqual(parseMdTableForMultipleStruct(MD_NO_NAME), {})
    })
    it('should not fail if column as "required" not exist in md table', function () {
      const parsed = parseMdTableForMultipleStruct(MD_MISS_COLUMN)
      deepEqual(parsed, PARSED_NO_REQUIRED_TABLE)
    })
    it('should return empty if incorrect md table', function () {
      deepEqual(parseMdTableForMultipleStruct(MD_INCORRECT), {})
    })
  })
})
