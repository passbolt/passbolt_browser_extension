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
 * @since         5.7.0
 */

import MockExtension from "../../../../../test/mocks/mockExtension";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ResourceSecretRevisionsCollection from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {defaultResourceSecretRevisionsDtos} from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection.test.data";
import {minimalDto} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";
import {defaultSecretDataV5DefaultTotpEntityDto} from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5DefaultTotpEntity.test.data";
import FindAndDecryptSecretRevisionsService from "./findAndDecryptSecretRevisionsService";
import {v4 as uuidv4} from "uuid";
import DecryptMessageService from "../crypto/decryptMessageService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

describe("FindAndDecryptSecretRevisionsService", () => {
  describe("::findAllByResourceIdAndDecryptForDisplay", () => {
    it("should find and decrypts the secret revisions of a resource and filter out secrets that could not be decrypted", async() => {
      expect.assertions(8);

      await MockExtension.withConfiguredAccount(pgpKeys.ada);

      const encryptedSecretDto = minimalDto().data;
      const pgpMessage = await OpenpgpAssertion.readMessageOrFail(encryptedSecretDto);
      const decryptedSecretDto = defaultSecretDataV5DefaultTotpEntityDto();
      let callCount = 0;
      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => {
        callCount++;
        return callCount <= 2
          ? encryptedSecretDto
          : JSON.stringify(decryptedSecretDto);
      });

      const expectedContains = {
        secret: true,
        creator: true,
        "creator.profile": true,
        /*
         *  Not supported yet
         *  owner_accessors: true,
         * "owner_accessors.profile": true,
         */
      };
      const resource_id = uuidv4();
      const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
      const resourceSecretRevisions = new ResourceSecretRevisionsCollection(defaultResourceSecretRevisionsDtos({resource_id}, {count: 4, withSecrets: true, withCreator: true}));
      const service = new FindAndDecryptSecretRevisionsService(defaultApiClientOptions());
      jest.spyOn(service.resourceTypeModel, "getOrFindAll").mockReturnValue(resourceTypesCollection);
      jest.spyOn(service.findSecretRevisionsService, "findAllByResourceId").mockReturnValue(resourceSecretRevisions);
      jest.spyOn(OpenpgpAssertion, "readMessageOrFail").mockReturnValue(pgpMessage);

      const resourceSecretRevisionsCollection = await service.findAllByResourceIdAndDecryptForDisplay(resource_id, pgpKeys.ada.passphrase);
      expect(resourceSecretRevisionsCollection).toBeInstanceOf(ResourceSecretRevisionsCollection);
      expect(service.findSecretRevisionsService.findAllByResourceId).toHaveBeenCalledTimes(1);
      expect(service.findSecretRevisionsService.findAllByResourceId).toHaveBeenCalledWith(resource_id, expectedContains);
      expect(resourceSecretRevisionsCollection).toHaveLength(2);
      expect(resourceSecretRevisionsCollection.items[0].secrets.hasSecretsDataEncrypted()).toStrictEqual(false);
      expect(resourceSecretRevisionsCollection.items[0].secrets.hasSecretsDataDecrypted()).toStrictEqual(true);
      expect(resourceSecretRevisionsCollection.items[1].secrets.hasSecretsDataEncrypted()).toStrictEqual(false);
      expect(resourceSecretRevisionsCollection.items[1].secrets.hasSecretsDataDecrypted()).toStrictEqual(true);
    });

    it("should return an empty collection if a resource has no revision", async() => {
      expect.assertions(2);

      await MockExtension.withConfiguredAccount(pgpKeys.ada);

      const resource_id = uuidv4();
      const encryptedSecretDto = minimalDto().data;
      const resourceSecretRevisions = new ResourceSecretRevisionsCollection([]);

      const service = new FindAndDecryptSecretRevisionsService(defaultApiClientOptions());
      jest.spyOn(service.resourceTypeModel, "getOrFindAll").mockReturnValue(new ResourceTypesCollection(resourceTypesCollectionDto()));
      jest.spyOn(service.findSecretRevisionsService, "findAllByResourceId").mockReturnValue(resourceSecretRevisions);
      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => encryptedSecretDto);

      const resourceSecretRevisionsCollection = await service.findAllByResourceIdAndDecryptForDisplay(resource_id, pgpKeys.ada.passphrase);
      expect(resourceSecretRevisionsCollection).toBeInstanceOf(ResourceSecretRevisionsCollection);
      expect(resourceSecretRevisionsCollection).toHaveLength(0);
    });

    it("should return an empty collection if no revision could be decrypted", async() => {
      expect.assertions(2);

      await MockExtension.withConfiguredAccount(pgpKeys.ada);

      const resource_id = uuidv4();
      const encryptedSecretDto = minimalDto().data;
      const resourceSecretRevisions = new ResourceSecretRevisionsCollection(defaultResourceSecretRevisionsDtos({resource_id}, {count: 4, withSecrets: true, withCreator: true}));

      const service = new FindAndDecryptSecretRevisionsService(defaultApiClientOptions());
      jest.spyOn(service.resourceTypeModel, "getOrFindAll").mockReturnValue(new ResourceTypesCollection(resourceTypesCollectionDto()));
      jest.spyOn(service.findSecretRevisionsService, "findAllByResourceId").mockReturnValue(resourceSecretRevisions);
      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => encryptedSecretDto);

      const resourceSecretRevisionsCollection = await service.findAllByResourceIdAndDecryptForDisplay(resource_id, pgpKeys.ada.passphrase);
      expect(resourceSecretRevisionsCollection).toBeInstanceOf(ResourceSecretRevisionsCollection);
      expect(resourceSecretRevisionsCollection).toHaveLength(0);
    });

    it("should throw error when user private key description failed", async() => {
      expect.assertions(1);

      await MockExtension.withConfiguredAccount(pgpKeys.ada);
      const passphrase = pgpKeys.admin.passphrase;

      const resource_id = uuidv4();
      const encryptedSecretDto = minimalDto().data;
      const resourceSecretRevisions = new ResourceSecretRevisionsCollection(defaultResourceSecretRevisionsDtos({resource_id}, {count: 4, withSecrets: true, withCreator: true}));

      const service = new FindAndDecryptSecretRevisionsService(defaultApiClientOptions());
      jest.spyOn(service.resourceTypeModel, "getOrFindAll").mockReturnValue(new ResourceTypesCollection(resourceTypesCollectionDto()));
      jest.spyOn(service.findSecretRevisionsService, "findAllByResourceId").mockReturnValue(resourceSecretRevisions);
      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => encryptedSecretDto);

      await expect(() => service.findAllByResourceIdAndDecryptForDisplay(resource_id, passphrase)).rejects.toThrowError();
    });

    it("should assert its parameters", async() => {
      expect.assertions(4);

      const service = new FindAndDecryptSecretRevisionsService(defaultApiClientOptions());

      await expect(() => service.findAllByResourceIdAndDecryptForDisplay(42, "passphrase")).rejects.toThrowError();
      await expect(() => service.findAllByResourceIdAndDecryptForDisplay(null, "passphrase")).rejects.toThrowError();
      await expect(() => service.findAllByResourceIdAndDecryptForDisplay("42", "passphrase")).rejects.toThrowError();
      await expect(() => service.findAllByResourceIdAndDecryptForDisplay(uuidv4(), 42)).rejects.toThrowError();
    });
  });
});
