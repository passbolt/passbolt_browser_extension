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
const {PageMod} = require('../sdk/page-mod');
const Worker = require('../model/worker');
const app = require('../app');

const RecoverBootstrap = function () {};
RecoverBootstrap._pageMod = undefined;

RecoverBootstrap.init = function () {
  if (typeof RecoverBootstrap._pageMod !== 'undefined') {
    RecoverBootstrap._pageMod.destroy();
    RecoverBootstrap._pageMod = undefined;
  }
  const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
  const recoverBootstrapRegex = `(.*)\/setup\/recover\/(${uuidRegex})\/(${uuidRegex})`;
  RecoverBootstrap._pageMod = new PageMod({
    name: 'RecoverBootstrap',
		include: new RegExp(recoverBootstrapRegex),
    contentScriptWhen: 'ready',
    contentStyleFile: [
      // @deprecated when support for v2 is dropped
      // used to control iframe styling without inline style in v3
      'data/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'content_scripts/js/dist/vendors.js',
      'content_scripts/js/dist/recover.js',
    ],
    onAttach: function (worker) {
      Worker.add('RecoverBootstrap', worker);
      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};

exports.RecoverBootstrap = RecoverBootstrap;
