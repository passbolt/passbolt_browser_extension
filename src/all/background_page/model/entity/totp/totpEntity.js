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
 * @since         4.5.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Totp';
const RESOURCE_TOTP_KEY_MAX_LENGTH = 1024;
const SUPPORTED_ALGORITHMS = ["SHA1", "SHA256", "SHA512"];
/**
 * Entity related to the TOTP
 */
class TotpEntity extends Entity {
  /**
   * totp entity constructor
   *
   * @param {Object} totpDto totp DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(totpDto) {
    super(EntitySchema.validate(
      TotpEntity.ENTITY_NAME,
      totpDto,
      TotpEntity.getSchema()
    ));
  }

  /**
   * Get current view model schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: [
        "secret_key",
        "period",
        "digits",
        "algorithm",
      ],
      properties: {
        secret_key: {
          type: "string",
          notEmpty: true,
          pattern: /^[A-Z2-7]+=*$/, // BASE32
          maxLength: RESOURCE_TOTP_KEY_MAX_LENGTH
        },
        period: {
          type: "number",
          gte: 1
        },
        digits: {
          type: "number",
          lte: 8,
          gte: 6
        },
        algorithm: {
          type: "string",
          notEmpty: true,
          enum: SUPPORTED_ALGORITHMS
        }
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get resource id
   * @returns {string} base32 secret key
   */
  get secret_key() {
    return this._props.secret_key;
  }

  /**
   * Get period
   * @returns {numbers} period
   */
  get period() {
    return this._props.period;
  }

  /**
   * Get digits
   * @returns {numbers} digits
   */
  get digits() {
    return this._props.digits;
  }

  /**
   * Get algorithm
   * @returns {string} algorithm
   */
  get algorithm() {
    return this._props.algorithm;
  }

  /*
   * ==================================================
   * Methods
   * ==================================================
   */
  /**
   * Create URL from TOTP
   * @param {ExternalResourceEntity} resource
   * @return {URL}
   */
  createUrlFromResource(resource) {
    const name = resource.username ? `${resource.name}:${resource.username}` : resource.name;
    const url = new URL(`otpauth://totp/${encodeURIComponent(name)}`);
    url.searchParams.append("secret", this.secret_key.replaceAll(/\s+/g, "").toUpperCase());
    // Add issuer in the TOTP url if any
    if (resource.uri.length > 0) {
      url.searchParams.append("issuer", encodeURIComponent(resource.uri));
    }
    url.searchParams.append("algorithm", this.algorithm);
    url.searchParams.append("digits", this.digits.toString());
    url.searchParams.append("period", this.period.toString());
    return url;
  }

  /*
   * ==================================================
   * Build rules
   * ==================================================
   */
  /**
   * Create TOTP from URL
   * @param url {URL}
   * @return {TotpEntity}
   */
  static createTotpFromUrl(url) {
    const totp = {
      secret_key: url.searchParams.get('secret').toUpperCase(),
      algorithm: url.searchParams.get('algorithm')?.toUpperCase() || SUPPORTED_ALGORITHMS[0],
      digits: parseInt(url.searchParams.get('digits'), 10) || 6,
      period: parseInt(url.searchParams.get('period'), 10) || 30,
    };
    return new TotpEntity(totp);
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default TotpEntity;
