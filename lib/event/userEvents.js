/**
 * User events
 * Used to handle the events related to the current user
 */
var app = require('../main');
var User = require('../model/user').User;
var user = new User();
var __ = require("sdk/l10n").get;

var listen = function (worker) {

    /* ==================================================================================
     *  Getters for user
     * ================================================================================== */

    // Try to get the current user as stored in the plugin
    worker.port.on('passbolt.user.get', function (token) {
        try {
            var u = user.get();
            worker.port.emit('passbolt.user.get.complete', token, 'SUCCESS', u);
        } catch (e) {
            worker.port.emit('passbolt.user.get.complete', token, 'ERROR', e.message);
        }
    });

    // Try to get all the user settings
    worker.port.on('passbolt.user.settings.get', function (token) {
        try {
            var settings = user.settings.get();
            worker.port.emit('passbolt.user.settings.get.complete', token, 'SUCCESS', settings);
        } catch (e) {
            worker.port.emit('passbolt.user.settings.get.complete', token, 'ERROR', e.message);
        }
    });

    // Try to get the security token
    worker.port.on('passbolt.user.settings.get.securityToken', function (token) {
        try {
            var securityToken = user.settings.getSecurityToken();
            worker.port.emit('passbolt.user.settings.get.securityToken.complete', token, 'SUCCESS', securityToken);
        } catch (e) {
            worker.port.emit('passbolt.user.settings.get.securityToken.complete', token, 'ERROR', e.message);
        }
    });

    // Try to get the domain trust
    worker.port.on('passbolt.user.settings.get.domain', function (token) {
        try {
            var domain = user.settings.getDomain();
            worker.port.emit('passbolt.user.settings.get.domain.complete', token, 'SUCCESS', domain);
        } catch (e) {
            worker.port.emit('passbolt.user.settings.get.domain.complete', token, 'ERROR', e.message);
        }
    });

    /* ==================================================================================
     *  Setters for user
     * ================================================================================== */

    // Try to set the user
    worker.port.on('passbolt.user.set', function (token, u) {
        try {
            user.set(u);
            // TODO : wrap this in a separate function.
			app.pageMods.passboltAuth.init();
			app.pageMods.passboltApp.init();
            worker.port.emit('passbolt.user.set.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the firstname and lastname
    worker.port.on('passbolt.user.set.name', function (token, firstname, lastname) {
        try {
            user.setName(firstname, lastname);
            worker.port.emit('passbolt.user.set.name.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.name.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the username
    worker.port.on('passbolt.user.set.username', function (token, username) {
        try {
            user.setUsername(username);
            worker.port.emit('passbolt.user.set.username.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.username.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the user id
    worker.port.on('passbolt.user.setId', function (token, userid) {
        try {
            user.setId(userid);
            worker.port.emit('passbolt.user.set.id.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.id.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the security token
    worker.port.on('passbolt.user.settings.set.securityToken', function (token, securityToken) {
        try {
            user.settings.setSecurityToken(securityToken);
            worker.port.emit('passbolt.user.settings.set.securityToken.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.settings.set.securityToken.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the domain trust
    worker.port.on('passbolt.user.settings.set.domain', function (token, domain) {
        try {
            user.settings.setDomain(domain);
            worker.port.emit('passbolt.user.settings.set.domain.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.settings.set.domain.complete', token, 'ERROR', e.message);
        }
    });

};
exports.listen = listen;
