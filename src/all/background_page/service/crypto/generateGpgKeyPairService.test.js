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
 * @since         3.5.0
 */

const openpgp = require('openpgp/dist/openpgp');
import textEncoding from 'text-encoding-utf-8';
import Validator from "validator";
import {GenerateGpgKeyPairService} from "./generateGpgKeyPairService";
import {GetGpgKeyInfoService} from "./getGpgKeyInfoService";
import {GenerateGpgKeyPairEntity} from "../../model/entity/gpgkey/generate/generateGpgKeyPairEntity";

global.TextEncoder = textEncoding.TextEncoder;

beforeEach(() => {
  window.Validator = Validator;
  window.openpgp = openpgp;
  jest.resetModules();
});

describe("GenerateGpgKeyPair service", () => {
  it('should generate a key pair according to the given parameters', async() => {
    expect.assertions(15);
    const generateGpgKeyPairDto =  {
      name: "Jean-Jacky",
      email: "jj@passbolt.com",
      passphrase: "ultra-secure",
      keySize: 4096
    };

    const generateGpgKeyPairEntity = new GenerateGpgKeyPairEntity(generateGpgKeyPairDto);
    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairEntity);
    expect(keyPair).not.toBeNull();
    expect(keyPair.public_key).not.toBeNull();
    expect(keyPair.private_key).not.toBeNull();

    const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(keyPair.publicKey);
    expect(publicKeyInfo.algorithm).toBe("RSA");
    expect(publicKeyInfo.userIds[0]).toEqual({name: generateGpgKeyPairDto.name, email: generateGpgKeyPairDto.email});
    expect(publicKeyInfo.length).toBe(generateGpgKeyPairDto.keySize);
    expect(publicKeyInfo.private).toBe(false);
    expect(publicKeyInfo.revoked).toBe(false);
    expect(publicKeyInfo.expires).toBe("Never");

    const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(keyPair.privateKey);
    expect(privateKeyInfo.algorithm).toBe("RSA");
    expect(privateKeyInfo.userIds[0]).toEqual({name: generateGpgKeyPairDto.name, email: generateGpgKeyPairDto.email});
    expect(privateKeyInfo.length).toBe(generateGpgKeyPairDto.keySize);
    expect(privateKeyInfo.private).toBe(true);
    expect(privateKeyInfo.revoked).toBe(false);
    expect(privateKeyInfo.expires).toBe("Never");
  }, 50 * 1000);
});
