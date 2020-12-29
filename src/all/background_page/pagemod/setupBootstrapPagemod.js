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

const SetupBootstrap = function () {};
SetupBootstrap._pageMod = undefined;

SetupBootstrap.init = function () {
  if (typeof SetupBootstrap._pageMod !== 'undefined') {
    SetupBootstrap._pageMod.destroy();
    SetupBootstrap._pageMod = undefined;
  }
  const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
  const setupBootstrapRegex = `(.*)\/setup\/install\/(${uuidRegex})\/(${uuidRegex})`;
  SetupBootstrap._pageMod = new PageMod({
    name: 'SetupBootstrap',
		include: new RegExp(setupBootstrapRegex),
    contentScriptWhen: 'ready',
    contentScriptFile: [
      'content_scripts/js/dist/vendors.js',
      'content_scripts/js/dist/setup.js',
    ],
    onAttach: function (worker) {
      Worker.add('SetupBootstrap', worker);
      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};

exports.SetupBootstrap = SetupBootstrap;
