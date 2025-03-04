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
 * @since         4.12.0
 */
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import UpdateAllResourceTypesDeletedStatusController from "./updateAllResourceTypesDeletedStatusController";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("UpdateAllResourceTypesDeletedStatusController", () => {
  describe("::exec", () => {
    it("Should throw an error if the given parameter is not a valid resourceTypesCollection dto.", async() => {
      expect.assertions(1);

      const controller = new UpdateAllResourceTypesDeletedStatusController(null, null, defaultApiClientOptions());

      expect(() => controller.exec("42")).rejects.toThrow(EntityValidationError);
    });

    it("Should call for updating the resource types given a collection.", async() => {
      expect.assertions(2);

      const resourceTypesDto = resourceTypesCollectionDto();
      const controller = new UpdateAllResourceTypesDeletedStatusController(null, null, defaultApiClientOptions());

      jest.spyOn(controller.updateResourceTypesService, "updateAllDeletedStatus").mockImplementationOnce(() => {});

      await controller.exec(resourceTypesDto);
      expect(controller.updateResourceTypesService.updateAllDeletedStatus).toHaveBeenCalledTimes(1);
      expect(controller.updateResourceTypesService.updateAllDeletedStatus).toHaveBeenCalledWith(new ResourceTypesCollection(resourceTypesDto));
    });
  });
});
