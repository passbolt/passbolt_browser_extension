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
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Config = require('../model/config');

var appBootstrap = pageMod.PageMod({
    include: '*',
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/bootstrap.js')
    ],
    onAttach: function (worker) {
        app.workers['appBootstrap'] = worker;
        app.events.bootstrap.listen(worker);
    },
    onDetach: function () {
        delete app.workers['appBootstrap'];
    }
});
exports.appBootstrap = appBootstrap;