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
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */
const InFormCallToAction = function () {};
InFormCallToAction._pageMod = undefined;

InFormCallToAction.init = function () {
  if (typeof InFormCallToAction._pageMod !== 'undefined') {
    InFormCallToAction._pageMod.destroy();
    InFormCallToAction._pageMod = undefined;
  }

  InFormCallToAction._pageMod = new PageMod({
    name: 'InFormCallToAction',
    include: 'about:blank?passbolt=passbolt-iframe-in-form-call-to-action',
    contentScriptWhen: 'ready',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/passbolt-iframe-in-form-call-to-action.html
		],
    onAttach: function (worker) {
      // TODO add events


      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};

exports.InFormMenuCTA = InFormCallToAction;
