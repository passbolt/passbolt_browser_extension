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
 * @since         3.6.0
 */

const {GetGpgKeyInfoService} = require('../../service/crypto/getGpgKeyInfoService');
const {i18n} = require('../../sdk/i18n');

class ValidatePrivateGpgKeyController {
  /**
   * ValidateGpgKeyController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} key the key to validate.
   * @param {boolean} [ensureKeyNeverExpires] if true, do an extra check to ensure the key doesn't have a expiration date.
   */
  async _exec(key, ensureKeyNeverExpires = false) {
    try {
      await this.exec(key, ensureKeyNeverExpires);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the given user key information.
   *
   * @param {string} key the key to validate.
   * @param {boolean} ensureKeyNeverExpires if true, do an extra check to ensure the key doesn't have a expiration date.
   */
  async exec(key, ensureKeyNeverExpires) {
    let keyInfo;
    try {
      keyInfo = await GetGpgKeyInfoService.getKeyInfo(key);
    } catch (e) {
      console.error(e);
      throw new Error(i18n.t("The key should be a valid armored GPG key."));
    }

    if (keyInfo.revoked) {
      throw new Error(i18n.t("The private key should not be revoked."));
    } else if (keyInfo.isExpired) {
      throw new Error(i18n.t("The private key should not be expired."));
    } else if (keyInfo.expires !== "Never" && ensureKeyNeverExpires) {
      throw new Error(i18n.t("The private key should not have an expiry date."));
    } else if (!keyInfo.private) {
      throw new Error(i18n.t("The key should be private."));
    }
  }
}

exports.ValidatePrivateGpgKeyController = ValidatePrivateGpgKeyController;
