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

const InFormCallToAction = function() {};
InFormCallToAction._pageMod = undefined;

InFormCallToAction.init = function() {
  if (typeof InFormCallToAction._pageMod !== 'undefined') {
    InFormCallToAction._pageMod.destroy();
    InFormCallToAction._pageMod = undefined;
  }

  InFormCallToAction._pageMod = new PageMod({
    name: 'InFormCallToAction',
    include: 'about:blank?passbolt=passbolt-iframe-informcalltoaction',
    contentScriptWhen: 'ready',
    contentScriptFile: [
      /*
       * Warning: script and styles need to be modified in
       * chrome/data/passbolt-iframe-in-form-call-to-action.html
       */
    ],
    onAttach: function(worker) {
      app.events.informCallToAction.listen(worker);
    }
  });
};

export default InFormCallToAction;
