/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.17.0
 */

/**
 * Mirrors the API begin response body for the default account (domain https://passbolt.local, user ada).
 * user.id is the base64url encoding of the account user id string.
 */
export const defaultWebauthnCredentialCreationOptionsDto = (data = {}) => ({
  rp: {
    id: "passbolt.local",
    name: "Passbolt",
  },
  user: {
    id: "Zjg0ODI3N2MtNTM5OC01OGY4LWE4MmEtNzIzOTdhZjJkNDUw",
    name: "ada@passbolt.com",
    displayName: "Ada Lovelace",
  },
  challenge: "dGhpcy1pcy1hLWNoYWxsZW5nZS1vZi0zMi1ieXRlcw",
  pubKeyCredParams: [
    { type: "public-key", alg: -7 },
    { type: "public-key", alg: -257 },
  ],
  timeout: 300000,
  excludeCredentials: [],
  authenticatorSelection: {
    residentKey: "discouraged",
    userVerification: "preferred",
  },
  attestation: "none",
  ...data,
});
