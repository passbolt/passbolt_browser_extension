/**
 * Passbolt Auth pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import {Worker} from "../model/worker";
import PageMod from "../sdk/page-mod";
import PassphraseStorageService from "../service/session_storage/passphraseStorageService";
import ParseAuthUrlService from "../service/auth/parseAuthUrlService";

const AuthBootstrap = function() {};
AuthBootstrap._pageMod = undefined;

AuthBootstrap.init = function() {
  if (typeof AuthBootstrap._pageMod !== 'undefined') {
    AuthBootstrap._pageMod.destroy();
    AuthBootstrap._pageMod = undefined;
  }

  /*
   * The pagemod will be attached to the following pages:
   * ✓ https://demo.passbolt.com/auth/login
   * ✓ https://demo.passbolt.com/auth/login/
   * ✓ https://demo.passbolt.com/auth/login#checkthis
   * ✓ https://demo.passbolt.com/auth/login?redirect=%2somewhere
   * ✓ https://demo.passbolt.com/auth/login?redirect=%2somewhere#nice
   * ✗ https://demoxpassbolt.com/auth/login
   * ✗ https://demo.passbolt.com/auth/login/nope
   */
  AuthBootstrap._pageMod = new PageMod({
    name: 'AuthBootstrap',
    include: ParseAuthUrlService.regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      /*
       * @deprecated when support for v2 is dropped
       * used to control iframe styling without inline style in v3
       */
      'webAccessibleResources/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'contentScripts/js/dist/vendors.js',
      'contentScripts/js/dist/login.js',
    ],
    attachTo: {existing: true, reload: true},
    onAttach: async function(worker) {
      await PassphraseStorageService.flush();

      Worker.add('AuthBootstrap', worker);
    }
  });
};
export default AuthBootstrap;
