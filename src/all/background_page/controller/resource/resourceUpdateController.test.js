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
import ResourceUpdateController from "./resourceUpdateController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultResourceDto, defaultResourceV4Dto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";

jest.mock("../../service/passphrase/getPassphraseService");
jest.mock("../../service/progress/progressService");

beforeEach(() => {
  enableFetchMocks();
});

describe("ResourceUpdateController", () => {
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
    controller = new ResourceUpdateController(worker, null, apiClientOptions, account);
    controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);
    fetch.doMockOnce(() => mockApiResponse(defaultResourceV4Dto()));
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
  });
  describe("ResourceUpdateController::_exec", () => {
    it("Should call the resourceUpdateService and emit a success message when only metadata have benn updated", async() => {
      expect.assertions(3);

      const resourceDTO = defaultResourceDto();
      jest.spyOn(controller.resourceUpdateService, "exec").mockImplementationOnce(() => resourceDTO);
      await controller._exec(resourceDTO, null);

      expect(controller.resourceUpdateService.exec).toHaveBeenCalledTimes(1);
      expect(controller.resourceUpdateService.exec).toHaveBeenCalledWith(resourceDTO, null, pgpKeys.ada.passphrase);
      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'SUCCESS', resourceDTO);
    });

    it("Should call the resourceUpdateService and emit a success message", async() => {
      expect.assertions(3);

      const resourceDTO = defaultResourceDto();
      jest.spyOn(controller.resourceUpdateService, "exec").mockImplementationOnce(() => resourceDTO);
      await controller._exec(resourceDTO, secret);

      expect(controller.resourceUpdateService.exec).toHaveBeenCalledTimes(1);
      expect(controller.resourceUpdateService.exec).toHaveBeenCalledWith(resourceDTO, secret, pgpKeys.ada.passphrase);
      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'SUCCESS', resourceDTO);
    });

    it("Should call the resourceUpdateService and emit an error message", async() => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(controller.resourceUpdateService, "exec").mockImplementationOnce(() => { throw error; });
      await controller._exec(defaultResourceDto(), null);

      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'ERROR', error);
    });
  });

  describe("ResourceUpdateController::exec", () => {
    it("Should call progress service without user goals", async() => {
      expect.assertions(2);
      jest.spyOn(controller.verifyOrTrustMetadataKeyService, "verifyTrustedOrTrustNewMetadataKey").mockImplementationOnce(jest.fn);
      jest.spyOn(controller.resourceUpdateService, "exec").mockImplementationOnce(jest.fn);
      await controller.exec(defaultResourceDto(), null);
      expect(controller.progressService.start).toHaveBeenCalledTimes(1);
      expect(controller.progressService.start).toHaveBeenCalledWith(1, 'Updating resource');
    });

    it("Should throw an error if the user passphrase cannot be retrieved", async() => {
      expect.assertions(1);

      controller.getPassphraseService.getPassphrase.mockImplementation(() => { throw new Error("Cannot retrieve key"); });
      const promise = controller.exec(defaultResourceDto(), secret);
      await expect(promise).rejects.toThrowError("Cannot retrieve key");
    });

    it("Should close progressService when update succeed", async() => {
      expect.assertions(2);
      jest.spyOn(ResourceLocalStorage, "updateResource").mockImplementationOnce(jest.fn);
      jest.spyOn(controller.verifyOrTrustMetadataKeyService, "verifyTrustedOrTrustNewMetadataKey").mockImplementationOnce(jest.fn);
      await controller.exec(defaultResourceDto(), null);
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
      expect(controller.progressService.close).toHaveBeenCalled();
    });

    it("Should close progressService when update failed", async() => {
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
