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
 * @since         5.4.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import DeleteResourceService from "./deleteResourceService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";

jest.mock("../../../service/progress/progressService");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DeleteResourceService", () => {
  let deleteResourceService, worker;
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = defaultApiClientOptions();

  beforeEach(async() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    deleteResourceService = new DeleteResourceService(worker, account, apiClientOptions);
    jest.spyOn(ResourceLocalStorage, "deleteResources");
  });

  describe("DeleteResourceService::deleteResources", () => {
    it("Should delete the resources and call local storage update", async() => {
      expect.assertions(5);

      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourceDto3 = defaultResourceDto();
      jest.spyOn(deleteResourceService.resourceService, "delete").mockImplementation(() => {});
      await deleteResourceService.deleteResources([resourceDto1.id, resourceDto2.id, resourceDto3.id]);

      expect(deleteResourceService.resourceService.delete).toHaveBeenCalledTimes(3);
      expect(deleteResourceService.resourceService.delete).toHaveBeenCalledWith(resourceDto1.id);
      expect(deleteResourceService.resourceService.delete).toHaveBeenCalledWith(resourceDto2.id);
      expect(deleteResourceService.resourceService.delete).toHaveBeenCalledWith(resourceDto3.id);
      expect(ResourceLocalStorage.deleteResources).toHaveBeenCalledWith([resourceDto1.id, resourceDto2.id, resourceDto3.id]);
    });

    it("Should call progress service during the different steps of deletion", async() => {
      expect.assertions(3);

      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourceDto3 = defaultResourceDto();
      jest.spyOn(deleteResourceService.resourceService, "delete").mockImplementation(() => {});
      await deleteResourceService.deleteResources([resourceDto1.id, resourceDto2.id, resourceDto3.id]);

      expect(deleteResourceService.progressService.finishStep).toHaveBeenCalledTimes(2);
      expect(deleteResourceService.progressService.finishStep).toHaveBeenCalledWith('Deleting Resource(s)', true);
      expect(deleteResourceService.progressService.finishStep).toHaveBeenCalledWith("Updating resources local storage", true);
    });
  });
});
