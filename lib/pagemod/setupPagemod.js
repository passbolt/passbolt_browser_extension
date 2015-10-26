/*
 * This page mod drives the reset of setup process
 * The reset of the setup process is driven on the add-on side, see in ../data/ setup.html and js/setup.js
 */
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');
var app = require('../main');
var Config = require('../model/config');

/*
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */
var setup = pageMod.PageMod({
    include: self.data.url('setup.html'),
    contentScriptWhen: 'end',
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/vendors/ejs_production.js'),
        self.data.url('js/vendors/farbtastic.js'),
        self.data.url('js/inc/template.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/event.js'),
        self.data.url('js/inc/secret_complexity.js'),
        self.data.url('js/inc/setup/domain_check.js'),
        self.data.url('js/inc/setup/define_key.js'),
        self.data.url('js/inc/setup/import_key.js'),
        self.data.url('js/inc/setup/secret.js'),
        self.data.url('js/inc/setup/generate_key.js'),
        self.data.url('js/inc/setup/backup_key.js'),
        self.data.url('js/inc/setup/key_info.js'),
        self.data.url('js/inc/setup/security_token.js'),
        self.data.url('js/inc/setup/password.js'),
        self.data.url('js/setup.js')
    ],
    onAttach: function (worker) {
        app.workers['Setup'] = worker;

        app.events.template.listen(worker);
        app.events.clipboard.listen(worker);
        app.events.setup.listen(worker);
        app.events.dispatch.listen(worker);
        app.events.file.listen(worker);
        app.events.keyring.listen(worker);
    }
});
exports.setup = setup;