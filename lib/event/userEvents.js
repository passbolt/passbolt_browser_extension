/**
 * User events
 * Used to handle the events related to the current user
 */
var User = require('../model/user').User;
var user = new User();

var listen = function (worker) {
    // Retrieve the current user
    worker.port.on('passbolt.user.me', function (token) {
        user.getCurrent()
            .then(
            // success
            function (user) {
                worker.port.emit('passbolt.user.me.complete', token, 'SUCCESS', user)
            },
            // fail
            function (response) {
                worker.port.emit('passbolt.user.me.complete', token, 'ERROR', response)
            }
        );
    });
};
exports.listen = listen;
