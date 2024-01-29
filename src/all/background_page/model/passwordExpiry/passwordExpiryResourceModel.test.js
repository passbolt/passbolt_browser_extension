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
 * @since         4.5.0
 */

import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";
import PasswordExpiryResourcesCollection from "../entity/passwordExpiry/passwordExpiryResourcesCollection";
import {defaultPasswordExpiryCollectionDto} from "../entity/passwordExpiry/passwordExpiryResourceCollection.test.data";
import PasswordExpiryResourceModel from "./passwordExpiryResourceModel";

jest.mock("../../service/local_storage/resourceLocalStorage");

describe("PasswordExpiryResourceModel", () => {
  describe('::update', () => {
    it("Should call for the service to update the date on the API and run callbacks during the process", async() => {
      expect.assertions(2);

      const collectionDto = defaultPasswordExpiryCollectionDto();
      const collection = new PasswordExpiryResourcesCollection(collectionDto);

      const model = new PasswordExpiryResourceModel(defaultApiClientOptions());
      jest.spyOn(model.passwordExpiryResourceService, "update").mockImplementation(collectionDto => {
        expect(collectionDto).toStrictEqual(collection.toDto());
      });

      //Mock the local storage call and check if the given parameters are ok
      ResourceLocalStorage.updateResourcesExpiryDate.mockImplementation(passwordExpiryCollection => {
        const collection = new PasswordExpiryResourcesCollection(collectionDto);
        expect(passwordExpiryCollection).toStrictEqual(collection.passwordExpiryResources);
      });

      await model.update(collection);
    });

    it("Should throw an Error if the something goes wrong during the process", async() => {
      expect.assertions(1);

      const collectionDto = defaultPasswordExpiryCollectionDto();
      const collection = new PasswordExpiryResourcesCollection(collectionDto);

      const model = new PasswordExpiryResourceModel(defaultApiClientOptions());
      const expectedError = new Error("Something went wrong!");
      jest.spyOn(model.passwordExpiryResourceService, "update").mockImplementation(() => { throw expectedError; });

      try {
        await model.update(collection);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
