/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import Pagemod from "./pagemod";
import {InformMenuEvents} from "../event/informMenuEvents";
import GetLegacyAccountService from "../service/account/getLegacyAccountService";

class InFormMenu extends Pagemod {
  /**
   * @inheritDoc
   * @returns {string}
   */
  get appName() {
    return "InFormMenu";
  }

  /**
   * @inheritDoc
   */
  get events() {
    return [InformMenuEvents];
  }

  /**
   * @inheritDoc
   */
  async attachEvents(port) {
    let account;
    try {
      account = await GetLegacyAccountService.get();
    } catch (error) {
      //Ensure the application does not crash completely if the legacy account cannot be retrieved
      console.error('InformMenuPagemod::attach legacy account cannot be retrieved, please contact your administrator.');
      console.error(error);
    }

    const worker = {port: port, tab: port._port.sender.tab, name: this.appName};
    for (const event of this.events) {
      event.listen(worker, null, account);
    }
  }
}

export default new InFormMenu();
