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
      'data/vendors/jquery.js',
      'data/vendors/dom-testing-library-event.js',
      'data/tpl/login.js',
      'data/js/lib/port.js',
      'data/js/lib/request.js',
      'data/js/lib/message.js',
      'data/js/lib/html.js',
      'data/js/quickaccess/quickaccess.js',
      'content_scripts/js/bootstrap.js'
    ],
    attachTo: {existing: true, reload: false},
    onAttach: function (worker) {
      Worker.add('WebIntegration', worker);
      app.events.config.listen(worker);
    }
  });
};
exports.WebIntegration = WebIntegration;
