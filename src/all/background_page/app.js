/**
 * Main include file.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/*
 * ===================================================================================
 *  Events
 *
 *  Events help the addon code interact with content code via content/workers
 *  given by the pagemod. Read more about it here:
 *  https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/content_worker
 *
 *  These section contain events includes that is reusable by the listeners
 *  themselves. This allows to factorize some code common to many listeners.
 *  For example multiple listeners will be will interested in sending/receiving
 *  encryption and decryption events.
 * ==================================================================================
 */
import {AppEvents} from "./event/appEvents";
import {AppBootstrapEvents} from "./event/appBootstrapEvents";
import {ActionLogEvents} from "./event/actionLogEvents";
import {AuthEvents} from "./event/authEvents";
import {CommentEvents} from "./event/commentEvents";
import {ConfigEvents} from "./event/configEvents";
import {ExportResourcesEvents} from "./event/exportResourcesEvents";
import {FavoriteEvents} from "./event/favoriteEvents";
import {FolderEvents} from "./event/folderEvents";
import {GroupEvents} from "./event/groupEvents";
import {ImportResourcesEvents} from "./event/importResourcesEvents";
import {KeyringEvents} from "./event/keyringEvents";
import {QuickAccessEvents} from "./event/quickAccessEvents";
import {MultiFactorAuthenticationEvents} from "./event/multiFactorAuthenticationEvents";
import {RecoverEvents} from "./event/recoverEvents";
import {ResourceEvents} from "./event/resourceEvents";
import {ResourceTypeEvents} from "./event/resourceTypeEvents";
import {RoleEvents} from "./event/roleEvents";
import {SecretEvents} from "./event/secretEvents";
import {SetupEvents} from "./event/setupEvents";
import {ShareEvents} from "./event/shareEvents";
import {SubscriptionEvents} from "./event/subscriptionEvents";
import {TabEvents} from "./event/tabEvents";
import {TagEvents} from "./event/tagEvents";
import {ThemeEvents} from "./event/themeEvents";
import {UserEvents} from "./event/userEvents";
import {OrganizationSettingsEvents} from "./event/organizationSettingsEvents";
import {LocaleEvents} from "./event/localeEvents";
import {PasswordGeneratorEvents} from "./event/passwordGeneratorEvents";
import {MobileEvents} from "./event/mobileEvents";
import {AccountRecoveryEvents} from "./event/accountRecoveryEvents";
import {InformCallToActionEvents} from "./event/informCallToActionEvents";
import {InformMenuEvents} from "./event/informMenuEvents";
import {WebIntegrationEvents} from "./event/webIntegrationEvents";
import {PublicWebsiteSignInEvents} from "./event/publicWebsiteSignInEvents";
import {ClipboardEvents} from "./event/clipboardEvents";
import WebIntegration from "./pagemod/webIntegrationPagemod";
import AppBootstrapPagemod from "./pagemod/appBootstrapPagemod";
import {AppPagemod} from "./pagemod/appPagemod";
import AuthBootstrap from "./pagemod/authBootstrapPagemod";
import Auth from "./pagemod/authPagemod";
import SetupBootstrap from "./pagemod/setupBootstrapPagemod";
import Setup from "./pagemod/setupPagemod";
import RecoverBootstrap from "./pagemod/recoverBootstrapPagemod";
import AccountRecoveryBootstrap from "./pagemod/accountRecoveryBootstrapPagemod";
import AccountRecovery from "./pagemod/accountRecoveryPagemod";
import QuickAccess from "./pagemod/quickAccessPagemod";
import File from "./pagemod/filePagemod";
import InFormCallToAction from "./pagemod/inFormCallToActionPagemod";
import InFormMenu from "./pagemod/informMenuPagemod";
import PublicWebsiteSignIn from "./pagemod/publicWebsiteSignInPagemod";
import Recover from "./pagemod/recoverPagemod";
import {MfaEvents} from './event/mfaEvents';
import {PownedPasswordEvents} from './event/pownedPasswordEvents';

