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
 * @since         5.6.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MockExtension from "../../../../../../test/mocks/mockExtension";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";
import {defaultProgressService} from "../../progress/progressService.test.data";

import RotateMetadataKeyService from "./rotateMetadataKeyService";
import {v4 as uuidv4} from "uuid";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";

describe("RotateMetadataKeyService", () => {
  let account;

  beforeEach(() => {
    jest.clearAllMocks();

    MockExtension.withConfiguredAccount();
    account = new AccountEntity(defaultAccountDto());
  });

  describe("::rotate", () => {
    it("should run the rotation process", async() => {
      expect.assertions(9);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      const metadataKeyPair = new ExternalGpgKeyPairEntity({
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      });
      const metadataKeyId = uuidv4();
      const passphrase = "ada@passbolt.com";

      // Spy initialization
      jest.spyOn(service.createMetadataKeyService, "create").mockImplementation(jest.fn());
      jest.spyOn(service.expireMetadataKeyService, "expire").mockImplementation(jest.fn());
      jest.spyOn(service.rotateResourcesMetadataKeyService, "rotate").mockImplementation(jest.fn());
      jest.spyOn(service.deleteMetadataKeyService, "delete").mockImplementation(jest.fn());

      // running process
      await service.rotate(metadataKeyPair, metadataKeyId, passphrase);

      // check expectation
      expect(progressService.finishStep).toHaveBeenCalledTimes(4); // create, expire, rotate, delete
      expect(service.createMetadataKeyService.create).toHaveBeenNthCalledWith(1, metadataKeyPair, passphrase);
      expect(service.expireMetadataKeyService.expire).toHaveBeenNthCalledWith(1, metadataKeyId, passphrase);
      expect(service.rotateResourcesMetadataKeyService.rotate).toHaveBeenNthCalledWith(1, passphrase, {count: 0});
      expect(service.deleteMetadataKeyService.delete).toHaveBeenNthCalledWith(1, metadataKeyId);
      expect(progressService.finishStep).toHaveBeenCalledWith(('Creating metadata key'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Expiring metadata key'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Rotating metadata'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Deleting metadata key'));
    });

    it("should throw an error if metadata key pair is not valid", async() => {
      expect.assertions(1);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      const metadataKeyId = uuidv4();
      const passphrase = "ada@passbolt.com";

      // check expectation
      expect(() => service.rotate({}, metadataKeyId, passphrase)).rejects.toThrow("The given data is not of the expected type");
    });

    it("should throw an error if metadata id is not valid uuid", async() => {
      expect.assertions(1);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      const metadataKeyPair = new ExternalGpgKeyPairEntity({
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      });
      const metadataKeyId = "not a uuid";
      const passphrase = "ada@passbolt.com";

      // check expectation
      expect(() => service.rotate(metadataKeyPair, metadataKeyId, passphrase)).rejects.toThrow("The given parameter is not a valid UUID");
    });

    it("should throw an error if passphrase is not valid", async() => {
      expect.assertions(1);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      const metadataKeyPair = new ExternalGpgKeyPairEntity({
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      });
      const metadataKeyId = uuidv4();

      // check expectation
      expect(() => service.rotate(metadataKeyPair, metadataKeyId, {})).rejects.toThrow("The given parameter is not a valid string");
    });
  });

  describe("::resumeRotate", () => {
    it("should resume the rotation process", async() => {
      expect.assertions(8);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      const metadataKey = new MetadataKeyEntity(defaultMetadataKeyDto());
      const passphrase = "ada@passbolt.com";

      // Spy initialization
      jest.spyOn(service.createMetadataKeyService, "create").mockImplementation(jest.fn());
      jest.spyOn(service.expireMetadataKeyService, "expire").mockImplementation(jest.fn());
      jest.spyOn(service.rotateResourcesMetadataKeyService, "rotate").mockImplementation(jest.fn());
      jest.spyOn(service.deleteMetadataKeyService, "delete").mockImplementation(jest.fn());

      // running process
      await service.resumeRotate(metadataKey, passphrase);

      // check expectation
      expect(progressService.finishStep).toHaveBeenCalledTimes(3); // expire, rotate, delete
      expect(service.createMetadataKeyService.create).not.toHaveBeenCalled();
      expect(service.expireMetadataKeyService.expire).toHaveBeenNthCalledWith(1, metadataKey.id, passphrase);
      expect(service.rotateResourcesMetadataKeyService.rotate).toHaveBeenNthCalledWith(1, passphrase, {count: 0});
      expect(service.deleteMetadataKeyService.delete).toHaveBeenNthCalledWith(1, metadataKey.id);
      expect(progressService.finishStep).toHaveBeenCalledWith(('Expiring metadata key'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Rotating metadata'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Deleting metadata key'));
    });

    it("should resume the rotation process without the expiration of metadata key if it's already the case", async() => {
      expect.assertions(8);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      const metadataKey = new MetadataKeyEntity(defaultMetadataKeyDto({expired: new Date().toISOString()}));
      const passphrase = "ada@passbolt.com";

      // Spy initialization
      jest.spyOn(service.createMetadataKeyService, "create").mockImplementation(jest.fn());
      jest.spyOn(service.expireMetadataKeyService, "expire").mockImplementation(jest.fn());
      jest.spyOn(service.rotateResourcesMetadataKeyService, "rotate").mockImplementation(jest.fn());
      jest.spyOn(service.deleteMetadataKeyService, "delete").mockImplementation(jest.fn());

      // running process
      await service.resumeRotate(metadataKey, passphrase);

      // check expectation
      expect(progressService.finishStep).toHaveBeenCalledTimes(3); // expire, rotate, delete
      expect(service.createMetadataKeyService.create).not.toHaveBeenCalled();
      expect(service.expireMetadataKeyService.expire).not.toHaveBeenCalled();
      expect(service.rotateResourcesMetadataKeyService.rotate).toHaveBeenNthCalledWith(1, passphrase, {count: 0});
      expect(service.deleteMetadataKeyService.delete).toHaveBeenNthCalledWith(1, metadataKey.id);
      expect(progressService.finishStep).toHaveBeenCalledWith(('Expiring metadata key'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Rotating metadata'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Deleting metadata key'));
    });

    it("should throw an error if metadata key is not valid", async() => {
      expect.assertions(1);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      // check expectation
      expect(() => service.resumeRotate({}, "ada@passbolt.com")).rejects.toThrow("The given data is not of the expected type");
    });

    it("should throw an error if passphrase is not valid", async() => {
      expect.assertions(1);
      // set base data
      const progressService = defaultProgressService();
      const service = new RotateMetadataKeyService(account, defaultApiClientOptions(), progressService);

      const metadataKey = new MetadataKeyEntity(defaultMetadataKeyDto({expired: new Date().toISOString()}));

      // check expectation
      expect(() => service.resumeRotate(metadataKey, {})).rejects.toThrow("The given parameter is not a valid string");
    });
  });
});
