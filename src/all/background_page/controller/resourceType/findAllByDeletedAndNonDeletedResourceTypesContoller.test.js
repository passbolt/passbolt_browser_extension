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
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import FindAllByDeletedAndNonDeletedResourceTypesContoller from "./findAllByDeletedAndNonDeletedResourceTypesContoller";

describe("FindAllByDeletedAndNonDeletedResourceTypesContoller", () => {
  describe("::exec", () => {
    it("Should call for the right service and return the ResourceTypesCollection.", async() => {
      expect.assertions(2);

      const expectedCollection = new ResourceTypesCollection(resourceTypesCollectionDto());

      const controller = new FindAllByDeletedAndNonDeletedResourceTypesContoller(null, null, defaultApiClientOptions());
      jest.spyOn(controller.resourceTypeService, "findAllByDeletedAndNonDeleted").mockImplementationOnce(() => expectedCollection);

      const resourceTypesCollection = await controller.exec();

      expect(resourceTypesCollection).toBeInstanceOf(ResourceTypesCollection);
      expect(resourceTypesCollection).toStrictEqual(expectedCollection);
    });
  });
});
