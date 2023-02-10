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
import EntityValidationError from "./entityValidationError";
import Validator from "validator";

class EntitySchema {
  /**
   * Baseline schema validation
   * TODO use json-schema validation tools
   *
   * @param {object} schema
   * @param {string} name
   * @throws TypeError if schema is invalid
   */
  static validateSchema(name, schema) {
    if (!schema) {
      throw new TypeError(`Could not validate entity ${name}. No schema for entity ${name}.`);
    }
    if (!schema.type) {
      throw new TypeError(`Could not validate entity ${name}. Type missing.`);
    }
    if (schema.type === 'array') {
      if (!schema.items) {
        throw new TypeError(`Could not validate entity ${name}. Schema error: missing item definition.`);
      }
      return;
    }
    if (schema.type === 'object') {
      if (!schema.required || !Array.isArray(schema.required)) {
        throw new TypeError(`Could not validate entity ${name}. Schema error: no required properties.`);
      }
      if (!schema.properties || !Object.keys(schema).length) {
        throw new TypeError(`Could not validate entity ${name}. Schema error: no properties.`);
      }
      const schemaProps = schema.properties;
      for (const propName in schemaProps) {
        // Check type is defined
        if (!Object.prototype.hasOwnProperty.call(schemaProps, propName) || (!schemaProps[propName].type && !schemaProps[propName].anyOf)) {
          throw TypeError(`Invalid schema. Type missing for ${propName}...`);
        }
        // In case there is multiple types
        if (schemaProps[propName].anyOf) {
          if (!Array.isArray(schemaProps[propName].anyOf) || !schemaProps[propName].anyOf.length) {
            throw new TypeError(`Invalid schema, prop ${propName} anyOf should be an array`);
          }
          // TODO subcheck anyOf items
        }
      }
    }
  }

  /**
   * Validate
   * TODO use json-schema validation tools
   *
   * @param {string} name of entity
   * @param {object} dto data transfer object
   * @param {object} schema json-schema "like" data transfer object definition
   * @return {object} properties that are listed in the schema
   * @throws ValidationError
   */
  static validate(name, dto, schema) {
    if (!name || !dto || !schema) {
      throw new TypeError(`Could not validate entity ${name}. No data provided.`);
    }

    switch (schema.type) {
      case 'object':
        return EntitySchema.validateObject(name, dto, schema);
      case 'array':
        return EntitySchema.validateArray(name, dto, schema);
      default:
        throw new TypeError(`Could not validate entity ${name}. Unsupported type.`);
    }
  }

  /**
   * Validate a given array against a given schema
   *
   * @param {string} name of entity
   * @param {object} dto data transfer object
   * @param {object} schema json-schema "like" data transfer object definition
   * @return {object} properties that are listed in the schema
   * @throws ValidationError
   */
  static validateArray(name, dto, schema) {
    return EntitySchema.validateProp('items', dto, schema);
  }

  /**
   * Validate a given object against a given schema
   *
   * @param {string} name of entity
   * @param {object} dto data transfer object
   * @param {object} schema json-schema "like" data transfer object definition
   * @return {object} properties that are listed in the schema
   * @throws ValidationError
   */
  static validateObject(name, dto, schema) {
    const requiredProps = schema.required;
    const schemaProps = schema.properties;

    const result = {};
    const validationError = new EntityValidationError(`Could not validate entity ${name}.`);

    for (const propName in schemaProps) {
      if (!Object.prototype.hasOwnProperty.call(schemaProps, propName)) {
        continue;
      }

      // Check if property is required
      if (requiredProps.includes(propName)) {
        if (!Object.prototype.hasOwnProperty.call(dto, propName)) {
          validationError.addError(propName, 'required',  `The ${propName} is required.`);
          continue;
        }
      } else {
        // if it's not required and not present proceed
        if (!Object.prototype.hasOwnProperty.call(dto, propName)) {
          continue;
        }
      }

      try {
        result[propName] = EntitySchema.validateProp(propName, dto[propName], schemaProps[propName]);
      } catch (error) {
        if (error instanceof EntityValidationError) {
          validationError.details[propName] = error.details[propName];
        } else {
          throw error;
        }
      }
    }

    // Throw error if some issues were gathered
    if (validationError.hasErrors()) {
      throw validationError;
    }

    return result;
  }

