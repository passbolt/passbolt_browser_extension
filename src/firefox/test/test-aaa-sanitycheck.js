/**
 * Test fixture.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

'use strict';

// Test if models are testable (so meta!)
exports.testSanityCheck = function(assert) {
    assert.ok(true, "sanity check model");
};

require('../sdk/test').run(exports);