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
const {pgpKeys} = require("passbolt-styleguide/test/fixture/pgpKeys/keys");

const getKeyDto = key => ({
  armored_key: key.public,
  key_id: key.key_id,
  user_ids: key.user_ids,
  fingerprint: key.fingerprint,
  expires: key.expires,
  created: key.created,
  algorithm: key.algorithm.toLowerCase(),
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

export const eddsaCurveKeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.anita);
  return Object.assign(defaultData, data);
};

export const ecc_p256KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ecdsa_p256);
  return Object.assign(defaultData, data);
};

export const ecc_p384KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ecdsa_p384);
  return Object.assign(defaultData, data);
};

export const ecc_p521KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ecdsa_p521);
  return Object.assign(defaultData, data);
};

export const ecc_curve25519KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.eddsa_ed25519);
  return Object.assign(defaultData, data);
};

export const ecc_secp256k1KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ecdsa_secp256k1);
  return Object.assign(defaultData, data);
};

export const ecc_brainpoolp256r1KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ecdsa_brainpoolp256r1);
  return Object.assign(defaultData, data);
};

export const ecc_brainpoolp384r1KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ecdsa_brainpoolp384r1);
  return Object.assign(defaultData, data);
};

export const ecc_brainpoolp512r1KeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.ecdsa_brainpoolp512r1);
  return Object.assign(defaultData, data);
};

export const invalidKeyDto = (data = {}) => {
  const defaultData = getKeyDto(pgpKeys.invalidKeyWithoutChecksum);
  defaultData.armored_key = pgpKeys.invalidKeyWithoutChecksum.private;
  defaultData.private = true;
  return Object.assign(defaultData, data);
};
