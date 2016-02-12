/**
 * Master password Listeners
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');

var listen = function (worker) {
    worker.port.on('passbolt.keyring.master.request.submit', function (token, masterPassword) {
        app.callbacks[token](token, masterPassword);
    });
};
exports.listen = listen;