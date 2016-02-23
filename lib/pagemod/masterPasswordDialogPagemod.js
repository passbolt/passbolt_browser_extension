/**
 * Master password dialog pagemod.
 *
 * This pagemod drives the dialog/iframe where the user enters the secret key password,
 * also called master password. It is used when encrypting, decrypting, signing, etc.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');

var masterPasswordDialog = pageMod.PageMod({
    include: 'about:blank?passbolt=masterInline*',
    contentStyleFile: [
        self.data.url('css/main_ff.css')
    ],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/event.js'),
        self.data.url('js/inc/template.js'),
        self.data.url('js/master.js')
    ],
    contentScriptWhen: 'ready',
    contentScriptOptions: {
        expose_messaging: false,
        addonDataPath: self.data.url(),
        templatePath: './tpl/master/master-password.ejs'
    },
    onAttach: function (worker) {
        app.workers['MasterPassword'] = worker;
        app.events.config.listen(worker);
        app.events.dispatch.listen(worker);
        app.events.masterpassword.listen(worker);
        app.events.template.listen(worker);
        app.events.user.listen(worker);
    },
    onDetach: function () {
        delete app.workers['MasterPassword'];
    }
});
exports.masterPasswordDialog = masterPasswordDialog;