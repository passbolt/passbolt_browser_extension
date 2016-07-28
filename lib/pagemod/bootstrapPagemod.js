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
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/inc/template.js'),
        self.data.url('js/bootstrap.js')
    ],
    onAttach: function (worker) {
        const passboltApp = app.pageMods.passboltApp;

        Worker.add('appBootstrap', worker, {
            removeOnTabUrlChange: true
        });

        // Each time the boostrap pagemod is attached to a page, it controls if the application pagemod
        // should or not be started.
        if (user.isValid()) {
            console.log('user is valid');
            // According to the logged-in status of the current user, initialize or destroy the application pagemod.
            user.isLoggedIn().then(
                // If it is already logged-in.
                function success() {
                    console.log('user is logged in');
                    // Start the application pagemod if it hasn't been done yet.
                    if (!passboltApp.exists()) {
                        console.log('pagemod does not exist, init it');
                        passboltApp.init();
                    }
                },
                // If it is logged-out.
                function error() {
                    // Remove the application pagemod if it hasn't been done yet.
                    if (passboltApp.exists()) {
                        console.log('pagemod exists, destroy it');
                        passboltApp.destroy();
                    }
                }
            );
        }

        app.events.template.listen(worker);
        app.events.config.listen(worker);
        app.events.bootstrap.listen(worker);
    }
});
exports.appBootstrap = appBootstrap;