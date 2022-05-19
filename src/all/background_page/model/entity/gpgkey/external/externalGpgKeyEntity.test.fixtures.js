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
const {pgpKeys} = require("../../../../../tests/fixtures/pgpKeys/keys");

exports.ExternalGpgKeyEntityFixtures = {
  minimal_dto: {
    armored_key: pgpKeys.ada.public,
  },
  full_dto: {
    armored_key: pgpKeys.ada.public,
    key_id: "5d9b054f",
    user_ids: [{
      email: "ada@passbolt.com",
      name: "Ada Lovelace"
    }],
    fingerprint: pgpKeys.ada.fingerprint,
    expires: "Never",
    created: "2015-08-09T12:48:31.000Z",
    algorithm: "RSA",
    length: 4096,
    curve: null,
    private: false,
    revoked: false
  },
  missing_required_field_dto: {
    key_id: "5d9b054f",
    user_ids: [{
      email: "ada@passbolt.com",
      name: "Ada Lovelace"
    }],
    fingerprint: pgpKeys.ada.fingerprint,
    expires: "Never",
    created: "2015-08-09T12:48:31.000Z",
    algorithm: "RSA",
    length: 4096,
    curve: null,
    private: false,
    revoked: false
  },
  broken_fields_dto: {
    armored_key: "---",
    key_id: "-",
    user_ids: [{
      email: "fake-email.com"
    }],
    fingerprint: "03f60e958f4cb29723acdf761353b5b15d9b054f03f60e958f4cb29723acdf761353b5b15d9b054f",
    expires: "Never",
    created: null,
    algorithm: "",
    length: "4096",
    curve: false,
    private: "false",
    revoked: "false"
  },
  private_key_dto: {
    armored_key: pgpKeys.ada.private,
    key_id: "5d9b054f",
    user_ids: [{
      email: "ada@passbolt.com",
      name: "Ada Lovelace"
    }],
    fingerprint: pgpKeys.ada.fingerprint,
    expires: "Never",
    created: "2015-08-09T12:48:31.000Z",
    algorithm: "RSA",
    length: 4096,
    curve: null,
    private: true,
    revoked: false
  },
  legacy_full_dto: {
    key: pgpKeys.ada.public,
    keyId: "5d9b054f",
    userIds: [{
      email: "ada@passbolt.com",
      name: "Ada Lovelace"
    }],
    fingerprint: pgpKeys.ada.fingerprint,
    expires: "Mon Oct 26 2024 13:45:08 GMT+0100 (Central European Standard Time)",
    created: "Mon Oct 26 2015 13:45:08 GMT+0100 (Central European Standard Time)",
    algorithm: "RSA",
    length: 4096,
    curve: null,
    private: false,
    revoked: false
  },
  eddsa: {
    armored_key: pgpKeys.anita.public,
    key_id: pgpKeys.anita.key_id,
    user_ids: pgpKeys.anita.user_ids,
    fingerprint: pgpKeys.anita.fingerprint,
    expires: "Never",
    created: pgpKeys.anita.created,
    algorithm: pgpKeys.anita.algorithm,
    length: pgpKeys.anita.length,
    curve: pgpKeys.anita.curve,
    private: false,
    revoked: pgpKeys.anita.revoked,
  }
};
