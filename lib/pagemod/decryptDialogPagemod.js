/**
 * Decrypt dialog pagemod.
 *
 * This pagemod drives the iframe used when the user enter a password to be stored by passbolt
 * It is used when creating/editing a new password
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 *
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var decryptDialog = pageMod.PageMod({
    include: 'about:blank?passbolt=decryptInline*',
    contentStyleFile: [
        self.data.url('css/main_ff.min.css')
    ],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/inc/template.js'),
        self.data.url('js/inc/message.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/secret_complexity.js'),
        self.data.url('js/inc/event.js'),
        self.data.url('js/inc/helper/html.js'),
        self.data.url('js/secret-edit.js')
    ],
    contentScriptWhen: 'ready',
    contentScriptOptions: {
        expose_messaging: false,
        addonDataPath: self.data.url(),
        templatePath: './tpl/secret/edit.ejs'
    },
    onAttach: function (worker) {
        Worker.add('Secret', worker, {
            removeOnTabUrlChange: true
        });

        app.events.config.listen(worker);
        app.events.dispatch.listen(worker);
        app.events.secret.listen(worker);
        app.events.template.listen(worker);
        app.events.user.listen(worker);
    }
});
exports.decryptDialog = decryptDialog;