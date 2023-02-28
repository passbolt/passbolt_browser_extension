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
import GetLegacyAccountService from "../../all/background_page/service/account/getLegacyAccountService";
import GpgAuth from "../../all/background_page/model/gpgauth";
import {AppEvents} from "../../all/background_page/event/appEvents";
import {ConfigEvents} from "../../all/background_page/event/configEvents";
import {AuthEvents} from "../../all/background_page/event/authEvents";
import {FolderEvents} from "../../all/background_page/event/folderEvents";
import {ResourceEvents} from "../../all/background_page/event/resourceEvents";
import {ResourceTypeEvents} from "../../all/background_page/event/resourceTypeEvents";
import {RoleEvents} from "../../all/background_page/event/roleEvents";
import {KeyringEvents} from "../../all/background_page/event/keyringEvents";
import {SecretEvents} from "../../all/background_page/event/secretEvents";
import {OrganizationSettingsEvents} from "../../all/background_page/event/organizationSettingsEvents";
import {ShareEvents} from "../../all/background_page/event/shareEvents";
import {SubscriptionEvents} from "../../all/background_page/event/subscriptionEvents";
import {UserEvents} from "../../all/background_page/event/userEvents";
import {GroupEvents} from "../../all/background_page/event/groupEvents";
import {CommentEvents} from "../../all/background_page/event/commentEvents";
import {TagEvents} from "../../all/background_page/event/tagEvents";
import {FavoriteEvents} from "../../all/background_page/event/favoriteEvents";
import {ImportResourcesEvents} from "../../all/background_page/event/importResourcesEvents";
import {ExportResourcesEvents} from "../../all/background_page/event/exportResourcesEvents";
import {ActionLogEvents} from "../../all/background_page/event/actionLogEvents";
import {MultiFactorAuthenticationEvents} from "../../all/background_page/event/multiFactorAuthenticationEvents";
import {ThemeEvents} from "../../all/background_page/event/themeEvents";
import {LocaleEvents} from "../../all/background_page/event/localeEvents";
import {PasswordGeneratorEvents} from "../../all/background_page/event/passwordGeneratorEvents";
import {MobileEvents} from "../../all/background_page/event/mobileEvents";
import {PownedPasswordEvents} from '../../all/background_page/event/pownedPasswordEvents';

class App extends Pagemod {
  /**
   * @inheritDoc
   */
  get events() {
    return [
      ConfigEvents,
      AppEvents,
      AuthEvents,
      FolderEvents,
      ResourceEvents,
      ResourceTypeEvents,
      RoleEvents,
      KeyringEvents,
      SecretEvents,
      OrganizationSettingsEvents,
      ShareEvents,
      SubscriptionEvents,
      UserEvents,
      GroupEvents,
      CommentEvents,
      TagEvents,
      FavoriteEvents,
      ImportResourcesEvents,
      ExportResourcesEvents,
      ActionLogEvents,
      MultiFactorAuthenticationEvents,
      ThemeEvents,
      LocaleEvents,
      PasswordGeneratorEvents,
      MobileEvents,
      PownedPasswordEvents
    ];
  }

  /**
   * @inheritDoc
   */
  async attachEvents(port) {
    try {
      const tab = port._port.sender.tab;
      const auth = new GpgAuth();
      if (!await auth.isAuthenticated() || await auth.isMfaRequired()) {
        console.error('Can not attach application if user is not logged in.');
        return;
      }

      const account = await GetLegacyAccountService.get();
      for (const event of this.events) {
        event.listen({port, tab}, account);
      }
    } catch (error) {
      /*
       * Ensure the application does not crash completely if the legacy account cannot be retrieved.
       * The following controllers won't work as expected:
       * - AccountRecoverySaveUserSettingsController
       * - ReviewRequestController
       */
      console.error('appPagemod::attach legacy account cannot be retrieved, please contact your administrator.');
      console.error(error);
    }
  }
}

export default new App('App');
