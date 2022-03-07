/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.0.0
 */

import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";

exports.UserEntityTestFixtures = {
  "default": {
    "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
    "username": "admin@passbolt.com",
    "active": true,
    "deleted": false,
    "created": "2020-04-20T11:32:16+00:00",
    "modified": "2020-04-20T11:32:16+00:00",
    "last_logged_in": "2012-07-04T13:39:25+00:00",
    "is_mfa_enabled": false,
    "profile": {
      "id": "92ccfd1b-6eb8-5e1c-a022-cf22463e8361",
      "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "first_name": "Admin",
      "last_name": "User",
      "created": "2020-04-20T11:32:17+00:00",
      "modified": "2020-04-20T11:32:17+00:00",
      "avatar": {
        "url": {
          "medium": "img\/avatar\/user_medium.png",
          "small": "img\/avatar\/user.png"
        }
      }
    },
    "groups_users": [
      {
        "id": "03e26ff8-81d2-5b7f-87e4-99bbc40e1f95",
        "group_id": "428ed4cd-81b1-56af-aa7f-a7cbdbe227e4",
        "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "is_admin": true,
        "created": "2020-04-20T11:32:18+00:00"
      },
      {
        "id": "15b5e2c6-164a-50e9-a46f-2b4a9ab9345a",
        "group_id": "c9c8fd8e-a0fa-53f0-967b-42edca3d91e4",
        "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "is_admin": true,
        "created": "2020-04-20T11:32:18+00:00"
      },
    ],
    "role": {
      "id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "name": "admin",
      "description": "Organization administrator",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00"
    },
    "gpgkey": {
      "id": "91d8a7fd-3ab3-5e98-a4a5-0d8694ff23b9",
      "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "armored_key": pgpKeys.ada.public,
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
    },
    "account_recovery_user_setting": {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "status": "approved",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    },
    "pending_account_recovery_user_request": {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "authentication_token_id": "d4c0e643-3967-443b-93b3-102d902c4512",
      "status": "pending",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    }
  }
};
