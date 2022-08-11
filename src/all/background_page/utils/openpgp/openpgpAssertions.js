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
import * as openpgp from 'openpgp';
import i18n from "../../sdk/i18n";

/*
 * ==================================================
 * Read and creates functions
 * ==================================================
 */
/**
 * Read an open pgp armored key string.
 * @param {string} armoredKey the open pgp key in its armored version.
 * @return {Promise<openpgp.PrivateKey|openpgp.PublicKey>}
 * @throws {Error} if the armoredKey is not a string
 * @throws {Error} if the key couldn't be read
 */
const readKeyOrFail = async armoredKey => {
  if (typeof armoredKey !== "string") {
    throw new Error(i18n.t("The key should be a valid openpgp armored key string."));
  }

  try {
    return await openpgp.readKey({armoredKey: armoredKey});
  } catch (error) {
    throw new Error(i18n.t("The key should be a valid openpgp armored key string."));
  }
};

/**
 * Read all open pgp armored key strings in the given array.
 * @param {array<string>} armoredKeys
 * @returns {Promise<array<openpgp.PrivateKey|openpgp.PublicKey>>}
 * @throws {Error} if the armoredKeys is not an array
 * @throws {Error} if one the key couldn't be read
 */
const readAllKeysOrFail = async armoredKeys => {
  if (!Array.isArray(armoredKeys)) {
    throw new Error(i18n.t("The keys should be an array of valid openpgp armored key strings."));
  }
  return Promise.all(armoredKeys.map(key => readKeyOrFail(key)));
};

/**
 * Creates on open pgp from a given clear text message string.
 * @param {string} message the clear text message from which to create an openpgp.Message.
 * @return {Promise<openpgp.Message>}
 * @throws {Error} if the messageis not a string
 */
const createMessageOrFail = async message => {
  if (typeof message !== "string") {
    throw new Error(i18n.t("The message should be of type string."));
  }
  return openpgp.createMessage({text: message, format: 'utf8'});
};

/**
 * Reads a message in its armored string form.
 * @param {string} message an openg pgp message in its armored form
 * @returns {Promise<openpgp.Message>}
 * @throws {Error} if the message is not a string
 * @throws {Error} if the message can't be parsed as an armored message
 */
const readMessageOrFail = async message => {
  if (typeof message !== "string") {
    throw new Error(i18n.t("The message should be of type string."));
  }

  try {
    return await openpgp.readMessage({armoredMessage: message});
  } catch (error) {
    throw new Error(i18n.t("The message should be a valid openpgp message."));
  }
};

/*
 * ==================================================
 * Assertion functions
 * ==================================================
 */
/**
 * Assert the given key is an openpgp.PublicKey or openpgp.PrivateKey
 * @param {openpgp.PublicKey|openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an openpgp.PublicKey or openpgp.PrivateKey
 */
const assertKey = key => {
  if (!(key instanceof openpgp.PublicKey) && !(key instanceof openpgp.PrivateKey)) {
    throw new Error(i18n.t("The key should be a valid openpgp key."));
  }
};

/**
 * Assert the given array of keys is an array containing openpgp.PublicKey or openpgp.PrivateKey
 * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not an openpgp.PublicKey or openpgp.PrivateKey
 */
const assertKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertKey(keys[i]);
  }
};

/**
 * Assert the given key is an openpgp.PublicKey
 * @param {openpgp.PublicKey} key
 * @returns {void}
 * @throws {Error} if the key is not an openpgp.PublicKey
 */
const assertPublicKey = key => {
  /*
   * we need to check for an openpgp.PublicKey is it's private or not.
   * This is due to openpgp js types where an openpgp.PrivateKey is of a type openpgp.PublicKey as well
   */
  if (!(key instanceof openpgp.PublicKey) || (key instanceof openpgp.PublicKey && key.isPrivate())) {
    throw new Error(i18n.t("The key should be a valid openpgp public key."));
  }
};

/**
 * Assert the given array of keys is an array containing openpgp.PublicKey
 * @param {array<openpgp.PublicKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not openpgp.PublicKey
 */
const assertPublicKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid openpgp public keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertPublicKey(keys[i]);
  }
};

/**
 * Assert the given key is an openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an openpgp.PrivateKey
 */
const assertPrivateKey = key => {
  // we do an extra check for key.isPrivate to keep things coherent with assertPublicKey.
  if (!(key instanceof openpgp.PrivateKey) || (key instanceof openpgp.PrivateKey && !key.isPrivate())) {
    throw new Error(i18n.t("The key should be a valid openpgp private key."));
  }
};

/**
 * Assert the given array of keys is an array containing openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not openpgp.PrivateKey
 */
const assertPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid openpgp private keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertPrivateKey(keys[i]);
  }
};

/**
 * Assert the given key is a decrypted openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not a decrypted openpgp.PrivateKey
 */
const assertDecryptedPrivateKey = key => {
  assertPrivateKey(key);
  if (!key.isDecrypted()) {
    throw new Error(i18n.t("The private key should be decrypted."));
  }
};

/**
 * Assert the given array of keys is an array containing decrypted openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not a decrypted openpgp.PrivateKey
 */
const assertDecryptedPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid decrypted openpgp private keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertDecryptedPrivateKey(keys[i]);
  }
};

/**
 * Assert the given key is an encrypted openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an encrypted openpgp.PrivateKey
 */
const assertEncryptedPrivateKey = key => {
  assertPrivateKey(key);
  if (key.isDecrypted()) {
    throw new Error(i18n.t("The private key should be encrypted."));
  }
};

/**
 * Assert the given array of keys is an array containing encrypted openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not an encrypted openpgp.PrivateKey
 */
const assertEncryptedPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error(i18n.t("The keys should be an array of valid encrypted openpgp private keys."));
  }
  for (let i = 0; i < keys.length; i++) {
    assertEncryptedPrivateKey(keys[i]);
  }
};

/**
 * Assert the given message is an openpgp.Message
 * @param {openpgp.Message} message
 * @returns {void}
 * @throws {Error} if the message is not an openpgp.Message
 */
const assertMessage = message => {
  if (!(message instanceof openpgp.Message)) {
    throw new Error(i18n.t("The message should be a valid openpgp message."));
  }
};

export const OpenpgpAssertion = {
  assertMessage,
  assertEncryptedPrivateKeys,
  assertEncryptedPrivateKey,
  assertDecryptedPrivateKeys,
  assertDecryptedPrivateKey,
  assertPrivateKeys,
  assertPrivateKey,
  assertPublicKeys,
  assertPublicKey,
  assertKeys,
  assertKey,
  readMessageOrFail,
  createMessageOrFail,
  readAllKeysOrFail,
  readKeyOrFail
};
