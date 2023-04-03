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
 * @since         3.10.0
 */
import Validator from "validator";
import SsoSettingsEntity from "../model/entity/sso/ssoSettingsEntity";
import {ValidatorRule} from "./validatorRules";

const UUID_REGEXP = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

/**
 * Assert that the given parameter is a valid UUID.
 * @param {string<UUID>} uuidString the parameter to validate
 * @param {string} [errorMessage] the message to throw withing the Error if any
 * @throws {Error} if the parameter is not valid
 */
export const assertUuid = (uuidString, errorMessage = "The given parameter is not a valid UUID") => {
  if (!UUID_REGEXP.test(uuidString)) {
    throw new Error(errorMessage);
  }
};

/**
 * Assert that the given parameter is a valid Base64 string.
 * @param {string<base64>} base64String the parameter to validate
 * @throws {Error} if the parameter is not valid
 */
export const assertBase64String = base64String => {
  if (!Validator.isBase64(base64String)) {
    throw new Error("The given parameter is not a valid base64 string");
  }
};

/**
 * Assert that the given parameter is a valid passphrase string.
 * @param {string} string the parameter to validate
 * @throws {Error} if the parameter is not valid
 */
export const assertPassphrase = string => {
  if (!ValidatorRule.isUtf8Extended(string)) {
    throw new Error('The given parameter should be a valid UTF8 string.');
  }
};

/**
 * Assert that the given parameter is a valid CryptoKey usable for SSO feature.
 * @param {CryptoKey} ssoKey the parameter to validate
 * @throws {Error} if the parameter is not valid
 * @private
 */
const assertSsoKey = ssoKey => {
  if (!(ssoKey instanceof CryptoKey)) {
    throw new Error("The given parameter is not a CryptoKey");
  }

  const algorithm = ssoKey.algorithm;
  if (algorithm.name !== 'AES-GCM') {
    throw new Error("The given key should use the algorithm 'AES-GCM'");
  }

  if (algorithm.length < 256) {
    throw new Error("The given key length should be of 256 bits");
  }

  const capabilities = ssoKey.usages;
  const areCapabilitiesValid =
    capabilities.length === 2
    && capabilities.includes("encrypt")
    && capabilities.includes("decrypt");

  if (!areCapabilitiesValid) {
    throw new Error("The given key should be usable for encryption and decryption only");
  }
};

/**
 * Assert that the given parameter is a valid CryptoKey usable for SSO feature and is not extractable.
 * @param {CryptoKey} nonExtractableKey the parameter to validate
 * @throws {Error} if the parameter is not valid
 */
export const assertNonExtractableSsoKey = nonExtractableKey => {
  assertSsoKey(nonExtractableKey);

  if (nonExtractableKey.extractable) {
    throw new Error("The given key should not be extractable");
  }
};

/**
 * Assert that the given parameter is a valid CryptoKey usable for SSO feature and is extractable.
 * @param {CryptoKey} extractableKey the parameter to validate
 * @throws {Error} if the parameter is not valid
 */
export const assertExtractableSsoKey = extractableKey => {
  assertSsoKey(extractableKey);

  if (!extractableKey.extractable) {
    throw new Error("The given key should be extractable");
  }
};

/**
 * Assert that the given parameter is valid Initialisation Vector for SSO feature.
 * @param {Uint8Array} initialisationVector the parameter to validate
 * @throws {Error} if the parameter is not valid
 */
export const assertValidInitialisationVector = initialisationVector => {
  if (!(initialisationVector instanceof Uint8Array)) {
    throw new Error("The given initialisation vector should be a Uint8Array");
  }

  if (initialisationVector.length !== 12) {
    throw new Error("The initialisation vector should be 12 bytes long");
  }
};

/**
 * Assert that the given parameter is a valid SSO provider identifier.
 * @param {string} provider the parameter to validate
 * @throws {Error} if the parameter is not valid
 * @private
 */
export const assertSsoProvider = provider => {
  const isFound = SsoSettingsEntity.AVAILABLE_PROVIDERS.findIndex(el => el === provider) !== -1;
  if (!isFound) {
    throw new Error("The given provider identifier is not a valid SSO provider");
  }
};

/**
 * Assert that the given parameter is a valid UUID.
 * @param {string} str the parameter to validate
 * @param {string} [errorMessage] the message to throw withing the Error if any
 * @throws {Error} if the parameter is not valid
 */
export const assertString = (str, errorMessage = "The given parameter is not a valid string") => {
  if (typeof str !== 'string' && !(str instanceof String)) {
    throw new Error(errorMessage);
  }
};
