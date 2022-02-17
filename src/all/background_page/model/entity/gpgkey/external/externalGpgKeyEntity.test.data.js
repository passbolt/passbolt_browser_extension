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

import {pgpKeys} from "../../../../../tests/fixtures/pgpKeys/keys";

export const adaExternalPrivateGpgKeyEntityDto = (data = {}) => {
  const defaultData = {
    "armored_key": pgpKeys.ada.private,
    "key_id": "5d9b054f",
    "user_ids": [{
      email: "ada@passbolt.com",
      name: "Ada Lovelace"
    }],
    "fingerprint": "03f60e958f4cb29723acdf761353b5b15d9b054f",
    "expires": "Never",
    "created": "2015-08-09T12:48:31.000Z",
    "algorithm": "RSA",
    "length": 4096,
    "curve": null,
    "private": true,
    "revoked": false
  };

  return Object.assign(defaultData, data || {});
};
