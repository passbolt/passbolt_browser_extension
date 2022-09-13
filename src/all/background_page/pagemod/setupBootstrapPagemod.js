/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
import {Worker} from "../model/worker";
import {App as app} from "../app";
import PageMod from "../sdk/page-mod";

const SetupBootstrap = function() {};
SetupBootstrap._pageMod = undefined;

SetupBootstrap.init = function() {
  if (typeof SetupBootstrap._pageMod !== 'undefined') {
    SetupBootstrap._pageMod.destroy();
    SetupBootstrap._pageMod = undefined;
  }
  const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
  // @deprecated url /setup/start with v3.6.0.
  const setupBootstrapRegex = `.*\/setup\/(install|start)\/${uuidRegex}\/${uuidRegex}`;
  SetupBootstrap._pageMod = new PageMod({
    name: 'SetupBootstrap',
    include: new RegExp(setupBootstrapRegex),
    contentScriptWhen: 'ready',
    contentStyleFile: [
      /*
       * @deprecated when support for v2 is dropped
       * used to control iframe styling without inline style in v3
       */
      'data/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'content_scripts/js/dist/vendors.js',
      'content_scripts/js/dist/setup.js',
    ],
    onAttach: function(worker) {
      // @todo refactoring-account-recovery, should we do something if the url doesn't parse.

      Worker.add('SetupBootstrap', worker);
      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};

export default SetupBootstrap;
