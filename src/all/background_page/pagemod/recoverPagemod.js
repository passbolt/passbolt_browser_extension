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
const app = require('../app');

/*
 * This pagemod help bootstrap the first step of the recover process from a passbolt server app page
 * The pattern for this url, driving the recover bootstrap, is defined in config.json
 */
const Recover = function () {};
Recover._pageMod = undefined;

Recover.init = function () {
  if (typeof Recover._pageMod !== 'undefined') {
    Recover._pageMod.destroy();
    Recover._pageMod = undefined;
  }

  Recover._pageMod = new PageMod({
    name: 'Setup',
    include: 'about:blank?passbolt=passbolt-iframe-recover',
    contentScriptWhen: 'ready',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/passbolt-iframe-recover.html
		],
    onAttach: function (worker) {
      app.events.config.listen(worker);
      app.events.siteSettings.listen(worker);
      app.events.recover.listen(worker);

      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};

exports.Setup = Recover;
