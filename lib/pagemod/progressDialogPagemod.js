/**
 * Progress dialog pagemod.
 *
 * This pagemod drives the progress bar iframe
 * It is used when the add-on is encrypting something
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

progressDialog = pageMod.PageMod({
    include: 'about:blank?passbolt=progressInline*',
    contentStyleFile: [
        self.data.url('css/main_ff.min.css')
    ],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/inc/template.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/event.js'),
        self.data.url('js/progress.js')
    ],
    contentScriptWhen: 'ready',
    contentScriptOptions: {
        expose_messaging: false,
        addonDataPath: self.data.url(),
        templatePath: './tpl/progress/progress.ejs'
    },
    onAttach: function (worker) {
        Worker.add('Progress', worker, {
            removeOnTabUrlChange: true
        });

        app.events.dispatch.listen(worker);
        app.events.template.listen(worker);
    },
    onDetach: function () {
        // onDetach is called twice, avoid it.
        if (Worker.exists('Progress')) {
            Worker.remove('Progress');
        }
    }
});
exports.progressDialog = progressDialog;