  /**
   * Validate a given property against a given schema
   *
   * @param {string} propName example: name
   * @param {*} prop example 'my folder'
   * @param {object} propSchema example {type:string, maxLength: 64}
   * @throw {EntityValidationError}
   * @returns {*} prop
   */
  static validateProp(propName, prop, propSchema) {
    // Check for props that can be of multiple types
    if (propSchema.anyOf) {
      EntitySchema.validateAnyOf(propName, prop, propSchema.anyOf);
      return prop;
    }

    // Check if prop validates based on type
    EntitySchema.validatePropType(propName, prop, propSchema);

    // Check if the value is the enumerated list
    if (propSchema.enum) {
      EntitySchema.validatePropEnum(propName, prop, propSchema);
      return prop;
    }

    // Additional rules by types
    switch (propSchema.type) {
      case 'string':
        // maxLength, minLength, length, regex, etc.
        EntitySchema.validatePropTypeString(propName, prop, propSchema);
        break;
        /*
         * Note on 'array' - unchecked as not in use beyond array of objects in passbolt
         * Currently it must be done manually when bootstrapping collections
         * example: foldersCollection, permissionsCollection, etc.
         *
         * Note on 'object' - we do not check if property of type 'object' validate (or array of objects, see above)
         * Currently it must be done manually in the entities when bootstrapping associations
         *
         * Note on 'integer' and 'number' - Min / max supported, not needed in passbolt
         */
      case 'array':
      case 'object':
      case 'number':
      case 'integer':
      case 'boolean':
      case 'blob':
      case 'null':
        // No additional checks
        break;
      case 'x-custom':
        EntitySchema.validatePropCustom(propName, prop, propSchema);
        break;
      default:
        throw new TypeError(`Could not validate property ${propName}. Unsupported prop type ${propSchema.type}`);
    }

    return prop;
  }

  /**
   * Validate a prop of type string
   * Throw an error with the validation details if validation fails
   *
   * @param {string} propName example: name
   * @param {*} prop example 'my folder'
   * @param {object} propSchema example {type:string}
   * @throw {EntityValidationError}
   * @returns void
   */
  static validatePropType(propName, prop, propSchema) {
    if (!EntitySchema.isValidPropType(prop, propSchema.type)) {
      const validationError = new EntityValidationError(`Could not validate property ${propName}.`);
      validationError.addError(propName, 'type',  `The ${propName} is not a valid ${propSchema.type}.`);
      throw validationError;
    }
  }

  /**
   * Validate a prop with a custom validator
   * Throw an error with the validation details if validation fails
   *
   * @param {string} propName example: name
   * @param {*} prop the value to validate
   * @param {object} propSchema example {type:string}
   * @throw {EntityValidationError}
   * @returns void
   */
  static validatePropCustom(propName, prop, propSchema) {
    try {
      propSchema.validationCallback(prop);
    } catch (e) {
      const validationError = new EntityValidationError(`Could not validate property ${propName}.`);
      validationError.addError(propName, 'custom',  `The ${propName} is not valid: ${e.message}`);
      throw validationError;
    }
  }

  /**
   * Validate a prop of type string
   * Throw an error with the validation details if validation fails
   *
   * @param {string} propName example: name
   * @param {*} prop example 'my folder'
   * @param {object} propSchema example {type:string, maxLength: 64}
   * @throw {EntityValidationError}
   * @returns void
   */
  static validatePropTypeString(propName, prop, propSchema) {
    const validationError = new EntityValidationError(`Could not validate property ${propName}.`);
    if (propSchema.format) {
      if (!EntitySchema.isValidStringFormat(prop, propSchema.format)) {
        validationError.addError(propName, 'format', `The ${propName} is not a valid ${propSchema.format}.`);
      }
    }
    if (propSchema.length) {
      if (!EntitySchema.isValidStringLength(prop, propSchema.length, propSchema.length)) {
        validationError.addError(propName, 'length', `The ${propName} should be ${propSchema.length} character in length.`);
      }
    }
    if (propSchema.minLength) {
      if (!EntitySchema.isValidStringLength(prop, propSchema.minLength)) {
        validationError.addError(propName, 'minLength', `The ${propName} should be ${propSchema.minLength} character in length minimum.`);
      }
    }
    if (propSchema.maxLength) {
      if (!EntitySchema.isValidStringLength(prop, 0, propSchema.maxLength)) {
        validationError.addError(propName, 'maxLength', `The ${propName} should be ${propSchema.maxLength} character in length maximum.`);
      }
    }
    if (propSchema.pattern) {
      if (!Validator.matches(prop, propSchema.pattern)) {
        validationError.addError(propName, 'pattern', `The ${propName} is not valid.`);
      }
    }
    if (propSchema.custom) {
      if (!propSchema.custom(prop)) {
        validationError.addError(propName, 'custom', `The ${propName} is not valid.`);
      }
    }
    if (validationError.hasErrors()) {
      throw validationError;
    }
  }

