/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
import {EntitySchema} from "./entitySchema";
import {EntityValidationError} from './entityValidationError';
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Entity schema", () => {
  // Fixtures
  const validSchema = {
    "type": "object",
    "required": [
      "name",
    ],
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "name": {
        "type": "string"
      },
      "some": {
        "type": "string",
        "enum": ["type1", "type2"]
      },
      "created": {
        "type": "string",
        "format": "date-time"
      }
    }
  };

  it("validate throws TypeError if name is empty", () => {
    let t = () => {
      EntitySchema.validate(null, {'name': 'test'}, validSchema);
    };
    expect(t).toThrow(TypeError);
  });

  it("validate throws TypeError if dto is empty", () => {
    let t = () => {
      EntitySchema.validate('TestObject', null, validSchema);
    };
    expect(t).toThrow(TypeError);
  });

  it("validate throws TypeError if schema is empty", () => {
    let t = () => {
      EntitySchema.validate('TestObject', {'name': 'test'}, null);
    };
    expect(t).toThrow(TypeError);
  });

  it("validate show throw EntityValidationError id dto is invalid", () => {
    try {
      const testObject = {
        'id': null,
        //'name': 'missing',
        'some': 'not in list',
        'created': ['not a date']
      };
      EntitySchema.validate('TestObject', testObject, validSchema)
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details.id.type).toEqual('The id is not a valid string.');
      expect(error.details.id.format).toBe(undefined); // no format checking of invalid type
      expect(error.details.name.required).toEqual('The name is required.');
      expect(error.details.name.format).toBe(undefined); // no format checking of missing fields
      expect(error.details.name.type).toBe(undefined); // no format checking of missing fields
      expect(error.details.some.enum).toEqual('The some value is not included in the supported list.');
    }
  });

  it("validate show throw EntityValidationError id dto is invalid too", () => {
    try {
      const testObject = {
        'id': 'nope',
        'name': 'ok',
        'type': 'not in list'
      };
      EntitySchema.validate('TestObject', testObject, validSchema)
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details.id.type).toBe(undefined);
      expect(error.details.id.format).toEqual('The id is not a valid uuid.');
      expect(error.details.name).toBe(undefined);
      expect(error.details.date).toBe(undefined);
    }
  });

  it("validate filters out props if dto is valid but with additional info", () => {
    const testObject = {
      'name': 'ok',
      'some': 'type1',
      'not_in_schema': 'must be removed'
    };
    const expected = {
      'name': 'ok',
      'some': 'type1',
    };
    const result = EntitySchema.validate('TestObject', testObject, validSchema);
    expect(result).toEqual(expected);
  });
});

describe("Entity schema anyof", () => {
  it("validate works with anyof types", () => {
    let testObject = {
      'name': null
    };
    let expected = {
      'name': null
    };
    const schema = {
      "type": "object",
      "required": [
        "name"
      ],
      "properties": {
        'name': {
          'anyOf': [
            {"type": "null"},
            {"type": "string"}
          ]
        }
      }
    };
    let result = EntitySchema.validate('TestObject', testObject, schema);
    expect(result).toEqual(expected);

    testObject = {
      'name': 'test'
    };
    expected = {
      'name': 'test'
    };
    result = EntitySchema.validate('TestObject', testObject, schema);
    expect(result).toEqual(expected);
  });
});

describe("Entity schema isValidStringFormat", () => {
  it("isValidStringFormat throws TypeError if misused", () => {
    let t = () => {
      EntitySchema.isValidStringFormat(null, null);
    };
    expect(t).toThrow(TypeError);
  });

  it("isValidStringFormat throws TypeError if unsuported type", () => {
    let t = () => {
      EntitySchema.isValidStringFormat('super', 'walou');
    };
    expect(t).toThrow(TypeError);
  });

  it("isValidStringFormat works with uuid", () => {
    expect(EntitySchema.isValidStringFormat('6179af95-9526-4dfc-89ac-25df9b87d6e3', 'uuid')).toBe(true);
    expect(EntitySchema.isValidStringFormat('nope', 'uuid')).toBe(false);
  });

  it("isValidStringFormat works with date-time", () => {
    expect(EntitySchema.isValidStringFormat('2018-11-13T20:20:39+00:00', 'date-time')).toBe(true);
    expect(EntitySchema.isValidStringFormat('2018-11-13 20:20:39', 'date-time')).toBe(true);

    expect(EntitySchema.isValidStringFormat('yesterday', 'date-time')).toBe(false);
  });

  it("isValidStringFormat works with email", () => {
    expect(EntitySchema.isValidStringFormat('ada@passbolt.com', 'email')).toBe(true);
    expect(EntitySchema.isValidStringFormat('ada+test@passbolt.com', 'email')).toBe(true);
    expect(EntitySchema.isValidStringFormat('rémy@passbolt.com', 'email')).toBe(true);

    expect(EntitySchema.isValidStringFormat('not_an_email', 'date-time')).toBe(false);
  });
});

describe("Entity schema isValidPropType", () => {
  it("isValidPropType throws exception if misused", () => {
    let t = () => {EntitySchema.isValidPropType(null, null);};
    expect(t).toThrow(TypeError);
  });

  it("isValidPropType throws exception if unsuported type", () => {
    let t = () => {EntitySchema.isValidPropType('super', 'walou');};
    expect(t).toThrow(TypeError);
  });

  it("isValidPropType works with booleans", () => {
    expect(EntitySchema.isValidPropType(true, 'boolean')).toBe(true);
    expect(EntitySchema.isValidPropType(false, 'boolean')).toBe(true);

    // Do not accept value that evaluates as true or false
    expect(EntitySchema.isValidPropType(1, 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType(0, 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType("1", 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType("0", 'boolean')).toBe(false);

    expect(EntitySchema.isValidPropType('', 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType('nope', 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType('🔥', 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType({}, 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType({'hot':'hot'}, 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType([], 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType(['hot'], 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType(null, 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType(undefined, 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType((() => false), 'boolean')).toBe(false);
    expect(EntitySchema.isValidPropType((new Promise((s) => s(false))), 'boolean')).toBe(false);
  });

  it("isValidPropType works with strings", () => {
    expect(EntitySchema.isValidPropType('hot', 'string')).toBe(true);
    expect(EntitySchema.isValidPropType('🔥', 'string')).toBe(true);
    expect(EntitySchema.isValidPropType('', 'string')).toBe(true);

    expect(EntitySchema.isValidPropType(true, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType(false, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType(1, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType(0, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType({}, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType({'hot':'hot'}, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType([], 'string')).toBe(false);
    expect(EntitySchema.isValidPropType(['hot'], 'string')).toBe(false);
    expect(EntitySchema.isValidPropType(null, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType(undefined, 'string')).toBe(false);
    expect(EntitySchema.isValidPropType((() => 'string'), 'string')).toBe(false);
    expect(EntitySchema.isValidPropType((new Promise((s) => s('string'))), 'string')).toBe(false);
  });

  it("isValidPropType works with integers", () => {
    expect(EntitySchema.isValidPropType(1, 'integer')).toBe(true);
    expect(EntitySchema.isValidPropType(0, 'integer')).toBe(true);

    expect(EntitySchema.isValidPropType('hot', 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType('🔥', 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType('', 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType(true, 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType(false, 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType({}, 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType({'hot':'hot'}, 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType([], 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType(['hot'], 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType(null, 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType(undefined, 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType((() => 1), 'integer')).toBe(false);
    expect(EntitySchema.isValidPropType((new Promise((s) => s(1))), 'integer')).toBe(false);
  });
});
