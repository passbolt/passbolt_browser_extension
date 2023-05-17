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
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import GpgAuth from "../model/gpgauth";
import AppInitController from "../controller/app/appInitController";
import {AppEvents} from "../event/appEvents";
import {ConfigEvents} from "../event/configEvents";
import {AuthEvents} from "../event/authEvents";
import {FolderEvents} from "../event/folderEvents";
import {ResourceEvents} from "../event/resourceEvents";
import {ResourceTypeEvents} from "../event/resourceTypeEvents";
import {RoleEvents} from "../event/roleEvents";
import {KeyringEvents} from "../event/keyringEvents";
import {SecretEvents} from "../event/secretEvents";
import {OrganizationSettingsEvents} from "../event/organizationSettingsEvents";
import {ShareEvents} from "../event/shareEvents";
import {SubscriptionEvents} from "../event/subscriptionEvents";
import {UserEvents} from "../event/userEvents";
import {GroupEvents} from "../event/groupEvents";
import {CommentEvents} from "../event/commentEvents";
import {TagEvents} from "../event/tagEvents";
import {FavoriteEvents} from "../event/favoriteEvents";
import {ImportResourcesEvents} from "../event/importResourcesEvents";
import {ExportResourcesEvents} from "../event/exportResourcesEvents";
import {ActionLogEvents} from "../event/actionLogEvents";
import {MultiFactorAuthenticationEvents} from "../event/multiFactorAuthenticationEvents";
import {ThemeEvents} from "../event/themeEvents";
import {LocaleEvents} from "../event/localeEvents";
import {PasswordGeneratorEvents} from "../event/passwordGeneratorEvents";
import {MobileEvents} from "../event/mobileEvents";
import {PownedPasswordEvents} from '../event/pownedPasswordEvents';
import {MfaEvents} from "../event/mfaEvents";
import {ClipboardEvents} from "../event/clipboardEvents";

class App extends Pagemod {
  /**
   * @inheritDoc
   * @returns {string}
   */
  get appName() {
    return "App";
  }

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
      PownedPasswordEvents,
      MfaEvents,
      ClipboardEvents
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

      // Init the application.
      const appInitController = new AppInitController();
      await appInitController.main();

      const account = await GetLegacyAccountService.get({role: true});
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

export default new App();
