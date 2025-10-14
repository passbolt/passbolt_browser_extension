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
import AdfsSsoSettingsEntity from "passbolt-styleguide/src/shared/models/entity/ssoSettings/AdfsSsoSettingsEntity";
import AzureSsoSettingsEntity from "passbolt-styleguide/src/shared/models/entity/ssoSettings/AzureSsoSettingsEntity";
import GoogleSsoSettingsEntity from "passbolt-styleguide/src/shared/models/entity/ssoSettings/GoogleSsoSettingsEntity";
import OAuth2SsoSettingsEntity from "passbolt-styleguide/src/shared/models/entity/ssoSettings/OAuth2SsoSettingsEntity";

const ENTITY_NAME = "SsoLoginUrl";
const SSO_LOGIN_SUPPORTED_URLS = {
  [AzureSsoSettingsEntity.PROVIDER_ID]: AzureSsoSettingsEntity.SUPPORTED_URLS,
  [GoogleSsoSettingsEntity.PROVIDER_ID]: GoogleSsoSettingsEntity.SUPPORTED_URLS
};

/**
 * Entity related to the SSO Login URL
 */
class SsoLoginUrlEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} ssoLoginUrlDto SSO Login URL DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoLoginUrlDto, ssoProvider) {
    super(EntitySchema.validate(
      SsoLoginUrlEntity.ENTITY_NAME,
      ssoLoginUrlDto,
      SsoLoginUrlEntity.getSchema(ssoProvider)
    ));
  }

  /**
   * Get entity schema
   * @param {string} ssoProvider the sso provider the URL should match for
   * @returns {Object} schema
   */
  static getSchema(ssoProvider) {
    return {
      "type": "object",
      "required": ["url"],
      "properties": {
        "url": {
          "type": "x-custom",
          "validationCallback": url => SsoLoginUrlEntity.validateUrl(url, ssoProvider)
        },
      }
    };
  }

  /*
   * ==================================================
   * Custom validators
   * ==================================================
   */

  static validateUrl(value, ssoProvider) {
    if (typeof value !== "string") {
      throw new TypeError("The url should be a string.");
    }

    let url;

    try {
      url = new URL(value);
    } catch (error) {
      console.error(error);
      throw new Error('The url should be a valid url.');
    }

    if (ssoProvider === OAuth2SsoSettingsEntity.PROVIDER_ID || ssoProvider === AdfsSsoSettingsEntity.PROVIDER_ID) {
      if (url.protocol !== "https:") {
        throw new Error('The url protocol should be HTTPS.');
      }
      return;
    }

    if (!SSO_LOGIN_SUPPORTED_URLS[ssoProvider]) {
      throw new Error('The url should be part of the list of supported single sign-on urls.');
    }

    const isSupportedUrl = SSO_LOGIN_SUPPORTED_URLS[ssoProvider].some(supportedUrl => url.origin === supportedUrl);
    if (!isSupportedUrl) {
      throw new Error('The url should be part of the list of supported single sign-on urls.');
    }
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the SSO Login URL
   * @returns {string}
   */
  get url() {
    return this._props.url;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SsoConfigurationEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SsoLoginUrlEntity;
