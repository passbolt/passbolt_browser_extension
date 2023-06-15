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
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import ProfileEntity from "../profile/profileEntity";
import UserEntity from "../user/userEntity";
import SecurityTokenEntity from "../securityToken/securityTokenEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {v5 as uuidv5} from "uuid";

const ENTITY_NAME = "AbstractAccount";

const FINGERPRINT_MIN_LENGTH = 40;
const FINGERPRINT_MAX_LENGTH = 40;

const UUID_PASSBOLT_NAMESPACE = 'd5447ca1-950f-459d-8b20-86ddfdd0f922';

class AbstractAccountEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountDto account DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountDto) {
    super(accountDto);

    // Associations
    if (this._props.security_token) {
      this._security_token = new SecurityTokenEntity(this._props.security_token);
      delete this._props.security_token;
    }
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const userEntitySchema = UserEntity.getSchema();
    const profileEntitySchema = ProfileEntity.getSchema();
    return {
      "type": "object",
      "required": [
      ],
      "properties": {
        "type": {
          "type": "string",
        },
        "domain": {
          "type": "string"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "user_key_fingerprint": {
          "type": "string",
          "minLength": FINGERPRINT_MIN_LENGTH,
          "maxLength": FINGERPRINT_MAX_LENGTH,
          "pattern": /^[A-F0-9]{40}$/,
        },
        "user_public_armored_key": {
          "type": "string"
        },
        "user_private_armored_key": {
          "type": "string"
        },
        "server_public_armored_key": {
          "type": "string"
        },
        "username": userEntitySchema.properties.username,
        "first_name": profileEntitySchema.properties.first_name,
        "last_name": profileEntitySchema.properties.last_name,
        "locale": {
          "anyOf": [{
            "type": "string",
            "pattern": /^[a-z]{2}-[A-Z]{2}$/,
          }, {
            "type": "null"
          }]
        },
        "security_token": SecurityTokenEntity.getSchema(),
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the account id.
   * Generate a uuid v5 based on the account domain and account user id.
   * @return {string|null} uuid. Return null if domain or user id not defined
   */
  get id() {
    if (!this.domain || !this.userId) {
      return null;
    }

    return uuidv5(`${this.domain}${this.userId}`, UUID_PASSBOLT_NAMESPACE);
  }

  /**
   * Get the account type
   * @return {string}
   */
  get type() {
    return this._props.type;
  }

  /**
   * Get the domain
   * @returns {string} ref ie. http://cloud.passbolt.com/acme
   */
  get domain() {
    return this._props.domain;
  }

  /**
   * Get the user id
   * @returns {string}
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get the username
   * @returns {string}
   */
  get username() {
    return this._props.username;
  }

  /**
   * Set the username
   * @param {string} username The username
   */
  set username(username) {
    EntitySchema.validateProp("username", username, AbstractAccountEntity.getSchema().properties.username);
    this._props.username = username;
  }

  /**
   * Get the user first name
   * @returns {string}
   */
  get firstName() {
    return this._props.first_name;
  }

  /**
   * Set the user first name
   * @param {string} firstName The user first name
   */
  set firstName(firstName) {
    EntitySchema.validateProp("first_name", firstName, AbstractAccountEntity.getSchema().properties.first_name);
    this._props.first_name = firstName;
  }

  /**
   * Get the user last name
   * @returns {string}
   */
  get lastName() {
    return this._props.last_name;
  }

  /**
   * Set the user last name
   * @param {string} lastName The user last name
   */
  set lastName(lastName) {
    EntitySchema.validateProp("last_name", lastName, AbstractAccountEntity.getSchema().properties.last_name);
    this._props.last_name = lastName;
  }

  /**
   * Get the user locale
   * @returns {string}
   */
  get locale() {
    return this._props.locale;
  }

  /**
   * Set the user locale
   * @param {string} locale The user locale
   */
  set locale(locale) {
    EntitySchema.validateProp("locale", locale, AbstractAccountEntity.getSchema().properties.locale);
    this._props.locale = locale;
  }

  /**
   * Get the user public armored key
   * @returns {string}
   */
  get userPublicArmoredKey() {
    return this._props.user_public_armored_key;
  }

  /**
   * Set the user public armored key
   * @param {string} armoredKey The server public armored key
   */
  set userPublicArmoredKey(armoredKey) {
    EntitySchema.validateProp("user_public_armored_key", armoredKey, AbstractAccountEntity.getSchema().properties.user_public_armored_key);
    this._props.user_public_armored_key = armoredKey;
  }

  /**
   * Get the user private armored key
   * @returns {string}
   */
  get userPrivateArmoredKey() {
    return this._props.user_private_armored_key;
  }

  /**
   * Set the user private armored key
   * @param {string} armoredKey The user private armored key
   */
  set userPrivateArmoredKey(armoredKey) {
    EntitySchema.validateProp("user_private_armored_key", armoredKey, AbstractAccountEntity.getSchema().properties.user_private_armored_key);
    this._props.user_private_armored_key = armoredKey;
  }

  /**
   * Get the server public armored key
   * @returns {string}
   */
  get serverPublicArmoredKey() {
    return this._props.server_public_armored_key;
  }

  /**
   * Set the server public armored key
   * @param {string} armoredKey The server public armored key
   */
  set serverPublicArmoredKey(armoredKey) {
    EntitySchema.validateProp("server_public_armored_key", armoredKey, AbstractAccountEntity.getSchema().properties.server_public_armored_key);
    this._props.server_public_armored_key = armoredKey;
  }

  /**
   * Get the user key fingerprint.
   */
  get userKeyFingerprint() {
    return this._props.user_key_fingerprint;
  }

  /**
   * Set the user key fingerprint.
   * @param {string} fingerprint The key fingerprint.
   */
  set userKeyFingerprint(fingerprint) {
    EntitySchema.validateProp("user_key_fingerprint", fingerprint, AbstractAccountEntity.getSchema().properties.user_key_fingerprint);
    this._props.user_key_fingerprint = fingerprint;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Get security token
   * @returns {(SecurityTokenEntity|null)}
   */
  get securityToken() {
    return this._security_token || null;
  }

  /**
   * Get security token
   * @param {(SecurityTokenEntity|Object)} securityToken The security token to set.
   */
  set securityToken(securityToken) {
    if (securityToken instanceof SecurityTokenEntity) {
      securityToken = securityToken.toDto();
    }
    this._security_token = new SecurityTokenEntity(securityToken);
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * AbstractAccountEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AbstractAccountEntity;
