/**
 * This pagemod drives the progress bar iframe
 * It is used when the add-on is encrypting something
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');

progressDialog = pageMod.PageMod({
    include: 'about:blank?passbolt=progressInline*',
    contentStyleFile: [
        self.data.url('css/main_ff.css')
    ],
    contentScriptFile: [
        self.data.url('js/lib/jquery-2.1.1.min.js'),
        self.data.url('js/lib/ejs_production.js'),
        self.data.url('js/lib/uuid.js'),
        self.data.url('js/template.js'),
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
        app.workers['Progress'] = worker;

        app.events.dispatch.listen(worker);
        app.events.template.listen(worker);
    }
});
exports.progressDialog = progressDialog;