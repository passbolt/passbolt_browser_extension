/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
const {pgpKeys} = require("../../../../../../test/fixtures/pgpKeys/keys");

exports.dummyData = {
  viableKey: pgpKeys.test_no_expiry_with_secret.public,
  privateKey: pgpKeys.ada.private,
  weakKey: pgpKeys.user42.public,
  expiredKey: pgpKeys.lynne.public,
  existingKey: pgpKeys.ada.public,
  serverKey: pgpKeys.user76.public,
  invalidKey: pgpKeys.invalidKeyWithoutChecksum.private,
  notAKey: ":D"
};
