/**
 * Master password Listeners
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');

var listen = function (worker) {

    // Master password attempt.
    // Verify the master password, and continue the original process,
    // or adapt the behavior in case of failure :
    // - to many attempts, leave;
    // - less than the maximum attempts, retry.
    //
    // @listens passbolt.master-password.submit
    // @param requestId {int} The request identifier
    // @param masterPassword {string} The master password filled by the user
    worker.port.on('passbolt.master-password.submit', function (requestId, masterPassword) {
        app.callbacks[requestId](requestId, masterPassword);
    });

};
exports.listen = listen;
