/**
 * Setup Events
 * Listen to events related to the setup
 */
var Setup = require('../model/setup').Setup;
var Key = require('../model/key').Key;
var app = require('../main');

var setup = new Setup();

var listen = function (worker) {

    // Init / Reset the setup. (delete config, flush keyring, etc..)
    worker.port.on('passbolt.setup.init', function(token) {
        setup.reset();
        worker.port.emit('passbolt.setup.init.complete', token, 'SUCCESS');
    });

    // Set Key Info.
    worker.port.on('passbolt.setup.keyinfo.set', function(token, keydata) {
        try {
            var keyInfo = new Key();
            keyInfo.set(keydata);
            worker.port.emit('passbolt.setup.keyinfo.set.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.setup.keyinfo.set.complete', token, 'ERROR', e.message);
        }
    });

    /**
     *  Set setup data.
     */
    worker.port.on('passbolt.setup.set', function(token, key, value) {
        try {
            var setupData = setup.set(key, value);
            worker.port.emit('passbolt.setup.set.complete', token, 'SUCCESS', setupData);
        } catch (e) {
            worker.port.emit('passbolt.setup.set.complete', token, 'ERROR', e.message);
        }
    });

    /**
     *  Set setup data.
     */
    worker.port.on('passbolt.setup.get', function(token, key) {
        try {
            var setupData = setup.get(key);
            worker.port.emit('passbolt.setup.get.complete', token, 'SUCCESS', setupData);
        } catch (e) {
            worker.port.emit('passbolt.setup.get.complete', token, 'ERROR', e.message);
        }
    });

    /**
     *  Go to next section in the navigation.
     */
    worker.port.on('passbolt.setup.navigation.next', function(token, stepId) {
        try {
            var myStepId = setup.navigationNext(stepId);
            worker.port.emit('passbolt.setup.navigation.next.complete', token, 'SUCCESS', myStepId);
        } catch (e) {
            worker.port.emit('passbolt.setup.navigation.next.complete', token, 'ERROR', e.message);
        }
    });

    /**
     *  Go back to previous section in the navigation.
     */
    worker.port.on('passbolt.setup.navigation.back', function(token) {
        try {
            var lastStep = setup.navigationBack();
            worker.port.emit('passbolt.setup.navigation.back.complete', token, 'SUCCESS', lastStep);
        } catch (e) {
            worker.port.emit('passbolt.setup.navigation.back.complete', token, 'ERROR', e.message);
        }
    });

    /**
     *  Go back to previous section in the navigation.
     */
    worker.port.on('passbolt.setup.navigation.get.history', function(token) {
        try {
            var history = setup.getNavigationHistory();
            worker.port.emit('passbolt.setup.navigation.get.history.complete', token, 'SUCCESS', history);
        } catch (e) {
            worker.port.emit('passbolt.setup.navigation.get.history.complete', token, 'ERROR', e.message);
        }
    });

    /**
     *  Flush setup data.
     */
    worker.port.on('passbolt.setup.flush', function(token, key) {
        try {
            setup.flush();
            worker.port.emit('passbolt.setup.flush.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.setup.flush.complete', token, 'ERROR', e.message);
        }
    });

    // The setup has been completed, save the information
    worker.port.on('passbolt.setup.save', function(token, data) {
        setup.save(data).then(
                function() {
					app.pageMods.passboltAuth.init();
					app.pageMods.passboltApp.init();
                    worker.port.emit('passbolt.setup.save.complete', token, 'SUCCESS');
                },
                function(error) {
                    worker.port.emit('passbolt.setup.save.complete', token, 'ERROR', error);
                }
            );
    });
};
exports.listen = listen;