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
 * @since         4.9.4
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ResourceUpdateLocalStorageController from "./resourceUpdateLocalStorageController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ResourceService from "../../service/api/resource/resourceService";
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {TEST_RESOURCE_TYPE_V5_DEFAULT} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {METADATA_KEY_TYPE_USER_KEY} from "../../model/entity/resource/resourceEntity";
import {v4 as uuidv4} from "uuid";
import {metadata} from "passbolt-styleguide/test/fixture/encryptedMetadata/metadata";

describe("ResourceUpdateLocalStorageController", () => {
  let controller, worker;

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new ResourceUpdateLocalStorageController(worker, null, apiClientOptions, account);
  });
  describe("ResourceUpdateLocalStorageController::_exec", () => {
    it("Should call the resourceLocalStorageUpdateService and emit a success message", async() => {
      expect.assertions(3);

      jest.spyOn(controller.findAndUpdateResourcesLocalStorage, "findAndUpdateAll").mockImplementationOnce(jest.fn());
      await controller._exec({updatePeriodThreshold: 10000});

      expect(controller.findAndUpdateResourcesLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(controller.findAndUpdateResourcesLocalStorage.findAndUpdateAll).toHaveBeenCalledWith({updatePeriodThreshold: 10000});
      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'SUCCESS');
    });

    it("Should call the resourceUpdateService and emit an error message", async() => {
      expect.assertions(2);

      const error = new Error();
      jest.spyOn(controller.findAndUpdateResourcesLocalStorage, "findAndUpdateAll").mockImplementationOnce(() => { throw error; });
      await controller._exec();

      expect(controller.findAndUpdateResourcesLocalStorage.findAndUpdateAll).toHaveBeenCalledWith({"updatePeriodThreshold": 10000});
      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'ERROR', error);
    });

    it("Should request passphrase if not set for decryption", async() => {
      expect.assertions(1);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [defaultResourceDto(
        {
          resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT,
          metadata_key_type: METADATA_KEY_TYPE_USER_KEY,
          metadata_key_id: uuidv4(),
          metadata: metadata.withAdaKey.encryptedMetadata[0]
        }
      )
      ]);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(GetPassphraseService.prototype, "requestPassphrase").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(PassphraseStorageService, "set");

      await controller._exec();

      expect(PassphraseStorageService.set).toHaveBeenCalledWith(pgpKeys.ada.passphrase, 60);
    });
  });
});
