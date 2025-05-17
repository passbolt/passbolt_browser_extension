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
 * @since         5.1.0
 */
import MetadataTrustedKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {defaultMetadataTrustedKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity.test.data";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import ConfirmMetadataKeyContentCodeService from "./ConfirmMetadataKeyContentCodeService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ConfirmMetadataKeyContentCodeService", () => {
  describe("::requestConfirm", () => {
    it("request confirm", async() => {
      expect.assertions(2);

      const worker = {
        port: {
          request: jest.fn()
        }
      };
      const metadataTrustedKeyDto = defaultMetadataTrustedKeyDto();
      const metadataTrustedKeyEntity = new MetadataTrustedKeyEntity(metadataTrustedKeyDto);
      const metadataKeyDto = defaultMetadataKeyDto({}, {withMetadataPrivateKeys: true});
      const metadataKeyEntity = new MetadataKeyEntity(metadataKeyDto);

      const service = new ConfirmMetadataKeyContentCodeService(worker);

      jest.spyOn(worker.port, "request").mockImplementation(() => true);


      const result = await service.requestConfirm(metadataTrustedKeyEntity, metadataKeyEntity);

      const expectedDto = {
        metadata_trusted_key: metadataTrustedKeyEntity.toDto(),
        metadata_key: metadataKeyEntity.toContentCodeConfirmTrustRequestDto()
      };

      expect(result).toBeTruthy();
      expect(worker.port.request).toHaveBeenCalledWith("passbolt.metadata-key.trust-confirm", expectedDto);
    });

    it("throw an exception if metadata trusted key is not a MetadataTrustedKeyEntity.", async() => {
      expect.assertions(1);

      const worker = {
        port: {
          request: jest.fn()
        }
      };
      const service = new ConfirmMetadataKeyContentCodeService(worker);

      jest.spyOn(worker.port, "request").mockImplementation(() => true);

      expect(service.requestConfirm({}, {})).rejects.toThrow("The given metadata trusted key entity is not a MetadataTrustedKeyEntity");
    });

    it("throw an exception if metadata key is not a MetadataKeyEntity.", async() => {
      expect.assertions(1);

      const worker = {
        port: {
          request: jest.fn()
        }
      };
      const metadataTrustedKeyDto = defaultMetadataTrustedKeyDto();
      const metadataTrustedKeyEntity = new MetadataTrustedKeyEntity(metadataTrustedKeyDto);
      const service = new ConfirmMetadataKeyContentCodeService(worker);

      jest.spyOn(worker.port, "request").mockImplementation(() => true);

      expect(service.requestConfirm(metadataTrustedKeyEntity, {})).rejects.toThrow("The given metadata key entity is not a MetadataKeyEntity");
    });
  });
});
