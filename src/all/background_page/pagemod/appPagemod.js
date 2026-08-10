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
import AppInitController from "../controller/app/appInitController";
import { AppEvents } from "../event/appEvents";
import { ConfigEvents } from "../event/configEvents";
import { AuthEvents } from "../event/authEvents";
import { FolderEvents } from "../event/folderEvents";
import { ResourceEvents } from "../event/resourceEvents";
import { ResourceTypeEvents } from "../event/resourceTypeEvents";
import { RoleEvents } from "../event/roleEvents";
import { KeyringEvents } from "../event/keyringEvents";
import { SecretEvents } from "../event/secretEvents";
import { SiteSettingsEvents } from "../event/siteSettingsEvents";
import { ShareEvents } from "../event/shareEvents";
import { UserEvents } from "../event/userEvents";
import { GroupEvents } from "../event/groupEvents";
import { CommentEvents } from "../event/commentEvents";
import { ImportResourcesEvents } from "../event/importResourcesEvents";
import { ExportResourcesEvents } from "../event/exportResourcesEvents";
import { ActionLogEvents } from "../event/actionLogEvents";
import { MultiFactorAuthenticationEvents } from "../event/multiFactorAuthenticationEvents";
import { ThemeEvents } from "../event/themeEvents";
import { LocaleEvents } from "../event/localeEvents";
import { MobileEvents } from "../event/mobileEvents";
import { PownedPasswordEvents } from "../event/pownedPasswordEvents";
import { MfaEvents } from "../event/mfaEvents";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";
import { RememberMeEvents } from "../event/rememberMeEvents";
import CheckAuthStatusService from "../service/auth/checkAuthStatusService";
import GetActiveAccountService from "../service/account/getActiveAccountService";
import { PermissionEvents } from "../event/permissionEvents";
import { AccountEvents } from "../event/accountEvents";
import { AppSignOutEvents } from "../event/appSignOutEvents";
import UserApiService from "passbolt-styleguide/src/shared/services/api/user/userApiService";
import UserEntity from "../model/entity/user/userEntity";

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
      SiteSettingsEvents,
      ShareEvents,
      UserEvents,
      GroupEvents,
      CommentEvents,
      ImportResourcesEvents,
      ExportResourcesEvents,
      ActionLogEvents,
      MultiFactorAuthenticationEvents,
      ThemeEvents,
      LocaleEvents,
      MobileEvents,
      PownedPasswordEvents,
      MfaEvents,
      RememberMeEvents,
      PermissionEvents,
      AccountEvents,
    ];
  }

  get appSignOutEvent() {
    return [AppSignOutEvents];
  }

  /**
   * @inheritDoc
   */
  async attachEvents(port) {
    try {
      const tab = port._port.sender.tab;
      const account = await GetActiveAccountService.get();
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      const checkAuthStatusService = new CheckAuthStatusService(account, apiClientOptions);
      const authStatus = await checkAuthStatusService.checkAuthStatus(true);
      if (!authStatus.isAuthenticated || !authStatus.isMfaAuthenticated) {
        console.error("Can not attach application if user is not logged in, connect only app sign-out events.");
        for (const event of this.appSignOutEvent) {
          event.listen({ port, tab });
        }
        return;
      }

      // Init the application.
      const appInitController = new AppInitController();
      await appInitController.main();

      /*
       * Get the user from the API to add the role name into the account
       * This is used in some classes to add contain for API request or to throw an Error
       * - UserModel.updateLocalStorage
       * - FindAndUpdateUsersLocalStorageService.findAndUpdateAll
       * - ShareMetadataKeyPrivateService.shareOneMissing
       * - ShareMetadataKeyPrivateService.shareAllMissing
       *
       * If an issue happen the role name will not be updated and the App will start anyway with fewer permissions
       */
      try {
        // Load the application settings, necessary to validate the account username.
        const userApiService = new UserApiService(apiClientOptions);
        const userDto = await userApiService.get(account.userId, {
          role: true,
        });
        const userEntity = new UserEntity(userDto);
        // Add in the account the role name if the option object have role (only for authenticated user)
        account.set("role_name", userEntity.role?.name);
      } catch (error) {
        console.error("appPagemod::add role name to the account cannot be retrieved, some features could be missing.");
        console.error(error);
      }

      for (const event of this.events) {
        event.listen({ port, tab }, apiClientOptions, account);
      }
    } catch (error) {
      /*
       * Ensure the application does not crash completely if the legacy account cannot be retrieved.
       * The following controllers won't work as expected:
       * - AccountRecoverySaveUserSettingsController
       * - ReviewRequestController
       */
      console.error("appPagemod::attach legacy account cannot be retrieved, please contact your administrator.");
      console.error(error);
    }
  }
}

export default new App();
