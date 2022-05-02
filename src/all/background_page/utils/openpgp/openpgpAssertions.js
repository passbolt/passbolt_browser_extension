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

const {i18n} = require("../../sdk/i18n");

/**
 * Assert pgp key(s).
 * - Should be a valid armored key or valid openpgp key.
 *
 * @param {array<openpgp.PublicKey|openpgp.Private|string>|openpgp.PublicKey|openpgp.Private|string} keys The key(s) to assert.
 * @returns {array<openpgp.PublicKey|openpgp.Private>|openpgp.PublicKey|openpgp.Private}
 * @private
 */
const assertKeys = async keys => {
  if (Array.isArray(keys)) {
    return Promise.all(keys.map(key => assertKeys(key)));
  }

  if (typeof keys === "string") {
    try {
      keys = await openpgp.readKey({armoredKey: keys});
    } catch (error) {
      throw new Error("The key should be a valid armored key or a valid openpgp key.");
    }
  } else if (!(keys instanceof openpgp.PublicKey) && !(keys instanceof openpgp.PrivateKey)) {
    throw new Error("The key should be a valid armored key or a valid openpgp key.");
  }

  return keys;
};
exports.assertKeys = assertKeys;

/**
 * Assert pgp private key(s).
 * - Should be a valid armored key or valid openpgp key.
 * - Should be private.
 *
 * @param {array<openpgp.Private|string>|openpgp.Private|string} privateKeys The private key(s) to assert.
 * @returns {array<openpgp.Private>|openpgp.Private}
 * @private
 */
const assertPrivateKeys = async privateKeys => {
  if (Array.isArray(privateKeys)) {
    return Promise.all(privateKeys.map(key => assertPrivateKeys(key)));
  }

  const privateKey = await assertKeys(privateKeys);
  if (!privateKey.isPrivate()) {
    throw new Error(i18n.t("The key should be private."));
  }

  return privateKey;
};
exports.assertPrivateKeys = assertPrivateKeys;

/**
 * Assert pgp private decrypted key(s).
 * - Should be a valid armored key or valid openpgp key.
 * - Should be private.
 * - Should be decrypted.
 *
 * @param {array<openpgp.PrivateKey|string>|openpgp.PrivateKey|string} privateKeys The private key(s) to assert.
 * @returns {array<openpgp.PrivateKey>|openpgp.PrivateKey}
 * @private
 */
const assertDecryptedPrivateKeys = async privateKeys => {
  if (Array.isArray(privateKeys)) {
    return Promise.all(privateKeys.map(key => assertDecryptedPrivateKeys(key)));
  }

  const privateKey = await assertPrivateKeys(privateKeys);
  if (!privateKey.isDecrypted()) {
    throw new Error("The private key should be decrypted.");
  }

  return privateKey;
};
exports.assertDecryptedPrivateKeys = assertDecryptedPrivateKeys;

/**
 * Assert pgp private encrypted key(s).
 * - Should be a valid armored key or valid openpgp key.
 * - Should be private.
 * - Should be encrypted.
 *
 * @param {array<openpgp.PrivateKey|string>|openpgp.PrivateKey|string} privateKeys The private key(s) to assert.
 * @returns {array<openpgp.PrivateKey>|openpgp.PrivateKey}
 * @private
 */
const assertEncryptedPrivateKeys = async privateKeys => {
  if (Array.isArray(privateKeys)) {
    return Promise.all(privateKeys.map(key => assertEncryptedPrivateKeys(key)));
  }

  const privateKey = await assertPrivateKeys(privateKeys);
  if (privateKey.isDecrypted()) {
    throw new Error("The private key should not be decrypted.");
  }

  return privateKey;
};
exports.assertEncryptedPrivateKeys = assertEncryptedPrivateKeys;

/**
 * Assert pgp key(s).
 * - Should be a valid armored key or valid openpgp key.
 *
 * @param {array<openpgp.PublicKey|string>|openpgp.PublicKey|string} publicKeys The private key(s) to assert.
 * @returns {array<openpgp.PublicKey>|openpgp.PublicKey}
 * @private
 */
const assertPublicKeys = async publicKeys => {
  if (Array.isArray(publicKeys)) {
    return Promise.all(publicKeys.map(key => assertPublicKeys(key)));
  }

  const publicKey = await assertKeys(publicKeys);
  if (publicKey.isPrivate()) {
    throw new Error(i18n.t("The key should be public."));
  }

  return publicKey;
};
exports.assertPublicKeys = assertPublicKeys;

/**
 * Assert pgp message.
 * - Should be a valid message.
 *
 * @param {openpgp.Message|string} message The message to assert.
 * @returns {openpgp.Message}
 * @private
 */
const assertMessageToEncrypt = async message => {
  if (typeof message === "string") {
    message = await openpgp.createMessage({text: message, format: 'utf8'});
  } else if (!(message instanceof openpgp.Message)) {
    throw new Error("The message should be of type string or openpgp.Message");
  }

  return message;
};
exports.assertMessageToEncrypt = assertMessageToEncrypt;

/**
 * Assert pgp encrypted message.
 * - Should be a valid message.
 *
 * @param {openpgp.Message|string} message The message to assert.
 * @returns {openpgp.Message}
 * @private
 */
const assertEncryptedMessage = async message => {
  if (typeof message === "string") {
    try {
      message = await openpgp.readMessage({armoredMessage: message});
    } catch (error) {
      throw new Error("The message is not a valid openpgp message");
    }
  } else if (!(message instanceof openpgp.Message)) {
    throw new Error("The message should be of type string or openpgp.Message");
  }

  return message;
};
exports.assertEncryptedMessage = assertEncryptedMessage;
