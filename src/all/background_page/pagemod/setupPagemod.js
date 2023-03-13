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
import {ConfigEvents} from "../event/configEvents";
import BuildApiClientOptionsService
  from "../service/account/buildApiClientOptionsService";
import {SetupEvents} from "../event/setupEvents";
import BuildAccountSetupService from "../service/setup/buildAccountSetupService";
import {PownedPasswordEvents} from "../event/pownedPasswordEvents";
import OrganizationSettingsModel from "../model/organizationSettings/organizationSettingsModel";

class Setup extends Pagemod {
  /**
   * @inheritDoc
   * @returns {string}
   */
  get appName() {
    return "Setup";
  }

  /**
   * @inheritDoc
   */
  get events() {
    return [ConfigEvents, SetupEvents, PownedPasswordEvents];
  }

  /**
   * @inheritDoc
   */
  async attachEvents(port) {
    try {
      const tab = port._port.sender.tab;
      const account = BuildAccountSetupService.buildFromSetupUrl(tab.url);
      const apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
      await (new OrganizationSettingsModel(apiClientOptions)).getOrFind(true);
      for (const event of this.events) {
        event.listen({port, tab}, apiClientOptions, account);
      }
    } catch (error) {
      // Unexpected error, this pagemod shouldn't have been initialized as the bootstrapRecoverPagemod should have raised an exception and not inject this iframe.
      console.error(error);
    }
  }
}

export default new Setup();
