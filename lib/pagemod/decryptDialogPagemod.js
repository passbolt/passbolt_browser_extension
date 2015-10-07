/**
 * This pagemod drives the iframe used when the user enter a password to be stored by passbolt
 * It is used when creating/editing a new password
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');

var decryptDialog = pageMod.PageMod({
    include: 'about:blank?passbolt=decryptInline*',
    contentStyleFile: [
        self.data.url('css/main_ff.css')
    ],
    contentScriptFile: [
        self.data.url('js/lib/jquery-2.1.1.min.js'),
        self.data.url('js/lib/ejs_production.js'),
        self.data.url('js/lib/uuid.js'),
        self.data.url('js/template.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/secret.js'),
        self.data.url('js/inc/secret_complexity.js'),
        self.data.url('js/inc/event.js'),
        self.data.url('js/secret_edit.js')
    ],
    contentScriptWhen: 'ready',
    contentScriptOptions: {
        expose_messaging: false,
        addonDataPath: self.data.url(),
        templatePath: './tpl/secret/edit.ejs'
    },
    onAttach: function (worker) {
        app.workers['Secret'] = worker;

        app.events.config.listen(worker);
        app.events.dispatch.listen(worker);
        app.events.secret.listen(worker);
        app.events.template.listen(worker);
    }
});
exports.decryptDialog = decryptDialog;