/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Keyring = require('../model/keyring').Keyring;
var Crypto = require('../model/crypto').Crypto;
var Permission = require('../model/permission').Permission;
var app = require('../main');

var listen = function (worker) {

    // Listen to search users request event.
    worker.port.on('passbolt.share.search_users', function (token, model, intanceId, keywords, excludedUsers) {
        var permission = new Permission();
		permission.searchUsers(model, intanceId, keywords, excludedUsers)
			.then(function(users) {
				worker.port.emit('passbolt.share.search_users.complete', token, 'SUCCESS', users);
			}, function() {
				worker.port.emit('passbolt.share.search_users.complete', token, 'ERROR');
			});
    });

};
exports.listen = listen;
