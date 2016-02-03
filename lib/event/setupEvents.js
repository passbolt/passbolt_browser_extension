/**
 * Setup Events
 * Listen to events related to the setup
 */
var Setup = require('../model/setup');
var Key = require('../model/key').Key;
var app = require('../main');

var listen = function (worker) {

    // Init / Reset the setup. (delete config, flush keyring, etc..)
    worker.port.on('passbolt.setup.init', function(token) {
        Setup.reset();
        worker.port.emit('passbolt.setup.init.complete', token, 'SUCCESS');
    });

    // Set Key Info.
    worker.port.on('passbolt.setup.keyinfo.set', function(token, keydata) {
        try {
            console.log('keyinfo set', keydata);
            var keyInfo = new Key();
            keyInfo.set(keydata);
            worker.port.emit('passbolt.setup.keyinfo.set.complete', token, 'SUCCESS');
        } catch (e) {
            worker.port.emit('passbolt.setup.keyinfo.set.complete', token, 'ERROR', e.message);
        }
    });

    // The setup has been completed, save the information
    worker.port.on('passbolt.setup.save', function(token, data) {
        Setup.save(data).then(
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