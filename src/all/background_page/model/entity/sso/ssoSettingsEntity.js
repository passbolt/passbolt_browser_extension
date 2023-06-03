/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "SsoSettings";
const AZURE = "azure";
const GOOGLE = "google";

const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_REGEXP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * Entity related to the SSO settings
 */
class SsoSettingsEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} ssoSettingsDto SSO settings DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoSettingsDto) {
    super(EntitySchema.validate(
      SsoSettingsEntity.ENTITY_NAME,
      SsoSettingsEntity.sanitizeDto(ssoSettingsDto),
      SsoSettingsEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "providers": {
          "type": "array",
          "items": {
            "type": "string"
          },
        },
        "provider": {
          "anyOf": [{
            "type": "string",
            "enum": SsoSettingsEntity.AVAILABLE_PROVIDERS
          }, {
            "type": "null"
          }],
        },
        "data": {
          "type": "object",
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
      }
    };
  }

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */
  /**
   * Sanitize account recovery organization public key dto.
   * @param {object} dto The dto to sanitiaze
   * @returns {object}
   */
  static sanitizeDto(dto) {
    dto = Object.assign({}, dto); // shallow clone.
    if (dto.data?.client_secret_expiry && DATETIME_REGEXP.test(dto.data.client_secret_expiry)) {
      // we ignore the time part of the date as the UI doesn't support it
      dto.data.client_secret_expiry = dto.data.client_secret_expiry.substr(0, 10);
    }

    // Set the default values to ensure backward compatibility
    if (!dto.data?.email_claim && dto.data?.provider === AZURE) {
      dto.data.email_claim = "email";
    }
    if (!dto.data?.prompt && dto.data?.provider === AZURE) {
      dto.data.prompt = "login";
    }

    return dto;
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   * @returns {*}
   */
  toDto() {
    const dto = JSON.parse(JSON.stringify(this));
    if (dto?.data?.client_secret_expiry && DATE_REGEXP.test(dto.data.client_secret_expiry)) {
      dto.data.client_secret_expiry += " 00:00:00";
    }
    return dto;
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the settings identifier
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get the provider identifier
   * @returns {string}
   */
  get provider() {
    return this._props.provider;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SsoSettingsEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * SsoSettingsEntity.AZURE
   * @returns {string}
   */
  static get AZURE() {
    return AZURE;
  }

  /**
   * SsoSettingsEntity.GOOGLE
   * @returns {string}
   */
  static get GOOGLE() {
    return GOOGLE;
  }

  /**
   * SsoSettingsEntity.AVAILABLE_PROVIDERS
   * @returns {Array<string>}
   */
  static get AVAILABLE_PROVIDERS() {
    return [
      SsoSettingsEntity.AZURE,
      SsoSettingsEntity.GOOGLE,
    ];
  }
}

export default SsoSettingsEntity;
