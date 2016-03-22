/**
 * Passbolt Auth Form pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');
var app = require('../main');
var Worker = require('../model/worker');

var passboltAuthForm = pageMod.PageMod({
    include: 'about:blank?passbolt=passbolt-iframe-login-form',
    contentScriptWhen: 'ready',
    contentStyleFile: [
        self.data.url('css/main_ff.min.css')
    ],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/event.js'),
        self.data.url('js/inc/template.js'),
        self.data.url('js/login-form.js')
    ],
    contentScriptOptions: {
        addonDataPath: self.data.url(),
        templatePath: './tpl/login/form.ejs'
    },
    onAttach: function (worker) {
        Worker.add('AuthForm', worker, {
            removeOnTabUrlChange: true
        });
        app.events.template.listen(worker);
        app.events.user.listen(worker);
        app.events.keyring.listen(worker);
        app.events.auth.listen(worker);
    },
    onDetach: function () {
        // onDetach is called twice, avoid it.
        if (Worker.exists('AuthForm')) {
            Worker.remove('AuthForm');
        }
    }
});

exports.passboltAuthForm = passboltAuthForm;
