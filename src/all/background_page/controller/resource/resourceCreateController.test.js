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
 * @since         4.10.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ResourceCreateController from "./resourceCreateController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultResourceDto, defaultResourceV4Dto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {v4 as uuidv4} from "uuid";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";

jest.mock("../../service/passphrase/getPassphraseService");
jest.mock("../../service/progress/progressService");

beforeEach(() => {
  enableFetchMocks();
});

describe("ResourceCreateController", () => {
  let controller, worker;
  const secret = "secret";

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new ResourceCreateController(worker, null, apiClientOptions, account);
    controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);
    fetch.doMockOnce(() => mockApiResponse(defaultResourceV4Dto()));
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
  });
  describe("AccountRecoveryLoginController::_exec", () => {
    it("Should call the resourceCreateService and emit a success message", async() => {
      expect.assertions(3);

      const resourceDTO = defaultResourceDto();
      jest.spyOn(controller.resourceCreateService, "create").mockImplementationOnce(() => resourceDTO);
      await controller._exec(resourceDTO, secret);

      expect(controller.resourceCreateService.create).toHaveBeenCalledTimes(1);
      expect(controller.resourceCreateService.create).toHaveBeenCalledWith(resourceDTO, secret, pgpKeys.ada.passphrase);
      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'SUCCESS', resourceDTO);
    });

    it("Should call the resourceCreateService and emit an error message", async() => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(controller.resourceCreateService, "create").mockImplementationOnce(() => { throw error; });
      await controller._exec(defaultResourceDto(), null);

      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'ERROR', error);
    });
  });
  describe("AccountRecoveryLoginController::exec", () => {
    it("Should call progress service without folder goals", async() => {
      expect.assertions(2);

      jest.spyOn(controller.resourceCreateService, "create").mockImplementationOnce(jest.fn());
      await controller.exec(defaultResourceDto(), secret);
      expect(controller.progressService.start).toHaveBeenCalledTimes(1);
      expect(controller.progressService.start).toHaveBeenCalledWith(3, 'Initializing');
    });

    it("Should call progress service with folder goals", async() => {
      expect.assertions(2);
      const resource = defaultResourceDto({
        folder_parent_id: uuidv4()
      });
      jest.spyOn(controller.resourceCreateService, "create").mockImplementationOnce(jest.fn());
      await controller.exec(resource, secret);
      expect(controller.progressService.start).toHaveBeenCalledTimes(1);
      expect(controller.progressService.start).toHaveBeenCalledWith(10, 'Initializing');
    });

    it("Should throw an error if the user passphrase cannot be retrieved", async() => {
      expect.assertions(1);

      controller.getPassphraseService.getPassphrase.mockImplementation(() => { throw new Error("Cannot retrieve key"); });
      const promise = controller.exec(defaultResourceDto(), secret);
      await expect(promise).rejects.toThrowError("Cannot retrieve key");
    });

    it("Should close progressService when creation succeed", async() => {
      expect.assertions(2);

      await controller.exec(defaultResourceDto(), secret);
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
      expect(controller.progressService.close).toHaveBeenCalled();
    });

    it("Should close progressService when creation failed", async() => {
      expect.assertions(2);

      jest.spyOn(EncryptMessageService, "encrypt").mockImplementation(() => Promise.reject("Cannot encrypt message"));

      try {
        await controller.exec(defaultResourceDto(), secret);
      } catch {
        expect(controller.progressService.close).toHaveBeenCalledTimes(1);
        expect(controller.progressService.close).toHaveBeenCalled();
      }
    });
  });
});
