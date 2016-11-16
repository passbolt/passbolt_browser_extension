/**
 * Bootstrap pagemod.
 *
 * This pagemod allow inserting classes to help any page
 * to know about the status of the extension, in a modernizr fashion
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../app');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var Bootstrap = function () {};
Bootstrap._pageMod = undefined;

Bootstrap.init = function () {

  if (typeof Bootstrap._pageMod !== 'undefined') {
    Bootstrap._pageMod.destroy();
    Bootstrap._pageMod = undefined;
  }

  Bootstrap._pageMod = pageMod.PageMod({
    name: 'appBootstrap',
    include: '*',
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
      self.data.url('vendors/jquery.min.js'),
      self.data.url('vendors/ejs_production.js'),
      self.data.url('js/lib/request.js'),
      self.data.url('js/lib/message.js'),
      self.data.url('js/lib/html.js'),
      self.data.url('js/bootstrap.js')
    ],
    onAttach: function (worker) {
      Worker.add('appBootstrap', worker);
      app.events.template.listen(worker);
      app.events.config.listen(worker);
    }
  });
};
exports.Bootstrap = Bootstrap;
