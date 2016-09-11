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
var Worker = require('../model/worker');
var user = new (require('../model/user').User)();

var appBootstrap = pageMod.PageMod({
    include: '*',
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/message.js'),
        self.data.url('js/inc/helper/html.js'),
        self.data.url('js/bootstrap.js')
    ],
    onAttach: function (worker) {
        Worker.add('appBootstrap', worker, {
            removeOnTabUrlChange: true
        });

        app.events.template.listen(worker);
        app.events.config.listen(worker);
        app.events.bootstrap.listen(worker);
    }
});
exports.appBootstrap = appBootstrap;