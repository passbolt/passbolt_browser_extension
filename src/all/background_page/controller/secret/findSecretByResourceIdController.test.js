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
 * @since         4.3.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MockExtension from "../../../../../test/mocks/mockExtension";
import FindSecretByResourceIdController from "./findSecretByResourceIdController";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {readSecret} from "../../model/entity/secret/secretEntity.test.data";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {
  plaintextSecretPasswordDescriptionTotpDto,
  plaintextSecretPasswordAndDescriptionDto, plaintextSecretTotpDto
} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {v4 as uuidv4} from "uuid";
import {
  TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP,
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
  TEST_RESOURCE_TYPE_PASSWORD_STRING, TEST_RESOURCE_TYPE_TOTP
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import PlaintextEntity from "../../model/entity/plaintext/plaintextEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto, defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ResourceEntity from "../../model/entity/resource/resourceEntity";

beforeEach(() => {
  enableFetchMocks();
});

jest.mock("../../service/passphrase/getPassphraseService");

describe("SecretDecryptController", () => {
  describe("FindSecretByResourceIdController::exec", () => {
    it("Decrypt successfully a resource with encrypted description.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const user = await MockExtension.withConfiguredAccount();
      const resourceId = uuidv4();
      const plaintextSecretDto = plaintextSecretPasswordAndDescriptionDto();
      const encryptedSecretData = await EncryptMessageService.encrypt(JSON.stringify(plaintextSecretDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public));
      const secretDto = readSecret({
        user_id: user.id,
        resource_id: resourceId,
        data: encryptedSecretData,
      });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
      });
      const resourceEntity = new ResourceEntity(resourceDto);
      fetch.doMockOnceIf(new RegExp(`secrets/resource/${resourceDto.id}.json`), () => mockApiResponse(secretDto));
      const resourceTypesCollection = resourceTypesCollectionDto();
      fetch.doMockOnceIf(new RegExp(`/resource-types.json`), () => mockApiResponse(resourceTypesCollection));

      expect.assertions(2);

      const controller = new FindSecretByResourceIdController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resourceEntity);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);

      const plaintextSecret = await controller.exec(resourceDto.id);
      expect(plaintextSecret).toBeInstanceOf(PlaintextEntity);
      expect(plaintextSecret.password).toEqual(plaintextSecretDto.password);
    });

    it("Decrypt successfully a resource with password string.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const user = await MockExtension.withConfiguredAccount();
      const resourceId = uuidv4();
      const password = "secret-password";
      const encryptedSecretData = await EncryptMessageService.encrypt(password, await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public));
      const secretDto = readSecret({
        user_id: user.id,
        resource_id: resourceId,
        data: encryptedSecretData,
      });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_STRING,
      });
      const resourceEntity = new ResourceEntity(resourceDto);
      fetch.doMockOnceIf(new RegExp(`secrets/resource/${resourceDto.id}.json`), () => mockApiResponse(secretDto));
      const resourceTypesCollection = resourceTypesCollectionDto();
      fetch.doMockOnceIf(new RegExp(`/resource-types.json`), () => mockApiResponse(resourceTypesCollection));

      expect.assertions(2);

      const controller = new FindSecretByResourceIdController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resourceEntity);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);

      const plaintextSecret = await controller.exec(resourceDto.id);
      expect(plaintextSecret).toBeInstanceOf(PlaintextEntity);
      expect(plaintextSecret.password).toEqual(password);
    });

    it("Decrypt successfully a resource with encrypted description and TOTP.", async() => {
      const account = new AccountEntity(adminAccountDto());
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      const resourceId = uuidv4();
      const plaintextSecretDto = plaintextSecretPasswordDescriptionTotpDto();
      const encryptedSecretData = await EncryptMessageService.encrypt(JSON.stringify(plaintextSecretDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const secretDto = readSecret({
        user_id: account.userId,
        resource_id: resourceId,
        data: encryptedSecretData,
      });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP,
      });
      const resourceEntity = new ResourceEntity(resourceDto);
      fetch.doMockOnceIf(new RegExp(`secrets/resource/${resourceDto.id}.json`), () => mockApiResponse(secretDto));
      const resourceTypesCollection = resourceTypesCollectionDto();
      fetch.doMockOnceIf(new RegExp(`/resource-types.json`), () => mockApiResponse(resourceTypesCollection));

      expect.assertions(7);

      const controller = new FindSecretByResourceIdController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resourceEntity);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.admin.passphrase);

      const plaintextSecret = await controller.exec(resourceDto.id);
      expect(plaintextSecret).toBeInstanceOf(PlaintextEntity);
      expect(plaintextSecret.password).toEqual(plaintextSecretDto.password);
      expect(plaintextSecret.description).toEqual(plaintextSecretDto.description);
      expect(plaintextSecret.totp.algorithm).toEqual(plaintextSecretDto.totp.algorithm);
      expect(plaintextSecret.totp.secret_key).toEqual(plaintextSecretDto.totp.secret_key);
      expect(plaintextSecret.totp.digits).toEqual(plaintextSecretDto.totp.digits);
      expect(plaintextSecret.totp.period).toEqual(plaintextSecretDto.totp.period);
    });

    it("Decrypt successfully a resource TOTP.", async() => {
      const account = new AccountEntity(adminAccountDto());
      await MockExtension.withConfiguredAccount(pgpKeys.admin);
      const resourceId = uuidv4();
      const plaintextSecretDto = plaintextSecretTotpDto();
      const encryptedSecretData = await EncryptMessageService.encrypt(JSON.stringify(plaintextSecretDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const secretDto = readSecret({
        user_id: account.userId,
        resource_id: resourceId,
        data: encryptedSecretData,
      });
      const resourceDto = defaultResourceDto({
        id: resourceId,
        resource_type_id: TEST_RESOURCE_TYPE_TOTP,
      });
      const resourceEntity = new ResourceEntity(resourceDto);
      fetch.doMockOnceIf(new RegExp(`secrets/resource/${resourceDto.id}.json`), () => mockApiResponse(secretDto));
      const resourceTypesCollection = resourceTypesCollectionDto();
      fetch.doMockOnceIf(new RegExp(`/resource-types.json`), () => mockApiResponse(resourceTypesCollection));

      expect.assertions(7);

      const controller = new FindSecretByResourceIdController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resourceEntity);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.admin.passphrase);

      const plaintextSecret = await controller.exec(resourceDto.id);
      expect(plaintextSecret).toBeInstanceOf(PlaintextEntity);
      expect(plaintextSecret.password).toBeNull();
      expect(plaintextSecret.description).toBeNull();
      expect(plaintextSecret.totp.algorithm).toEqual(plaintextSecretDto.totp.algorithm);
      expect(plaintextSecret.totp.secret_key).toEqual(plaintextSecretDto.totp.secret_key);
      expect(plaintextSecret.totp.digits).toEqual(plaintextSecretDto.totp.digits);
      expect(plaintextSecret.totp.period).toEqual(plaintextSecretDto.totp.period);
    });
  });
});
