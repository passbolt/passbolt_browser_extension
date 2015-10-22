/**
 * This pagemod help with the authentication
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Config = require('../model/config');
var user = new (require('../model/user').User)();

var PassboltAuth = function () {};
    PassboltAuth._pageMod = undefined;
    PassboltAuth.id = 0;
    PassboltAuth.current;

PassboltAuth.init = function() {
    var domain, ready, next;

    if (user.isValid()) {
        // Launch on a trusted domain
        domain = user.settings.getDomain() + '/auth/login';
        ready = true;
    } else {
        // Launch on any domain with /auth/login pretending to be a passbolt app
        // but we don't run the login process we just load the content script to handle errors
        domain = new RegExp('(.*)\/auth\/login');
        ready = false; // thanks to this flag
    }

    if(ready !== PassboltAuth.current) {

        PassboltAuth.id++;
        PassboltAuth.current = ready;

        if (typeof PassboltAuth._pageMod !== 'undefined') {
            PassboltAuth._pageMod.destroy();
        }
        PassboltAuth._pageMod = pageMod.PageMod({
            include: domain,
            contentScriptWhen: 'ready',
            contentStyleFile: [],
            contentScriptFile: [
                self.data.url('js/lib/jquery-2.1.1.min.js'),
                self.data.url('js/lib/ejs_production.js'),
                self.data.url('js/lib/uuid.js'),
                self.data.url('js/inc/port.js'),
                self.data.url('js/inc/request.js'),
                self.data.url('js/inc/keyring.js'),
                self.data.url('js/inc/event.js'),
                self.data.url('js/login.js')
            ],
            contentScriptOptions: {
                id : PassboltAuth.id,
                ready : ready,
                domain : domain
            },
            onAttach: function (worker) {
                app.workers['Auth'] = worker;
                app.events.auth.listen(worker);
                app.events.keyring.listen(worker);
                app.events.secret.listen(worker);
                app.events.user.listen(worker);
            }
        });
        return true;
    }
    return false;
};

PassboltAuth.get = function () {
    PassboltAuth.init();
    return PassboltAuth._pageMod;
};

exports.PassboltAuth = PassboltAuth;
