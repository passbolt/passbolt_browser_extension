/**
 * This pagemod help with the authentication
 */
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');
var app = require('../main');

var passboltAuthForm = pageMod.PageMod({
    include: 'about:blank?passbolt=passbolt-iframe-login-form',
    contentScriptWhen: 'ready',
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
        self.data.url('js/login-form.js')
    ],
    contentScriptOptions: {
        addonDataPath: self.data.url(),
        templatePath: './tpl/login/form.ejs'
    },
    onAttach: function (worker) {
        app.workers['AuthForm'] = worker;
        app.events.template.listen(worker);
        app.events.user.listen(worker);
        app.events.keyring.listen(worker);
        app.events.auth.listen(worker);
    }
});

exports.passboltAuthForm = passboltAuthForm;
