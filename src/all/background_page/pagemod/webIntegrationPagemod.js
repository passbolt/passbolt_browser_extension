/**
 * WebIntegration pagemod.
 *
 * This pagemod allow inserting classes to help any page
 * to know about the status of the extension, in a modernizr fashion
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const app = require('../app');
const {PageMod} = require('../sdk/page-mod');
const Worker = require('../model/worker');

const WebIntegration = function () {};
WebIntegration._pageMod = undefined;

WebIntegration.init = function () {
  if (typeof WebIntegration._pageMod !== 'undefined') {
    WebIntegration._pageMod.destroy();
    WebIntegration._pageMod = undefined;
  }

  WebIntegration._pageMod = new PageMod({
    name: 'WebIntegration',
    include: new RegExp('.*'),
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
      'content_scripts/js/dist/browser-integration/vendors.js',
      'content_scripts/js/dist/browser-integration/browser-integration.js'
    ],
    attachTo: {existing: true, reload: false},
    onAttach: function (worker) {
      Worker.add('WebIntegration', worker);
      app.events.config.listen(worker);
      app.events.webIntegration.listen(worker);
      app.events.organizationSettings.listen(worker);

      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};
exports.WebIntegration = WebIntegration;
