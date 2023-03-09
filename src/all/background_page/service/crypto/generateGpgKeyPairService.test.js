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
 * @since         3.6.0
 */
import GenerateGpgKeyPairService from "./generateGpgKeyPairService";
import GetGpgKeyInfoService from "./getGpgKeyInfoService";
import GenerateGpgKeyPairOptionsEntity from "../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {defaultDto} from "../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity.test.data";
import {
  customEmailValidationProOrganizationSettings
} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../../model/entity/organizationSettings/organizationSettingsEntity";

describe("GenerateGpgKeyPair service", () => {
  it('should generate a key pair according to the given parameters', async() => {
    expect.assertions(18);
    const keyCreationDate = new Date(0);
    const generateGpgKeyPairOptionsDto = defaultDto({date: keyCreationDate.getTime()});

    const generateGpgKeyPairOptionsEntity = new GenerateGpgKeyPairOptionsEntity(generateGpgKeyPairOptionsDto);
    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairOptionsEntity);
    expect(keyPair).not.toBeNull();
    expect(keyPair.public_key).not.toBeNull();
    expect(keyPair.private_key).not.toBeNull();

    const publicKey = await OpenpgpAssertion.readKeyOrFail(keyPair.publicKey.armoredKey);
    const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(publicKey);
    expect(publicKeyInfo.algorithm).toBe("rsa");
    expect(publicKeyInfo.userIds[0]).toEqual({name: generateGpgKeyPairOptionsDto.name, email: generateGpgKeyPairOptionsDto.email});
    expect(publicKeyInfo.length).toBe(generateGpgKeyPairOptionsDto.keySize);
    expect(publicKeyInfo.private).toBe(false);
    expect(publicKeyInfo.revoked).toBe(false);
    expect(publicKeyInfo.expires).toBe("Infinity");
    expect(publicKeyInfo.created).toBe(keyCreationDate.toISOString());

    const privateKey = await OpenpgpAssertion.readKeyOrFail(keyPair.privateKey.armoredKey);
    const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(privateKey);
    expect(privateKeyInfo.algorithm).toBe("rsa");
    expect(privateKeyInfo.userIds[0]).toEqual({name: generateGpgKeyPairOptionsDto.name, email: generateGpgKeyPairOptionsDto.email});
    expect(privateKeyInfo.length).toBe(generateGpgKeyPairOptionsDto.keySize);
    expect(privateKeyInfo.private).toBe(true);
    expect(privateKeyInfo.revoked).toBe(false);
    expect(privateKeyInfo.expires).toBe("Infinity");
    expect(privateKeyInfo.created).toBe(keyCreationDate.toISOString());

    const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(privateKey, generateGpgKeyPairOptionsDto.passphrase);
    expect(decryptedPrivateKey).not.toBeNull();
  }, 50 * 1000);

  it('should generate a key pair according to the given parameters even without creation date set', async() => {
    jest.useFakeTimers();
    const currentTime = new Date();
    currentTime.setMilliseconds(0);
    jest.setSystemTime(currentTime);
    expect.assertions(18);
    const generateGpgKeyPairOptionsDto = defaultDto();

    const generateGpgKeyPairOptionsEntity = new GenerateGpgKeyPairOptionsEntity(generateGpgKeyPairOptionsDto);
    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairOptionsEntity);
    expect(keyPair).not.toBeNull();
    expect(keyPair.public_key).not.toBeNull();
    expect(keyPair.private_key).not.toBeNull();

    const publicKey = await OpenpgpAssertion.readKeyOrFail(keyPair.publicKey.armoredKey);
    const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(publicKey);
    expect(publicKeyInfo.algorithm).toBe("rsa");
    expect(publicKeyInfo.userIds[0]).toEqual({name: generateGpgKeyPairOptionsDto.name, email: generateGpgKeyPairOptionsDto.email});
    expect(publicKeyInfo.length).toBe(generateGpgKeyPairOptionsDto.keySize);
    expect(publicKeyInfo.private).toBe(false);
    expect(publicKeyInfo.revoked).toBe(false);
    expect(publicKeyInfo.expires).toBe("Infinity");
    expect(publicKeyInfo.created).toBe(currentTime.toISOString());

    const privateKey = await OpenpgpAssertion.readKeyOrFail(keyPair.privateKey.armoredKey);
    const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(privateKey);
    expect(privateKeyInfo.algorithm).toBe("rsa");
    expect(privateKeyInfo.userIds[0]).toEqual({name: generateGpgKeyPairOptionsDto.name, email: generateGpgKeyPairOptionsDto.email});
    expect(privateKeyInfo.length).toBe(generateGpgKeyPairOptionsDto.keySize);
    expect(privateKeyInfo.private).toBe(true);
    expect(privateKeyInfo.revoked).toBe(false);
    expect(privateKeyInfo.expires).toBe("Infinity");
    expect(privateKeyInfo.created).toBe(currentTime.toISOString());

    const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(privateKey, generateGpgKeyPairOptionsDto.passphrase);
    expect(decryptedPrivateKey).not.toBeNull();
  }, 50 * 1000);

  it('should generate a key pair with a non standard email if the application settings customize the email validation.', async() => {
    const organizationSettings = customEmailValidationProOrganizationSettings();
    OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));

    const generateGpgKeyPairOptionsDto = defaultDto({email: 'admin@passbolt.c'});
    const generateGpgKeyPairOptionsEntity = new GenerateGpgKeyPairOptionsEntity(generateGpgKeyPairOptionsDto);
    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairOptionsEntity);

    const publicKey = await OpenpgpAssertion.readKeyOrFail(keyPair.publicKey.armoredKey);
    const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(publicKey);
    expect(publicKeyInfo.userIds[0]).toEqual({name: generateGpgKeyPairOptionsDto.name, email: generateGpgKeyPairOptionsDto.email});
  }, 50 * 1000);
});
