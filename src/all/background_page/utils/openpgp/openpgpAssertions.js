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
    throw new Error("The key should be an openpgp valid armored key string.");
  }

  try {
    return await openpgp.readKey({armoredKey: armoredKey});
  } catch (error) {
    throw new Error("The key should be an openpgp valid armored key string.");
  }
};
exports.readKeyOrFail = readKeyOrFail;

/**
 * Read all open pgp armored key strings in the given array.
 * @param {array<string>} armoredKeys
 * @returns {Promise<array<openpgp.PrivateKey|openpgp.PublicKey>>}
 * @throws {Error} if the armoredKeys is not an array
 * @throws {Error} if one the key couldn't be read
 */
const readAllKeysOrFail = async armoredKeys => {
  if (!Array.isArray(armoredKeys)) {
    throw new Error("The keys should be an array of valid armored key string.");
  }
  return Promise.all(armoredKeys.map(key => readKeyOrFail(key)));
};
exports.readAllKeysOrFail = readAllKeysOrFail;

/**
 * Creates on open pgp from a given clear text message string.
 * @param {string} message the clear text message from which to create an openpgp.Message.
 * @return {Promise<openpgp.Message>}
 * @throws {Error} if the messageis not a string
 */
const createMessageOrFail = async message => {
  if (typeof message !== "string") {
    throw new Error("The message should be of type string.");
  }
  return openpgp.createMessage({text: message, format: 'utf8'});
};
exports.createMessageOrFail = createMessageOrFail;

/**
 * Reads a message in its armored string form.
 * @param {string} message an openg pgp message in its armored form
 * @returns {Promise<openpgp.Message>}
 * @throws {Error} if the message is not a string
 * @throws {Error} if the message can't be parsed as an armored message
 */
const readMessageOrFail = async message => {
  if (typeof message !== "string") {
    throw new Error("The message should be of type string.");
  }

  try {
    return await openpgp.readMessage({armoredMessage: message});
  } catch (error) {
    throw new Error("The message is not a valid openpgp message");
  }
};
exports.readMessageOrFail = readMessageOrFail;

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
    throw new Error("The key should be a valid openpgp key.");
  }
};
exports.assertKey = assertKey;

/**
 * Assert the given array of keys is an array containing openpgp.PublicKey or openpgp.PrivateKey
 * @param {array<openpgp.PublicKey|openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not an openpgp.PublicKey or openpgp.PrivateKey
 */
const assertKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error("The keys should be an array.");
  }
  for (let i = 0; i < keys.length; i++) {
    assertKey(keys[i]);
  }
};
exports.assertKeys = assertKeys;

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
    throw new Error("The key should be an openpgp.PublicKey.");
  }
};
exports.assertPublicKey = assertPublicKey;

/**
 * Assert the given array of keys is an array containing openpgp.PublicKey
 * @param {array<openpgp.PublicKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not openpgp.PublicKey
 */
const assertPublicKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error("The keys should be an array of openpgp.PublicKey.");
  }
  for (let i = 0; i < keys.length; i++) {
    assertPublicKey(keys[i]);
  }
};
exports.assertPublicKeys = assertPublicKeys;

/**
 * Assert the given key is an openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an openpgp.PrivateKey
 */
const assertPrivateKey = key => {
  // we do an extra check for key.isPrivate to keep things coherent with assertPublicKey.
  if (!(key instanceof openpgp.PrivateKey) || (key instanceof openpgp.PrivateKey && !key.isPrivate())) {
    throw new Error("The key should be an openpgp.PrivateKey.");
  }
};
exports.assertPrivateKey = assertPrivateKey;

/**
 * Assert the given array of keys is an array containing openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not openpgp.PrivateKey
 */
const assertPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error("The keys should be an array of openpgp.PrivateKey.");
  }
  for (let i = 0; i < keys.length; i++) {
    assertPrivateKey(keys[i]);
  }
};
exports.assertPrivateKeys = assertPrivateKeys;

/**
 * Assert the given key is a decrypted openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not a decrypted openpgp.PrivateKey
 */
const assertDecryptedPrivateKey = key => {
  assertPrivateKey(key);
  if (!key.isDecrypted()) {
    throw new Error("The private key should be decrypted.");
  }
};
exports.assertDecryptedPrivateKey = assertDecryptedPrivateKey;

/**
 * Assert the given array of keys is an array containing decrypted openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not a decrypted openpgp.PrivateKey
 */
const assertDecryptedPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error("The keys should be an array of decrypted openpgp.PrivateKey.");
  }
  for (let i = 0; i < keys.length; i++) {
    assertDecryptedPrivateKey(keys[i]);
  }
};
exports.assertDecryptedPrivateKeys = assertDecryptedPrivateKeys;

/**
 * Assert the given key is an encrypted openpgp.PrivateKey
 * @param {openpgp.PrivateKey} key
 * @returns {void}
 * @throws {Error} if the key is not an encrypted openpgp.PrivateKey
 */
const assertEncryptedPrivateKey = key => {
  assertPrivateKey(key);
  if (key.isDecrypted()) {
    throw new Error("The private key should be encrypted.");
  }
};
exports.assertEncryptedPrivateKey = assertEncryptedPrivateKey;

/**
 * Assert the given array of keys is an array containing encrypted openpgp.PrivateKey
 * @param {array<openpgp.PrivateKey>} keys
 * @returns {void}
 * @throws {Error} if keys is not an array
 * @throws {Error} if one of the keys is not an encrypted openpgp.PrivateKey
 */
const assertEncryptedPrivateKeys = keys => {
  if (!Array.isArray(keys)) {
    throw new Error("The keys should be an array of encrypted openpgp.PrivateKey.");
  }
  for (let i = 0; i < keys.length; i++) {
    assertEncryptedPrivateKey(keys[i]);
  }
};
exports.assertEncryptedPrivateKeys = assertEncryptedPrivateKeys;

/**
 * Assert the given message is an openpgp.Message
 * @param {openpgp.Message} message
 * @returns {void}
 * @throws {Error} if the message is not an openpgp.Message
 */
const assertMessage = message => {
  if (!(message instanceof openpgp.Message)) {
    throw new Error("The message should be an openpgp.Message");
  }
};
exports.assertMessage = assertMessage;
