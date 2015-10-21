/**
 * This pagemod help with the authentication
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Config = require('../model/config');
var user = new (require('../model/user').User)();

var PassboltAuth = function () {};

PassboltAuth.prototype.reset = function() {
    var domain, ready;

    if (user.isValid()) {
        console.log('PassboltAuth.prototype.reset is valid');
        domain = user.settings.getDomain();
        ready = true;
    } else {
        console.log('PassboltAuth.prototype.reset !is valid');
        domain = new RegExp('(.*)\/auth\/login');
        ready = false;
    }

    return pageMod.PageMod({
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
};
exports.PassboltAuth = PassboltAuth;
