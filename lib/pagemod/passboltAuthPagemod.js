/**
 * Passbolt Auth pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Config = require('../model/config');
var Worker = require('../model/worker');
var user = new (require('../model/user').User)();

var PassboltAuth = function () {};
    PassboltAuth._pageMod = undefined;
    PassboltAuth.id = 0;
    PassboltAuth.current;

PassboltAuth.init = function(forceReset) {
    var domain, ready, next;

    // Handles case where we want to force reset the pagemod.
    if (forceReset !== undefined && forceReset === true) {
        this.current = false;
    }

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
            contentStyleFile: [
                self.data.url('css/external.min.css')
            ],
            contentScriptFile: [
                self.data.url('js/vendors/jquery-2.1.1.min.js'),
                self.data.url('js/vendors/ejs_production.js'),
                self.data.url('js/inc/port.js'),
                self.data.url('js/inc/request.js'),
                self.data.url('js/inc/event.js'),
                self.data.url('js/inc/template.js'),
                self.data.url('js/login.js')
            ],
            contentScriptOptions: {
                id : PassboltAuth.id,
                addonDataPath : self.data.url(),
                ready : ready,
                domain : domain
            },
            attachTo: ["existing", "top"],
            onAttach: function (worker) {
                Worker.add('Auth', worker, {
                    removeOnTabUrlChange: true
                });
                app.events.bootstrap.listen(worker);
                app.events.template.listen(worker);
                app.events.keyring.listen(worker);
                app.events.secret.listen(worker);
                app.events.user.listen(worker);
                app.events.auth.listen(worker);
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