  /**
   * Validate a prop of any type with possible values define in enum
   * Throw an error with the validation details if validation fails
   *
   * @param {string} propName example: role
   * @param {*} prop example 'admin'
   * @param {object} propSchema example {type: string, enum: ['admin', 'user']}
   * @throw {EntityValidationError}
   * @returns void
   */
  static validatePropEnum(propName, prop, propSchema) {
    if (!EntitySchema.isPropInEnum(prop, propSchema.enum)) {
      const validationError = new EntityValidationError(`Could not validate property ${propName}.`);
      validationError.addError(propName, 'enum', `The ${propName} value is not included in the supported list.`);
      throw validationError;
    }
  }

  /**
   * Validate a given property against multiple possible types
   *
   * @param {string} propName example: name
   * @param {*} prop example 'my folder'
   * @param {array} anyOf example [{type:string, maxLength: 64}, {type:null}]
   * @throw {EntityValidationError}
   * @returns {*} prop
   */
  static validateAnyOf(propName, prop, anyOf) {
    for (let i = 0; i < anyOf.length; i++) {
      try {
        EntitySchema.validateProp(propName, prop, anyOf[i]);
        return;
      } catch (error) {
        // All must fail...
      }
    }
    const validationError = new EntityValidationError(`Could not validate property ${propName}.`);
    validationError.addError(propName, 'type',  `The ${propName} does not match any of the supported types.`);
    throw validationError;
  }

  /**
   * Check if prop validates based on type
   *
   * @param {*} prop
   * @param {string} type
   * @returns {boolean}
   * @throws TypeError if type is not supported
   */
  static isValidPropType(prop, type) {
    if (Array.isArray(type)) {
      throw new TypeError('EntitySchema isValidPropType multiple types are not supported.');
    }
    if (typeof type !== 'string') {
      throw new TypeError('EntitySchema isValidPropType type is invalid.');
    }
    switch (type) {
      case 'null':
        return prop === null;
      case 'boolean':
        return typeof prop === 'boolean';
      case 'string':
        return typeof prop === 'string';
      case 'integer':
        return Number.isInteger(prop);
      case 'number':
        return typeof prop === 'number';
      case 'object':
        return typeof prop === 'object';
      case 'array':
        return Array.isArray(prop);
      case 'blob':
        return prop instanceof Blob;
      case 'x-custom':
        return true;
      default:
        throw new TypeError('EntitySchema validation type not supported.');
    }
  }

  /**
   * Check if prop validates based on format
   *
   * @param {*} prop
   * @param {string} format
   * @returns {boolean}
   * @throws TypeError if format is not supported
   */
  static isValidStringFormat(prop, format) {
    if (typeof format !== 'string') {
      throw new TypeError('EntitySchema validPropFormat format is invalid.');
    }
    switch (format) {
      case 'uuid':
        return Validator.isUUID(prop);
      case 'email':
      case 'idn-email':
        return Validator.isEmail(prop);
      case 'date-time':
        return Validator.isISO8601(prop);
        /*
         * case 'ipv4':
         *   return Validator.isIP(prop, '4');
         * case 'ipv6':
         *   return Validator.isIP(prop, '6');
         */

      /*
       * Not in json-schema but needed by passbolt
       * cowboy style section 🤠
       */
      case 'x-url':
        return Validator.isURL(prop, {require_tld: false});
      case 'x-hex-color':
        return Validator.isHexColor(prop);
      case 'x-base64':
        return Validator.isBase64(prop);

      // Not supported - Not needed
      default:
        throw new TypeError(`EntitySchema string validation format ${format} is not supported.`);
    }
  }

  /**
   * Validate if a string is of a given length
   * @param {string} str
   * @param {int} min
   * @param {int} max
   * @returns {boolean|*}
   */
  static isValidStringLength(str, min, max) {
    min = min || 0;
    return Validator.isLength(str, min, max);
  }

  /**
   * Check if the value is the enumerated list
   *
   * @param {*} prop
   * @param {array<string>} enumList
   * @returns {boolean}
   * @throws TypeError if format is not supported
   */
  static isPropInEnum(prop, enumList) {
    if (!enumList || !Array.isArray(enumList) || !enumList.length) {
      throw new TypeError(`EntitySchema enum schema cannot be empty.`);
    }
    return enumList.includes(prop);
  }
}

export default EntitySchema;
