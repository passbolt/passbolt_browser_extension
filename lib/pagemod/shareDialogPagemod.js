/**
 * Share dialog pagemod.
 *
 * This pagemod drives the iframe used when the user shares a password.
 * It is used when sharing a new password.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');

var shareDialog = pageMod.PageMod({
    include: 'about:blank?passbolt=shareInline*',
    contentStyleFile: [
        self.data.url('css/main_ff.css')
    ],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/inc/template.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/event.js'),
		self.data.url('js/inc/helper/html.js'),
        self.data.url('js/resource-share.js')
    ],
    contentScriptWhen: 'ready',
    contentScriptOptions: {
        expose_messaging: false,
        addonDataPath: self.data.url(),
        templatePath: './tpl/resource/share.ejs'
    },
    onAttach: function (worker) {
        app.workers['Share'] = worker;

        app.events.config.listen(worker);
        app.events.dispatch.listen(worker);
		app.events.secret.listen(worker);
        app.events.share.listen(worker);
		app.events.user.listen(worker);
        app.events.template.listen(worker);
    }
});
exports.shareDialog = shareDialog;
