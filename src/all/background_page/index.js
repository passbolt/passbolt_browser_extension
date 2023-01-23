/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import storage from "./sdk/storage";
/*
 * Listen to browser events such as browser extension installation. As per the documentation
 * the listeners must be registered synchronously from the start of the page.
 */
import './event/browser/browserEvents.js';
import * as openpgp from 'openpgp';
import GpgAuth from "./model/gpgauth";
import User from "./model/user";
import AuthStatusLocalStorage from "./service/local_storage/authStatusLocalStorage";
import ResourceLocalStorage from "./service/local_storage/resourceLocalStorage";
import ResourceTypeLocalStorage from "./service/local_storage/resourceTypeLocalStorage";
import FolderLocalStorage from "./service/local_storage/folderLocalStorage";
import UserLocalStorage from "./service/local_storage/userLocalStorage";
import GroupLocalStorage from "./service/local_storage/groupLocalStorage";
import RolesLocalStorage from "./service/local_storage/rolesLocalStorage";
import PasswordGeneratorLocalStorage from "./service/local_storage/passwordGeneratorLocalStorage";
import ToolbarController from "./controller/toolbarController";
import {App} from "./app";
import Log from "./model/log";
import {Config} from "./model/config";
import PassphraseStorageService from "./service/session_storage/passphraseStorageService";
import SsoKitTemporaryStorageService from "./service/session_storage/ssoKitTemporaryStorageService";
import PostponedUserSettingInvitationService from './service/api/invitation/postponedUserSettingInvitationService';

const main = async function() {
  /*
   * ==================================================================================
   *  Initialization of global objects
   * ==================================================================================
   */
  Log.init();
  Config.init();
  User.init();
  ResourceLocalStorage.init();
  ResourceTypeLocalStorage.init();
  FolderLocalStorage.init();
  AuthStatusLocalStorage.init();
  UserLocalStorage.init();
  GroupLocalStorage.init();
  RolesLocalStorage.init();
  PasswordGeneratorLocalStorage.init();
  PostponedUserSettingInvitationService.init();
  await PassphraseStorageService.init();
  await SsoKitTemporaryStorageService.init();

  // Openpgpjs worker initialization
  /**
   * This option is needed because some secrets were encrypted using non-encryption RSA keys,
   * due to an openpgpjs bug: https://github.com/openpgpjs/openpgpjs/pull/1148
   */
  openpgp.config.allowInsecureDecryptionWithSigningKeys = true;
  /*
   * ==================================================================================
   *  Interface changes
   *  Where we affect the look and feel of the firefox instance
   * ==================================================================================
   */
  new ToolbarController();

  /*
   * ==================================================================================
   *  Page mods init
   *  Run scripts in the context of web pages whose URL matches a given pattern.
   *  see. https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
   * ==================================================================================
   */
  const pageMods = App.pageMods;

  // If the user is valid we enable the web integration and login pagemod
  const user = User.getInstance();
  if (user.isValid()) {
    // Web Integration pagemod init can also be triggered by setup and user events (e.g. when config change)
    pageMods.WebIntegration.init();
    // Auth pagemod init can also be triggered by setup and user events (e.g. when config change)
    pageMods.AuthBootstrap.init();
    // Sign In pagemod init can also be triggered by setup and user events (e.g. when config change)
    pageMods.PublicWebsiteSignIn.init();

    /*
     * App pagemod init is generally triggered after a successful login
     * We only initialize it here for the cases where the user is already logged in
     * It can happen when the extension is updated
     */
    const auth = new GpgAuth();
    try {
      const isAuthenticated = await auth.isAuthenticated();
      if (isAuthenticated) {
        await pageMods.AppBoostrap.init();
        auth.startCheckAuthStatusLoop();
        const event = new Event('passbolt.auth.after-login');
        self.dispatchEvent(event);
      }
    } catch (error) {
      /*
       * Service unavailable
       * Do nothing...
       */
    }
  }

  // Setup/recover/account recovery pagemods
  pageMods.SetupBootstrap.init();
  pageMods.Setup.init();
  pageMods.RecoverBootstrap.init();
  pageMods.Recover.init();
  pageMods.AccountRecoveryBootstrap.init();
  pageMods.AccountRecovery.init();

  /*
   * Other pagemods active all the time
   * but triggered by App or Auth
   */
  pageMods.File.init();
  pageMods.Auth.init();
  pageMods.QuickAccess.init();
  pageMods.InFormMenuCTA.init();
  pageMods.InFormMenu.init();
  pageMods.App.init();
};

// Init storage and get going.
storage.init()
  .then(() => {
    main();
  });
