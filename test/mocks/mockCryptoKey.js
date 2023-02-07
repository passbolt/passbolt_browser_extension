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
 * @since         3.9.0
 */

import {generateSsoKitServerData} from "../../src/all/background_page/model/entity/sso/ssoKitServerPart.test.data";

class CryptoKey {
  constructor(algorithm, extractable, usages) {
    this.extractable = extractable;
    this.algorithm = algorithm;
    this.usages = usages;
  }
}

global.CryptoKey = CryptoKey;

class CryptoSubtle {
  constructor() {
    this.exportKey = jest.fn().mockImplementation(this.exportKey.bind(this));
    this.importKey = jest.fn().mockImplementation(this.importKey.bind(this));
    this.decrypt = jest.fn().mockImplementation(this.decrypt.bind(this));
    this.encrypt = jest.fn().mockImplementation(this.encrypt.bind(this));
    this.generateKey = jest.fn().mockImplementation(this.generateKey.bind(this));
  }

  async generateKey(algorithm, extractable, capabilities) {
    return new CryptoKey(algorithm, extractable, capabilities);
  }

  async exportKey(keyFormat, keyInformation) {
    const b64Key = generateSsoKitServerData({ext: keyInformation.extractable, key_ops: keyInformation.usages});
    return JSON.parse(Buffer.from(b64Key, "base64").toString());
  }

  async importKey(keyFormat, keyBinData, algorithm, extractable, capabilities) {
    const algo = {
      name: algorithm,
      length: keyBinData.length
    };
    return new CryptoKey(algo, extractable, capabilities);
  }

  async decrypt(algorithm, key, buffer) {
    return buffer;
  }

  async encrypt(algorithm, key, buffer) {
    return buffer;
  }
}

const getRandomValues = typedArray => typedArray.map(() => Math.round(Math.random() * 255));

global.crypto = {
  subtle: new CryptoSubtle(),
  getRandomValues: jest.fn().mockImplementation(getRandomValues)
};
