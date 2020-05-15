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
 * @since         2.13.0
 */
const Config = require('../../model/config');
const {GpgAuth} = require('../../model/gpgauth');
const {Keyring} = require('../../model/keyring');

class AuthUpdateServerKeyController {

  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.auth = new GpgAuth();
    this.keyring = new Keyring();
  }

  async main() {
    try {
      const domain = Config.read('user.settings.trustedDomain');
      const serverKey = await this.auth.getServerKey(domain);
      await this.keyring.importServerPublicKey(serverKey.keydata, domain);
      this.worker.port.emit(this.requestId, 'SUCCESS', domain);
    } catch (error) {
      this.worker.port.emit(this.requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }
  }
}

exports.AuthUpdateServerKeyController = AuthUpdateServerKeyController;
