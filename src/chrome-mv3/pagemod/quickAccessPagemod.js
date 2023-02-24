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
import {AuthEvents} from "../../all/background_page/event/authEvents";
import {ConfigEvents} from "../../all/background_page/event/configEvents";
import {KeyringEvents} from "../../all/background_page/event/keyringEvents";
import {QuickAccessEvents} from "../../all/background_page/event/quickAccessEvents";
import {GroupEvents} from "../../all/background_page/event/groupEvents";
import {TagEvents} from "../../all/background_page/event/tagEvents";
import {ResourceEvents} from "../../all/background_page/event/resourceEvents";
import {SecretEvents} from "../../all/background_page/event/secretEvents";
import {OrganizationSettingsEvents} from "../../all/background_page/event/organizationSettingsEvents";
import {TabEvents} from "../../all/background_page/event/tabEvents";
import {LocaleEvents} from "../../all/background_page/event/localeEvents";
import {PasswordGeneratorEvents} from "../../all/background_page/event/passwordGeneratorEvents";

class QuickAccess extends Pagemod {
  /**
   * @inheritDoc
   */
  get events() {
    return [
      AuthEvents,
      ConfigEvents,
      KeyringEvents,
      QuickAccessEvents,
      GroupEvents,
      TagEvents,
      ResourceEvents,
      SecretEvents,
      OrganizationSettingsEvents,
      TabEvents,
      LocaleEvents,
      PasswordGeneratorEvents
    ];
  }
}

export default new QuickAccess('QuickAccess');
