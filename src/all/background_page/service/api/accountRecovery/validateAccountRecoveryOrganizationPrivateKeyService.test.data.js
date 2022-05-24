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
import {pgpKeys} from "../../../../../../test/fixtures/pgpKeys/keys";

exports.dummyData = {
  correctKeyPair: {
    publicKey: {
      policy: "opt-in",
      account_recovery_organization_public_key:
      {
        armored_key: pgpKeys.ada.public,
      }
    },
    privateKey: {
      armored_key: pgpKeys.ada.private,
      passphrase: "ada@passbolt.com"
    }
  },
  invalidKeyPair: {
    publicKey: {
      policy: "opt-in",
      account_recovery_organization_public_key:
      {
        armored_key: pgpKeys.ada.public,
      }
    },
    privateKey: {
      armored_key: pgpKeys.betty.private,
      passphrase: "betty@passbolt.com"
    }
  },
  invalidPassphrase: {
    publicKey: {
      policy: "opt-in",
      account_recovery_organization_public_key:
      {
        armored_key: pgpKeys.ada.public,
      }
    },
    privateKey: {
      armored_key: pgpKeys.ada.private,
      passphrase: "dada@passbolt.com"
    }
  }
};
