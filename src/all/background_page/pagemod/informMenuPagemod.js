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
import PageMod from "../sdk/page-mod";
import {App as app} from "../app";

const InFormMenu = function() {};
InFormMenu._pageMod = undefined;

InFormMenu.init = function() {
  if (typeof InFormMenu._pageMod !== 'undefined') {
    InFormMenu._pageMod.destroy();
    InFormMenu._pageMod = undefined;
  }

  InFormMenu._pageMod = new PageMod({
    name: 'InFormMenu',
    include: 'about:blank?passbolt=passbolt-iframe-in-form-menu',
    contentScriptWhen: 'ready',
    contentScriptFile: [
      /*
       * Warning: script and styles need to be modified in
       * chrome/data/passbolt-iframe-in-form-menu.html
       */
    ],
    onAttach: function(worker) {
      app.events.informMenu.listen(worker);

      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};

export default InFormMenu;
