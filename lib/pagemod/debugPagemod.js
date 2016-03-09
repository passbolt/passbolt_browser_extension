/**
 * Debug pagemod.
 *
 * This page mod drives a convenience config page for debug
 * This allows to not have to go through the setup process steps
 * and perform changes useful for testing that would otherwise break things
 * Like for example changing the public key only on the client but not the server
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');

var debug = pageMod.PageMod({
    include: self.data.url('config-debug.html'),
    contentScriptWhen: 'end',
    contentStyleFile: [
        self.data.url('css/config_debug_ff.min.css')
    ],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/debug.js')
    ],
    onAttach: function (worker) {
        app.workers['debug'] = worker;

        app.events.config.listen(worker);
        app.events.dispatch.listen(worker);
        app.events.file.listen(worker);
        app.events.keyring.listen(worker);
        app.events.template.listen(worker);
        app.events.user.listen(worker);
        app.events.debug.listen(worker);
    },
    onDetach: function () {
        delete app.workers['debug'];
    }
});
exports.debug = debug;
