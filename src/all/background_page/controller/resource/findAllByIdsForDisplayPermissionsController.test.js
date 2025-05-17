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
 * @since         4.10.1
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {multipleResourceDtos} from "../../service/resource/findResourcesService.test.data";
import FindAllByIdsForDisplayPermissionsController from "./findAllByIdsForDisplayPermissionsController";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import ResourceService from "../../service/api/resource/resourceService";
import {v4 as uuidv4} from "uuid";
import {
  TEST_RESOURCE_TYPE_V5_DEFAULT
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {METADATA_KEY_TYPE_USER_KEY} from "../../model/entity/resource/resourceEntity";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {metadata} from "passbolt-styleguide/test/fixture/encryptedMetadata/metadata";

describe("FindAllByIdsForDisplayPermissionsController", () => {
  let controller, worker;

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new FindAllByIdsForDisplayPermissionsController(worker, null, apiClientOptions, account);
  });

  describe("::exec", () => {
    it("should return the resource collection associated to the resource ids", async() => {
      expect.assertions(3);

      const resourcesDto = multipleResourceDtos();
      const resourceIds = resourcesDto.map(resource => resource.id);
      jest.spyOn(controller.findResourcesService.resourceService, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(controller.findResourcesService.decryptMetadataService, "decryptAllFromForeignModels")
        .mockImplementation(collection => collection);
      jest.spyOn(controller.getPassphraseService, "getPassphrase");

      const result = await controller.exec(resourceIds);
      expect(controller.getPassphraseService.getPassphrase).not.toHaveBeenCalled();
      expect(result).toEqual(new ResourcesCollection(resourcesDto));
      expect(controller.findResourcesService.resourceService.findAll).toHaveBeenCalledWith(
        {"permission": true, "permissions.group": true, "permissions.user.profile": true}, {"has-id": resourceIds});
    });

    it("requests the user passphrase whenever the decryption of the metadata requires it and try to load the data again", async() => {
      expect.assertions(3);

      const resourcesDto = [defaultResourceDto({
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT,
        metadata_key_type: METADATA_KEY_TYPE_USER_KEY,
        metadata_key_id: uuidv4(),
        metadata: metadata.withAdaKey.encryptedMetadata[0]
      }
      )];
      const resourceIds = resourcesDto.map(resource => resource.id);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockReturnValue(pgpKeys.ada.passphrase);

      const result = await controller.exec(resourceIds);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      const expectedResourcesDto = JSON.parse(JSON.stringify(resourcesDto));
      expectedResourcesDto[0].metadata = metadata.withAdaKey.decryptedMetadata[0];
      expectedResourcesDto[0].metadata.description = ""; // Encrypted and decrypted dummy data are not equivalent.
      expectedResourcesDto[0].metadata.username = "shared@passbolt.com"; // Encrypted and decrypted dummy data are not equivalent.
      expect(result.toDto()).toEqual(expectedResourcesDto);
      expect(controller.findResourcesService.resourceService.findAll).toHaveBeenCalledTimes(2);
    });

    it("should throw an error if the resource id array is not an array of uuid", async() => {
      expect.assertions(1);

      const promise =  controller.exec([1]);

      await expect(promise).rejects.toThrowError("The given parameter is not a valid array of uuid");
    });
  });
});
