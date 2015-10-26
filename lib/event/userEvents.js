/**
 * User events
 * Used to handle the events related to the current user
 */
var User = require('../model/user').User;
var __ = require("sdk/l10n").get;

var listen = function (worker) {


    // Try to set the security token
    worker.port.on('passbolt.user.settings.setSecurityToken', function (token, securityToken) {
        var user = new User();
        try {
            user.settings.setSecurityToken(securityToken);
            worker.port.emit('passbolt.user.settings.setSecurityToken.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.settings.setSecurityToken.complete', token, 'ERROR', e.message);
        }
    });

    // Try to get the security token
    worker.port.on('passbolt.user.settings.getSecurityToken', function (token) {
        var user = new User();
        try {
            var securityToken = user.settings.getSecurityToken();
            worker.port.emit('passbolt.user.settings.getSecurityToken.complete', token, 'SUCCESS', securityToken);
        } catch (e) {
            worker.port.emit('passbolt.user.settings.getSecurityToken.complete', token, 'ERROR', e.message);
        }
    });


    /* ==================================================================================
     *  Setters for user
     * ================================================================================== */

    // Try to set the user
    worker.port.on('passbolt.user.set', function (token, user) {
        var user = new User();
        try {
            user.set(user);
            worker.port.emit('passbolt.user.set.name.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.name.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the firstname and lastname
    worker.port.on('passbolt.user.set.name', function (token, firstname, lastname) {
        var user = new User();
        try {
            user.setName(firstname, lastname);
            worker.port.emit('passbolt.user.set.name.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.name.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the username
    worker.port.on('passbolt.user.set.username', function (token, username) {
        var user = new User();
        try {
            user.setUsername(username);
            worker.port.emit('passbolt.user.set.username.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.username.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the user id
    worker.port.on('passbolt.user.setId', function (token, userid) {
        var user = new User();
        try {
            user.setId(userid);
            worker.port.emit('passbolt.user.set.id.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.set.id.complete', token, 'ERROR', e.message);
        }
    });


    /* ==================================================================================
     *  Getters for user
     * ================================================================================== */

    // Try to get the current user as stored in the plugin
    worker.port.on('passbolt.user.get', function (token) {
        var user = new User();
        try {
            var user = user.get();
            worker.port.emit('passbolt.user.get.complete', token, 'SUCCESS', user);
        } catch (e) {
            worker.port.emit('passbolt.user.get.complete', token, 'ERROR', e.message);
        }
    });

    // Retrieve the current user as stored server side
    worker.port.on('passbolt.user.get.remote', function (token) {
        var user = new User();
        user.getRemote()
            .then(
            function success(user) {
                worker.port.emit('passbolt.user.get.remote.complete', token, 'SUCCESS', user);
            },
            function failure(response) {
                worker.port.emit('passbolt.user.get.remote.complete', token, 'ERROR', response);
            }
        );
    });
};
exports.listen = listen;
