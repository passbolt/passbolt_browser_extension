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
 * @since         3.2.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "OrganizationSettings";

// Organization status
const ORGANIZATION_ENABLED = 'enabled';
const ORGANIZATION_DISABLED = 'disabled';
const ORGANIZATION_NOT_FOUND = 'not found';

class OrganizationSettingsEntity extends Entity {
  /**
   * Organization settings entity constructor
   *
   * @param {Object} organizationSettingsDto organization settings DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(organizationSettingsDto) {
    // Default properties values
    const props = Object.assign(OrganizationSettingsEntity.getDefault(), organizationSettingsDto);
    const sanitizedDto = OrganizationSettingsEntity.sanitizeDto(props);

    super(EntitySchema.validate(
      OrganizationSettingsEntity.ENTITY_NAME,
      sanitizedDto,
      OrganizationSettingsEntity.getSchema()
    ));
  }

  /**
   * Get default properties values
   * @return {object}
   */
  static getDefault() {
    return {
      "status": OrganizationSettingsEntity.ORGANIZATION_ENABLED
    };
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [

      ],
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            OrganizationSettingsEntity.ORGANIZATION_ENABLED,
            OrganizationSettingsEntity.ORGANIZATION_DISABLED,
            OrganizationSettingsEntity.ORGANIZATION_NOT_FOUND
          ]
        },
        "app": {
          "type": "object"
        },
        "passbolt": {
          "type": "object"
        },
        "serverTimeDiff": {
          "anyOf": [{
            "type": "integer"
          }, {
            "type": "null"
          }]
        },
      }
    };
  }

  /**
   * Return a disabled organization settings.
   */
  static get disabledOrganizationSettings() {
    return {
      status: this.ORGANIZATION_DISABLED
    };
  }

  /**
   * Sanitized the given dto.
   * It accepts both old and new version of the dto and sets new fields with new ones if any.
   *
   * @param {Object} dto
   * @returns {Object}
   */
  static sanitizeDto(dto) {
    const sanitizedDto = JSON.parse(JSON.stringify(dto));

    OrganizationSettingsEntity.sanitizeEmailValidateRegex(sanitizedDto);

    return sanitizedDto;
  }

  /**
   * Sanitize email validate regex
   * @param {Object} dto The dto to sanitize
   * @returns {void}
   */
  static sanitizeEmailValidateRegex(dto) {
    const emailValidateRegex = dto?.passbolt?.email?.validate?.regex;

    if (
      !emailValidateRegex
        || typeof emailValidateRegex !== 'string'
        || !emailValidateRegex.trim().length
    ) {
      return;
    }

    dto.passbolt.email.validate.regex = emailValidateRegex
      .trim()
      .replace(/^\/+/, '') // Trim starting slash
      .replace(/\/+$/, '');   // Trim trailing slash
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API or content code
   * @returns {object}
   */
  toDto() {
    return Object.assign({}, this._props);
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get organization locale.
   * @returns {string}
   */
  get locale() {
    return this._props.app && this._props.app.locale;
  }

  /**
   * Check if a plugin is enabled
   * @param {string} name The plugin name
   * @returns {boolean}
   */
  isPluginEnabled(name) {
    const plugin = this._props?.passbolt?.plugins?.[name];

    // If the plugin exists and is not marked as disabled, it's considered enabled. i.e. enabled propery not present => enabled
    return plugin && plugin?.enabled !== false;
  }

  /**
   * Get the plugin settings
   * @param {string} name The plugin name
   * @returns {object}
   */
  getPluginSettings(name) {
    if (this.isPluginEnabled(name)) {
      return this._props.passbolt.plugins[name];
    }
  }

  /**
   * Returns true if the predicted server time is in the past.
   * @returns {boolean}
   */
  isServerInPast() {
    const serverTimeDiff = this._props.serverTimeDiff || 0;
    return serverTimeDiff < 0;
  }

  /**
   * Returns the predicted server time based on the last organization settings download.
   * @returns {integer}
   */
  get serverTime() {
    const currentClientTime = new Date();
    const serverTimeDiff = this._props.serverTimeDiff || 0;
    const serverTime = new Date(currentClientTime.getTime() + serverTimeDiff);
    return serverTime.getTime();
  }

  /**
   * Returns the custom application email validation regex.
   * @returns {string|null}
   */
  get emailValidateRegex() {
    return this._props?.passbolt?.email?.validate?.regex || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * OrganizationSettingsEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * OrganizationSettingsEntity.ORGANIZATION_ENABLED
   * @returns {string}
   */
  static get ORGANIZATION_ENABLED() {
    return ORGANIZATION_ENABLED;
  }

  /**
   * OrganizationSettingsEntity.ORGANIZATION_DISABLED
   * @returns {string}
   */
  static get ORGANIZATION_DISABLED() {
    return ORGANIZATION_DISABLED;
  }

  /**
   * OrganizationSettingsEntity.ORGANIZATION_NOT_FOUND
   * @returns {string}
   */
  static get ORGANIZATION_NOT_FOUND() {
    return ORGANIZATION_NOT_FOUND;
  }
}

export default OrganizationSettingsEntity;
