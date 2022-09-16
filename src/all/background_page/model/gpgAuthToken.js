/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
import {Uuid} from "../utils/uuid";
import Validator from "validator";

class GpgAuthToken {
  /**
   * GpgAuthToken constructor
   * If a token is not provided one will be generated randomly
   *
   * @param {string} [token] optional The gpg authentication token
   * @throw {Error} if the token is not valid
   */
  constructor(token) {
    if (typeof token === 'undefined') {
      this.token = 'gpgauthv1.3.0|36|';
      this.token += Uuid.get();
      this.token += '|gpgauthv1.3.0';
    } else {
      const result = this.validate('token', token);
      if (result === true) {
        this.token = token;
      } else {
        throw result;
      }
    }
  }

  /**
   * Validate authentication token fields individually.
   *
   * @param {string} field The name of the field to validate
   * @param {string} value The value of the field to validate
   * @return {*} True or Error
   */
  validate(field, value) {
    let sections = [];
    switch (field) {
      case 'token' :
        if (typeof value === 'undefined' || value === '') {
          return new Error('The user authentication token cannot be empty');
        }
        sections = value.split('|');
        if (sections.length !== 4) {
          return new Error('The user authentication token is not in the right format');
        }
        if (sections[0] !== sections[3] && sections[0] !== 'gpgauthv1.3.0') {
          return new Error('Passbolt does not support this GPGAuth version');
        }
        if (sections[1] !== '36') {
          return new Error(`Passbolt does not support GPGAuth token nonce longer than 36 characters: ${sections[2]}`);
        }
        if (!Validator.isUUID(sections[2])) {
          return new Error('Passbolt does not support GPGAuth token nonce that are not UUIDs');
        }
        return true;
      default :
        return new Error(`No validation defined for field: ${field}`);
    }
  }
}

export default GpgAuthToken;
