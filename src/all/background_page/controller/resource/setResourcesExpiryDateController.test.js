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
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import PassboltServiceUnavailableError from "../../error/passboltServiceUnavailableError";
import PasswordExpiryResourcesCollection from "../../model/entity/passwordExpiry/passwordExpiryResourcesCollection";
import {defaultPasswordExpiryCollectionDto} from "../../model/entity/passwordExpiry/passwordExpiryResourceCollection.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";
import SetResourcesExpiryDateController from "./setResourcesExpiryDateController";
import {enableFetchMocks} from "jest-fetch-mock";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";

jest.mock("../../service/progress/progressService");
jest.mock("../../service/local_storage/resourceLocalStorage");

beforeAll(() => {
  enableFetchMocks();
});

describe("SetResourcesExpiryDateController", () => {
  it("Should call the API to update the expiration date of the given resources", async() => {
    expect.assertions(6);

    const date = new Date();
    const passwordExpiryCollectionDto = defaultPasswordExpiryCollectionDto({expired: date.toISOString()});

    //Mock the API call and check if the call is the one expected
    fetch.doMockOnceIf(/password-expiry\/resources\.json/, async request => {
      const body = JSON.parse(await request.text());
      expect(body).toStrictEqual(passwordExpiryCollectionDto);
      return mockApiResponse(body);
    });

    //Mock the local storage call and check if the given parameters are ok
    ResourceLocalStorage.updateResourcesExpiryDate.mockImplementation(passwordExpiryCollection => {
      const collection = new PasswordExpiryResourcesCollection(passwordExpiryCollectionDto);
      expect(passwordExpiryCollection).toStrictEqual(collection.passwordExpiryResources);
    });

    const worker = {
      port: new MockPort(),
    };

    const controller = new SetResourcesExpiryDateController(worker, null, defaultApiClientOptions());
    await controller.exec(passwordExpiryCollectionDto);

    expect(controller.progressService.start).toHaveBeenCalledTimes(1);
    expect(controller.progressService.start).toHaveBeenCalledWith(2, "Initialize");
    expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    expect(controller.progressService.finishStep).toHaveBeenCalledTimes(2);
  });

  it("Should throw an exception if the API sends an error during the process", async() => {
    const passwordExpiryCollectionDto = defaultPasswordExpiryCollectionDto();

    const controller = new SetResourcesExpiryDateController(null, null, defaultApiClientOptions());

    //Mock the API call and check if the call is the one expected
    fetch.doMockOnceIf(/password-expiry\/resources\.json/, () => mockApiResponseError(500));

    try {
      await controller.exec(passwordExpiryCollectionDto);
    } catch (e) {
      expect(e).toBeInstanceOf(PassboltApiFetchError);
    }
  });

  it("Should throw an exception if an error happened during the process", async() => {
    const passwordExpiryCollectionDto = defaultPasswordExpiryCollectionDto();

    const controller = new SetResourcesExpiryDateController(null, null, defaultApiClientOptions());

    //Mock the API call and check if the call is the one expected
    fetch.doMockOnceIf(/password-expiry\/resources\.json/, () => { throw new Error("Something went wrong!"); });

    try {
      await controller.exec(passwordExpiryCollectionDto);
    } catch (e) {
      expect(e).toBeInstanceOf(PassboltServiceUnavailableError);
    }
  });
});
