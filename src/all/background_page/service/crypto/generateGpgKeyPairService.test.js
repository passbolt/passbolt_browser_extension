/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.5.0
 */

/**
 * Unit tests on ConfirmSaveAccountRecoverySettings in regard of specifications
 */

const openpgp = require('openpgp/dist/openpgp');
import textEncoding from 'text-encoding-utf-8';
import Validator from "validator";
import {GenerateGpgKeyPairService} from "./generateGpgKeyPairService";
import {GpgKeyInfoService} from "./gpgKeyInfoService";
import {ExternalGpgKeyEntity} from "../../model/entity/gpgkey/external/externalGpgKeyEntity";

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
 * @since         3.5.0
 */

global.TextEncoder = textEncoding.TextEncoder;

beforeEach(() => {
  window.Validator = Validator;
  window.openpgp = openpgp;
  jest.resetModules();
});

describe("GenerateGpgKeyPair service", () => {
  it('should generate a key pair according to the given parameters', async() => {
    expect.assertions(15);
    const parameters =  {
      name: "Jean-Jacky",
      email: "jj@passbolt.com",
      password: "ultra-secure",
      keySize: 4096
    };

    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(parameters);
    expect(keyPair).not.toBeNull();
    expect(keyPair.public_key).not.toBeNull();
    expect(keyPair.private_key).not.toBeNull();

    const publicKeyInfo = await GpgKeyInfoService.getKeyInfo(new ExternalGpgKeyEntity(keyPair.publicKey));
    expect(publicKeyInfo.algorithm).toBe("RSA");
    expect(publicKeyInfo.user_ids[0]).toEqual({name: parameters.name, email: parameters.email});
    expect(publicKeyInfo.length).toBe(parameters.keySize);
    expect(publicKeyInfo.private).toBe(false);
    expect(publicKeyInfo.revoked).toBe(false);
    expect(publicKeyInfo.expires).toBe("Never");

    const privateKeyInfo = await GpgKeyInfoService.getKeyInfo(new ExternalGpgKeyEntity(keyPair.privateKey));
    expect(privateKeyInfo.algorithm).toBe("RSA");
    expect(privateKeyInfo.user_ids[0]).toEqual({name: parameters.name, email: parameters.email});
    expect(privateKeyInfo.length).toBe(parameters.keySize);
    expect(privateKeyInfo.private).toBe(true);
    expect(privateKeyInfo.revoked).toBe(false);
    expect(privateKeyInfo.expires).toBe("Never");
  }, 50 * 1000);
});
