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
const {GenerateGpgKeyEntity} = require("../gpgkey/generate/generateGpgkeyEntity");
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');
const {UserEntity} = require("../user/userEntity");
const {SecurityTokenEntity} = require("../securityToken/securityTokenEntity");

const ENTITY_NAME = "Setup";

class SetupEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} setupDto setup DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(setupDto) {
    // Sanitize
    if (typeof setupDto.domain == "string") {
      setupDto.domain = SetupEntity.sanitizeDomain(setupDto.domain);
    }

    super(EntitySchema.validate(
      SetupEntity.ENTITY_NAME,
      setupDto,
      SetupEntity.getSchema()
    ));

    // Associations
    if (this._props.user) {
      this._user = new UserEntity(this._props.user);
      delete this._props.user;
    }
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
    return {
      "type": "object",
      "required": [
        "domain",
        "user_id",
        "token"
      ],
      "properties": {
        "domain": {
          "type": "string"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "token": {
          "type": "string",
          "format": "uuid"
        },
        "passphrase": {
          "type": "string"
        },
        "remember_until_logout": {
          "type": "boolean"
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
        "locale": {
          "anyOf": [{
            "type": "string",
            "pattern": /^[a-z]{2}-[A-Z]{2}$/,
          }, {
            "type": "null"
          }]
        },
        // Associated models
        "user": UserEntity.getSchema(),
        "security_token": SecurityTokenEntity.getSchema(),
      }
    };
  }

  /**
   * Create a setup entity from an url.
   * @param {string} setupUrl The url to parse
   * @param {boolean} detectLocale (optional) Detect the locale from the url. Default false. It's useful for the setup
   * to capture the locale on the page where the user has to download the extension and continue with it.
   * @return {SetupEntity}
   */
  static createFromUrl(setupUrl, detectLocale = false) {
    const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
    const regex = new RegExp(`(.*)\/setup\/(install|recover)\/(${uuidRegex})\/(${uuidRegex})`);
    if (regex.test(setupUrl)) {
      const [, domain, , user_id, token] = setupUrl.match(regex);
      const setupDto = {
        domain: domain,
        user_id: user_id,
        token: token,
      };
      if (detectLocale) {
        const url = new URL(setupUrl);
        const locale = url.searchParams.get('locale');
        if (locale) {
          setupDto.locale = locale;
        }
      }
      return new SetupEntity(setupDto);
    }
    throw new Error('createFromUrl cannot parse the url');
  }

  /*
   * ==================================================
   * Format / normalize
   * ==================================================
   */

  /**
   * Normalize format domain.
   * ie: http://cloud.passbolt.com/acme/// -> http://cloud.passbolt.com/acme
   * @param {string} domain The domain to normalize
   * @return {string}
   */
  static sanitizeDomain(domain) {
    domain = domain || "";
    domain = domain.replace(/\/*$/g, '') // Remove last /
      .trim(); // Remove first and last spaces;
    return domain;
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
    const result = Object.assign({}, this._props);
    if (this._user) {
      result.user = this._user.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }
    if (this._security_token) {
      result.security_token = this._security_token.toDto();
    }

    return result;
  }

  /**
   * Return a DTO ready to be sent the API to complete the registration or the recovery process.
   * @returns {object}
   */
  toCompleteDto() {
    return {
      authenticationtoken: {
        token: this.token
      },
      gpgkey: {
        armored_key: this.userPublicArmoredKey
      },
      user: {
        locale: this.locale
      }
    };
  }

  toGenerateGpgKeyDto(generateGpgKeyDto) {
    return {
      length: GenerateGpgKeyEntity.DEFAULT_LENGTH,
      ...generateGpgKeyDto,
      userId: `${this.user.profile.firstName} ${this.user.profile.lastName} <${this.user.username}>`
    };
  }

  toAccountDto() {
    const accountDto = {
      domain: this.domain,
      user_id: this.userId,
      user: this.user.toDto(UserEntity.ALL_CONTAIN_OPTIONS),
      user_public_armored_key: this.userPublicArmoredKey,
      user_private_armored_key: this.userPrivateArmoredKey,
      server_public_armored_key: this.serverPublicArmoredKey,
      security_token: this.securityToken.toDto(),
    };
    accountDto.user.locale = this.locale;
    return accountDto;
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
   * Get the registration token
   * @returns {string}
   */
  get token() {
    return this._props.token;
  }

  /**
   * Get the passphrase
   * @returns {string}
   */
  get passphrase() {
    return this._props.passphrase;
  }

  /**
   * Set the passphrase
   * @param {string} passphrase The passphrase
   * @throws EntityValidationError The parameter doesn't match the constraint of the property
   */
  set passphrase(passphrase) {
    EntitySchema.validateProp("passphrase", passphrase, SetupEntity.getSchema().properties.passphrase);
    this._props.passphrase = passphrase;
  }

  /**
   * Get the passphrase remember until logout flag
   * @returns {boolean}
   */
  get rememberUntilLogout() {
    return this._props.remember_until_logout;
  }

  /**
   * Set the passphrase remember until logout flag
   * @param {boolean} rememberUntilLogout The passphrase
   * @throws EntityValidationError The parameter doesn't match the constraint of the property
   */
  set rememberUntilLogout(rememberUntilLogout) {
    EntitySchema.validateProp("remember_until_logout", rememberUntilLogout, SetupEntity.getSchema().properties.remember_until_logout);
    this._props.remember_until_logout = rememberUntilLogout;
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
   * @param {string} armoredKey the armored key
   * @throws EntityValidationError The parameter doesn't match the constraint of the property
   */
  set userPublicArmoredKey(armoredKey) {
    EntitySchema.validateProp("user_public_armored_key", armoredKey, SetupEntity.getSchema().properties.user_public_armored_key);
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
   * @param {string} armoredKey the armored key
   * @throws EntityValidationError The parameter doesn't match the constraint of the property
   */
  set userPrivateArmoredKey(armoredKey) {
    EntitySchema.validateProp("user_private_armored_key", armoredKey, SetupEntity.getSchema().properties.user_private_armored_key);
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
   * @param {string} armoredKey the armored key
   * @throws EntityValidationError The parameter doesn't match the constraint of the property
   */
  set serverPublicArmoredKey(armoredKey) {
    EntitySchema.validateProp("server_public_armored_key", armoredKey, SetupEntity.getSchema().properties.server_public_armored_key);
    this._props.server_public_armored_key = armoredKey;
  }

  /**
   * Get the setup locale
   * @returns {(string|null)}
   */
  get locale() {
    return this._props.locale || null;
  }

  /**
   * Set the setup locale
   * @params {string} locale The locale
   */
  set locale(locale) {
    EntitySchema.validateProp("locale", locale, SetupEntity.getSchema().properties.locale);
    this._props.locale = locale;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */
  /**
   * Get the user
   * @returns {UserEntity|null}
   */
  get user() {
    return this._user || null;
  }

  /**
   * Set the user
   * @param {UserEntity} userEntity The user
   */
  set user(userEntity) {
    this._user = userEntity;
  }

  /**
   * Get security token
   * @returns {(SecurityTokenEntity|null)}
   */
  get securityToken() {
    return this._security_token || null;
  }

  /**
   * Set security token
   * @params {SecurityTokenEntity} securityTokenDto The security token
   */
  set securityToken(securityTokenDto) {
    this._security_token = securityTokenDto;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SetupEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.SetupEntity = SetupEntity;