const events = {};
events.app = AppEvents;
events.appBootstrap = AppBootstrapEvents;
events.actionLogs = ActionLogEvents;
events.auth = AuthEvents;
events.comment = CommentEvents;
events.config = ConfigEvents;
events.exportResources = ExportResourcesEvents;
events.favorite = FavoriteEvents;
events.folder = FolderEvents;
events.group = GroupEvents;
events.importResources = ImportResourcesEvents;
events.keyring = KeyringEvents;
events.quickAccess = QuickAccessEvents;
events.multiFactorAuthentication = MultiFactorAuthenticationEvents;
events.recover = RecoverEvents;
events.resource = ResourceEvents;
events.resourceType = ResourceTypeEvents;
events.role = RoleEvents;
events.secret = SecretEvents;
events.setup = SetupEvents;
events.share = ShareEvents;
events.subscription = SubscriptionEvents;
events.tab = TabEvents;
events.tag = TagEvents;
events.theme = ThemeEvents;
events.user = UserEvents;
events.organizationSettings = OrganizationSettingsEvents;
events.locale = LocaleEvents;
events.passwordGenerator = PasswordGeneratorEvents;
events.mobile = MobileEvents;
events.accountRecovery = AccountRecoveryEvents;
events.informCallToAction = InformCallToActionEvents;
events.informMenu = InformMenuEvents;
events.webIntegration = WebIntegrationEvents;
events.publicWebsiteSignIn = PublicWebsiteSignInEvents;
events.mfaPolicy = MfaEvents;
events.clipboard = ClipboardEvents;
events.pownedPassword = PownedPasswordEvents;

/*
 * ==================================================================================
 *  Page mods
 *  Run scripts in the context of web pages whose URL matches a given pattern.
 *  see. https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
 * ==================================================================================
 */

/*
 * Content code callbacks are UUIDs generated by the content code and mapped with an anonymous
 * function on the content code side. This UUID is given to the add-on code when the content code
 * is triggering a request for a process managed at the addon level such as encrypt or decrypt.
 * We cannot give directly the function reference since the add-on and content code can only
 * communicate via text.
 */
const callbacks = {};

/*
 * We use this variables to store the references to the pagemods
 * It is usefull for example to re-initialize pagemods after a configuration changes
 * for example when you change the list of domains that you are running passbolt on
 */
const pageMods = {};

/*
 * This pagemod allows inserting classes to help any page
 * to know about the status of the extension, in a modernizr fashion
 * It also helps the plugin to recognise if a page behave like a passbolt app
 */
pageMods.WebIntegration = WebIntegration;

/*
 * This pagemod drives the main addon app
 * It is inserted in all the pages of a domain that is trusted.
 * Such trust is defined during the first step of the setup process.
 */
pageMods.AppBoostrap = AppBootstrapPagemod;

/*
 * This pagemod drives the react application.
 */
pageMods.App = AppPagemod;

/*
 * This pagemod drives the login / authentication
 */
pageMods.AuthBootstrap = AuthBootstrap;

/*
 * This pagemod drives the login passphrase capture
 */
pageMods.Auth = Auth;

/*
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */
pageMods.SetupBootstrap = SetupBootstrap;

/*
 * This page mod drives the reset of setup process
 * The reset of the setup process is driven on the add-on side, see in ../data/passbolt-iframe-setup.html
 */
pageMods.Setup = Setup;

/*
 * This pagemod help bootstrap the first step of the recover process from a passbolt server app page
 * The pattern for this url, driving the recover bootstrap, is defined in config.json
 */
pageMods.RecoverBootstrap = RecoverBootstrap;

/*
 * This page mod drives the reset of recover process
 * The reset of the setup process is driven on the add-on side, see in ../data/passbolt-iframe-recover.html
 */
pageMods.Recover = Recover;

/*
 * This pagemod helps bootstrap the account recovery application to inject on a passbolt served page.
 */
pageMods.AccountRecoveryBootstrap = AccountRecoveryBootstrap;

/*
 * This page mod drives the account recovery process
 * The account recovery process is driven on the add-on side, see in ../data/passbolt-iframe-account-recovery.html
 */
pageMods.AccountRecovery = AccountRecovery;

/*
 * This page mod drives the reset of setup process
 * The reset of the setup process is driven on the add-on side, see in ../data/quickaccess.html
 */
pageMods.QuickAccess = QuickAccess;

/*
 * This pagemod drives the file iframe tool
 */
pageMods.File = File;

/*
 * This pagemod drives the inform menu cta iframe tool
 */
pageMods.InFormMenuCTA = InFormCallToAction;

/*
 * This pagemod drives the inform menu iframe tool
 */
pageMods.InFormMenu = InFormMenu;

/*
 * This pagemod drives the sign in extension
 * It updates the sign in buttons on the passbolt.com pages.
 */
pageMods.PublicWebsiteSignIn = PublicWebsiteSignIn;

export const App = {events, callbacks, pageMods};
