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
import ResourceLocalStorage from "../../../all/background_page/service/local_storage/resourceLocalStorage";
import ResourceTypeLocalStorage from "../../../all/background_page/service/local_storage/resourceTypeLocalStorage";
import FolderLocalStorage from "../../../all/background_page/service/local_storage/folderLocalStorage";
import AuthStatusLocalStorage from "../../../all/background_page/service/local_storage/authStatusLocalStorage";
import UserLocalStorage from "../../../all/background_page/service/local_storage/userLocalStorage";
import GroupLocalStorage from "../../../all/background_page/service/local_storage/groupLocalStorage";
import RolesLocalStorage from "../../../all/background_page/service/local_storage/rolesLocalStorage";
import PasswordGeneratorLocalStorage
  from "../../../all/background_page/service/local_storage/passwordGeneratorLocalStorage";
import PostponedUserSettingInvitationService
  from "../../../all/background_page/service/api/invitation/postponedUserSettingInvitationService";
import PassphraseStorageService from "../../../all/background_page/service/session_storage/passphraseStorageService";
import SsoKitTemporaryStorageService
  from "../../../all/background_page/service/session_storage/ssoKitTemporaryStorageService";

class LocalStorageService {
  /**
   * Flush all storage
   */
  static flush() {
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
  }
}

export default LocalStorageService;
