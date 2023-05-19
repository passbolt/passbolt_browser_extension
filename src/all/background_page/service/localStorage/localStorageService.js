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
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourceTypeLocalStorage from "../local_storage/resourceTypeLocalStorage";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import AuthStatusLocalStorage from "../local_storage/authStatusLocalStorage";
import UserLocalStorage from "../local_storage/userLocalStorage";
import GroupLocalStorage from "../local_storage/groupLocalStorage";
import RolesLocalStorage from "../local_storage/rolesLocalStorage";
import PasswordGeneratorLocalStorage
  from "../local_storage/passwordGeneratorLocalStorage";
import PostponedUserSettingInvitationService
  from "../api/invitation/postponedUserSettingInvitationService";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import SsoKitTemporaryStorageService
  from "../session_storage/ssoKitTemporaryStorageService";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import RbacsLocalStorage from "../local_storage/rbacLocalStorage";

class LocalStorageService {
  /**
   * Flush all storage
   */
  static async flush() {
    ResourceLocalStorage.flush();
    ResourceTypeLocalStorage.flush();
    FolderLocalStorage.flush();
    AuthStatusLocalStorage.flush();
    UserLocalStorage.flush();
    GroupLocalStorage.flush();
    RolesLocalStorage.flush();
    PasswordGeneratorLocalStorage.flush();
    PostponedUserSettingInvitationService.reset();
    PassphraseStorageService.flush();
    SsoKitTemporaryStorageService.flush();
    const account = await GetLegacyAccountService.get();
    const rbacsLocalStorage = new RbacsLocalStorage(account);
    rbacsLocalStorage.flush();
  }
}

export default LocalStorageService;
