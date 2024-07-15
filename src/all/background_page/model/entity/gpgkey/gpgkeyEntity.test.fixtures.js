/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.8.0
 */
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";

exports.GpgkeyEntityFixtures = {
  default: {
    "id": "91d8a7fd-3ab3-5e98-a4a5-0d8694ff23b9",
    "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "armored_key": pgpKeys.admin.public,
    "bits": 4096,
    "uid": "Passbolt Default Admin \u003Cadmin@passbolt.com\u003E",
    "key_id": "D06426D3",
    "fingerprint": "0C1D1761110D1E33C9006D1A5B1B332ED06426D3",
    "type": "RSA",
    "expires": null,
    "key_created": "2015-10-31T16:21:43+00:00",
    "deleted": false,
    "created": "2020-04-20T11:32:18+00:00",
    "modified": "2020-04-20T11:32:18+00:00"
  }
};
