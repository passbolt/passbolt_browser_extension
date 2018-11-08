/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */

const chai = require('chai');


mocha.setup('bdd');

// Init global variables.
const glbl = typeof window !== "undefined" ? window : global;
glbl.expect = chai.expect;
glbl.assert = chai.assert;
var storage = require('../src/all/background_page/sdk/storage').storage;
glbl.storage = storage;

// Test-suites
require('./all/background_page/model/keyring');

// Run the tests
mocha.checkLeaks();
mocha.run();