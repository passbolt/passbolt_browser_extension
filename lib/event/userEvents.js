/**
 * User events
 * Used to handle the events related to the current user
 */
var User = require('../model/user').User;
var __ = require("sdk/l10n").get;

var listen = function (worker) {
    // Retrieve the current user
    worker.port.on('passbolt.user.me', function (token) {
        var user = new User();
        user.getCurrent()
            .then(
                function success(user) {
                    worker.port.emit('passbolt.user.me.complete', token, 'SUCCESS', user);
                },
                function failure(response) {
                    worker.port.emit('passbolt.user.me.complete', token, 'ERROR', response);
                }
            );
    });

    // Try to set the security token
    worker.port.on('passbolt.user.settings.setSecurityToken', function (token, securityToken){
        var user = new User();
        try {
            user.settings.setSecurityToken(securityToken);
            worker.port.emit('passbolt.user.settings.setSecurityToken.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.settings.setSecurityToken.complete', token, 'ERROR', e.message);
        }
    });

    // Try to get the security token
    worker.port.on('passbolt.user.settings.getSecurityToken', function (token){
        console.log('addon: passbolt.user.settings.getSecurityToken');
        var user = new User();
        try {
            var securityToken = user.settings.getSecurityToken();
            worker.port.emit('passbolt.user.settings.getSecurityToken.complete', token, 'SUCCESS', securityToken);
        } catch (e) {
            worker.port.emit('passbolt.user.settings.getSecurityToken.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the firstname and lastname
    worker.port.on('passbolt.user.setName', function (token, firstname, lastname){
        var user = new User();
        try {
            user.setName(firstname, lastname);
            worker.port.emit('passbolt.user.setName.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.setName.complete', token, 'ERROR', e.message);
        }
    });

    // Try to set the username
    worker.port.on('passbolt.user.setUsername', function (token, username){
        var user = new User();
        try {
            user.setUsername(username);
            worker.port.emit('passbolt.user.setUsername.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.user.setUsername.complete', token, 'ERROR', e.message);
        }
    });
};
exports.listen = listen;
