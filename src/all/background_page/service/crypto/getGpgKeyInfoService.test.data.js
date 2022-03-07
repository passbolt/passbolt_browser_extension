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
const {pgpKeys} = require("../../../tests/fixtures/pgpKeys/keys");

const getKeyDto = key => ({
  armored_key: key.public,
  key_id: key.key_id,
  user_ids: key.user_ids,
  fingerprint: key.fingerprint,
  expires: key.expires,
  created: key.created,
  algorithm: key.algorithm,
  length: key.length,
  curve: key.curve,
  private: false,
  revoked: key.revoked
});

export const validKeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ada);
  return Object.assign(defaultData, data);
};

export const expiredKeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.expired);
  return Object.assign(defaultData, data);
};

export const revokedKeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.revokedKey);
  return Object.assign(defaultData, data);
};

export const validKeyWithExpirationDateDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.validKeyWithExpirationDateDto);
  return Object.assign(defaultData, data);
};
