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

var PassboltApp = function () {};
    PassboltApp._pageMod = undefined;
    PassboltApp.id = 0;
    PassboltApp.current;

PassboltApp.init = function() {

    if (user.isValid()) {
        PassboltApp.id++;

        if (typeof PassboltApp._pageMod !== 'undefined') {
            PassboltApp._pageMod.destroy();
        }

        PassboltApp._pageMod = pageMod.PageMod({
            // @TODO everything private on the domain
            //      e.g only passwords and users workspace and not login
            include: user.settings.getDomain() + '*',
            contentScriptWhen: 'ready',
            contentStyleFile: [
                self.data.url('css/external.css')
            ],
            contentScriptFile: [
				        self.data.url('js/vendors/jquery-2.1.1.min.js'),
                self.data.url('js/inc/event.js'),
                self.data.url('js/inc/port.js'),
                self.data.url('js/inc/request.js'),
				        self.data.url('js/inc/helper/html.js'),
                self.data.url('js/inc/clipboard.js'),
                self.data.url('js/app.js')
            ],
            contentScriptOptions: {
                baseUrl: user.settings.getDomain(),
                id : PassboltApp.id
            },
            onAttach: function (worker) {
                app.workers['App'] = worker;
				        app.events.core.listen(worker);
                app.events.clipboard.listen(worker);
                app.events.config.listen(worker);
                app.events.dispatch.listen(worker);
                app.events.keyring.listen(worker);
                app.events.secret.listen(worker);
                app.events.template.listen(worker);
            }
        });
        return true;
    }
    return false;
};

PassboltApp.get = function () {
    PassboltApp.init();
    return PassboltApp._pageMod;
};

exports.PassboltApp = PassboltApp;