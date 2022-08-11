
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
 * @since         3.7.0
 */
import PublicWebsiteSignInController from "../controller/publicWebsiteSignIn/publicWebsiteSignInController";

/**
 * Listens the public website sign in events
 * @param {Worker} worker The worker
 * @param {AccountEntity} account The account completing the account recovery
 */
const listen = function(worker, account) {
  worker.port.on('passbolt.extension.sign-in-url', async requestId => {
    const controller = new PublicWebsiteSignInController(worker, requestId, account);
    await controller._exec();
  });
};

export const PublicWebsiteSignInEvents = {listen};
