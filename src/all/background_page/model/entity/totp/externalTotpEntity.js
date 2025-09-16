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
import TotpEntity from "passbolt-styleguide/src/shared/models/entity/totp/totpEntity";

const SUPPORTED_ALGORITHMS = ["SHA1", "SHA256", "SHA512"];
const DEFAULT_ALGORITHM = SUPPORTED_ALGORITHMS[0];
/**
 * External related to the TOTP
 */
class ExternalTotpEntity extends TotpEntity {
  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get resource id
   * @returns {string} base32 secret key
   */
  get secretKey() {
    return this._props.secret_key;
  }

  /**
   * Get period
   * @returns {number} period
   */
  get period() {
    return this._props.period;
  }

  /**
   * Get digits
   * @returns {number} digits
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

  /**
   * Create TOTP URL from an external resource entity
   * @param {ExternalResourceEntity} resource
   * @return {URL}
   */
  createUrlFromExternalResource(externalResourceEntity) {
    const name = externalResourceEntity.username
      ? `${externalResourceEntity.name}:${externalResourceEntity.username}`
      : externalResourceEntity.name;

    const url = new URL(`otpauth://totp/${encodeURIComponent(name)}`);
    url.searchParams.append("secret", this.secretKey);
    // Add issuer in the TOTP url if any
    if (externalResourceEntity.uris?.length > 0) {
      url.searchParams.append("issuer", encodeURIComponent(externalResourceEntity.uris[0]));
    }
    url.searchParams.append("algorithm", this.algorithm);
    url.searchParams.append("digits", this.digits.toString());
    url.searchParams.append("period", this.period.toString());
    return url;
  }

  /**
   * Create TOTP from URL
   * @param url {URL}
   * @return {ExternalTotpEntity}
   */
  static createTotpFromUrl(url) {
    const totp = {
      secret_key: url.searchParams.get('secret'),
      algorithm: url.searchParams.get('algorithm') || DEFAULT_ALGORITHM,
      digits: parseInt(url.searchParams.get('digits'), 10) || 6,
      period: parseInt(url.searchParams.get('period'), 10) || 30,
    };
    return new ExternalTotpEntity(totp);
  }

  /**
   * Create TOTP from kdbx windows
   * @param fields {Object}
   * @return {ExternalTotpEntity}
   */
  static createTotpFromKdbxWindows(fields) {
    const totp = {
      secret_key: fields.get('TimeOtp-Secret-Base32').getText(),
      algorithm: fields.get('TimeOtp-Algorithm')?.slice(5).replace('-', '') || DEFAULT_ALGORITHM,
      digits:  parseInt(fields.get('TimeOtp-Length'), 10) || 6,
      period: parseInt(fields.get('TimeOtp-Period'), 10) || 30
    };
    return new ExternalTotpEntity(totp);
  }

  /**
   * Create TOTP from lastpass CSV.
   * Lastpass seems to export a base-32 secret only as shown on their import sample:
   * https://support.lastpass.com/s/document-item?language=en_US&bundleId=lastpass&topicId=LastPass/lastpass_technical_whitepaper.html&_LANG=enus
   * @param secretKey {string} The secret key from last pass.
   * @return {ExternalTotpEntity}
   */
  static createTotpFromLastpassCSV(secretKey) {
    const dto = {
      secret_key: secretKey,
      algorithm: DEFAULT_ALGORITHM, // Default algorithm
      digits: 6, // Default digits
      period: 30 // Default period
    };
    return new ExternalTotpEntity(dto);
  }
}

export default ExternalTotpEntity;
