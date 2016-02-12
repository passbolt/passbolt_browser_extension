/**
 * Test crypto model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

'use strict';

var Crypto = require('../lib/model/crypto').Crypto;
var Validator = require('../lib/vendors/validator');

/**
 * Test Gpg Key Import
 * @param assert
 */
exports.testUuid = function(assert) {

    var u1 = Crypto.uuid();
    var u2 = Crypto.uuid();
    assert.ok (Validator.isUUID(u1));
    assert.ok (Validator.isUUID(u2));
    assert.ok (u1 !== u2);

    var adauuid = Crypto.uuid('user.id.ada');
    var adauuid2 = Crypto.uuid('user.id.ada');
    assert.ok( adauuid == 'cd49eb9e-73a2-3433-a018-6ed993d421e8',
        'ada uuid should be cd49eb9e-73a2-3433-a018-6ed993d421e8 and not '+ adauuid);

    assert.ok (adauuid == adauuid2);
};
require('sdk/test').run(exports);