/**
 * Clipboard iframe pagemod.
 *
 * This pagemod drives the iframe used when the user want to add something to the clipboard
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import {Worker} from "../model/worker";
import PageMod from "../sdk/page-mod";

const Clipboard = function() {};
Clipboard._pageMod = undefined;

Clipboard.init = function() {
  if (typeof Clipboard._pageMod !== 'undefined') {
    Clipboard._pageMod.destroy();
    Clipboard._pageMod = undefined;
  }

  Clipboard._pageMod = new PageMod({
    name: 'Clipboard',
    include: 'about:blank?passbolt=passbolt-iframe-clipboard',

    contentScriptFile: [
      /*
       * Warning: Iframe script and styles need to be modified in
       * chrome/data/passbolt-iframe-clipboard.html
       */
    ],
    contentScriptWhen: 'ready',
    onAttach: function(worker) {
      Worker.add('ClipboardIframe', worker);
    }
  });
};
export default Clipboard;
