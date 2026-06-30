/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.7.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "InFormIntegrationSettings";

/**
 * Client-side, per-user preferences for the in-form integration (call-to-action icon, in-form menu
 * and auto-save). These preferences are stored locally in the extension and let a user opt out of
 * the in-form menu without the server administrator disabling it for the whole organization.
 */
class InFormIntegrationSettingsEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(inFormIntegrationSettings, options = {}) {
    super(
      EntitySchema.validate(
        InFormIntegrationSettingsEntity.ENTITY_NAME,
        inFormIntegrationSettings,
        InFormIntegrationSettingsEntity.getSchema(),
      ),
      options,
    );
  }

  /**
   * Get the entity schema
   * @returns {object}
   */
  static getSchema() {
    return {
      type: "object",
      required: ["isInFormMenuEnabled"],
      properties: {
        isInFormMenuEnabled: {
          type: "boolean",
        },
      },
    };
  }

  /**
   * Build a default settings entity, with the in-form menu enabled.
   * @returns {InFormIntegrationSettingsEntity}
   */
  static createDefault() {
    return new InFormIntegrationSettingsEntity({ isInFormMenuEnabled: true });
  }

  /**
   * Return props
   * @returns {any}
   */
  get props() {
    return this._props;
  }

  /**
   * Whether the in-form menu (call-to-action icon, in-form menu and auto-save) is enabled.
   * @returns {boolean}
   */
  get isInFormMenuEnabled() {
    return this._props.isInFormMenuEnabled;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * InFormIntegrationSettingsEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default InFormIntegrationSettingsEntity;
