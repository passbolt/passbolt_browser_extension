/**
 * This pagemod drives the main addon app
 * It is inserted in all the pages of a domain that is trusted.
 * Such trust is defined during the first step of the setup process (or in config-debug)
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Config = require('../model/config');

var user = new (require('../model/user').User)();

var passboltApp = function () {};

passboltApp.reset = function() {

    if (user.isValid()) {
        return pageMod.PageMod({
            // @TODO except the login e.g only passwords and users
            include: user.settings.getDomain() + '*',
            contentScriptWhen: 'ready',
            contentStyleFile: [
                self.data.url('css/external.css')
            ],
            contentScriptFile: [
                self.data.url('js/lib/jquery-2.1.1.min.js'),
                self.data.url('js/lib/uuid.js'),
                self.data.url('js/inc/event.js'),
                self.data.url('js/inc/port.js'),
                self.data.url('js/inc/request.js'),
                self.data.url('js/inc/secret.js'),
                self.data.url('js/inc/clipboard.js'),
                self.data.url('js/app.js')
            ],
            contentScriptOptions: {
                baseUrl: user.settings.getDomain()
            },
            onAttach: function (worker) {
                app.workers['App'] = worker;

                app.events.clipboard.listen(worker);
                app.events.config.listen(worker);
                app.events.dispatch.listen(worker);
                app.events.keyring.listen(worker);
                app.events.secret.listen(worker);
                app.events.template.listen(worker);
            }
        });
    } else {
        return {};
    }
};
exports.passboltApp = passboltApp;