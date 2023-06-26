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
 * @since         3.11.0
 */

import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import MfaEnabledProviderEntity from './mfaEnabledProviderEntity';

const ENTITY_NAME = 'MfaCombinedEnabledProviders';

class MfaCombinedEnabledProvidersEntity extends Entity {
  /**
   * Mfa settings entity constructor
   *
   * @param {Object} mfaSettingsDto mfa setting dto
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(mfaSettingsDto) {
    super(EntitySchema.validate(
      MfaCombinedEnabledProvidersEntity.ENTITY_NAME,
      mfaSettingsDto,
      MfaCombinedEnabledProvidersEntity.getSchema()
    ));

    // Associations
    if (this._props.MfaOrganizationSettings) {
      this._mfaOrganizationSettings = new MfaEnabledProviderEntity(this._props.MfaOrganizationSettings);
      delete this._props.MfaOrganizationSettings;
    }
    if (this._props.MfaAccountSettings) {
      this._mfaAccountSettings = new MfaEnabledProviderEntity(this._props.MfaAccountSettings);
      delete this._props.MfaAccountSettings;
    }
  }

  /**
   * Get folder entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "MfaOrganizationSettings",
        "MfaAccountSettings"
      ],
      "properties": {
        // Associated models
        "MfaOrganizationSettings": MfaEnabledProviderEntity.getSchema(),
        "MfaAccountSettings": MfaEnabledProviderEntity.getSchema(),
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this._mfaAccountSettings && contain.MfaAccountSettings) {
      result.MfaAccountSettings = this._mfaAccountSettings.toDto();
    }

    if (this._mfaOrganizationSettings && contain.MfaOrganizationSettings) {
      result.MfaOrganizationSettings = this._mfaOrganizationSettings.toDto();
    }

    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(MfaCombinedEnabledProvidersEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   *
   * /**
   * Get the mfa organization settings
   * @returns {MfaOrganizationSettings} mfa settings
   */
  get MfaOrganizationSettings() {
    return this._mfaOrganizationSettings;
  }

  /**
   * Get the mfa account settings
   * @returns {MfaAccountSettings} mfa settings
   */
  get MfaAccountSettings() {
    return this._mfaAccountSettings;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * FolderEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * MfaCombinedEnabledProvidersEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {MfaOrganizationSettings: true, MfaAccountSettings: true};
  }
}

export default MfaCombinedEnabledProvidersEntity;
