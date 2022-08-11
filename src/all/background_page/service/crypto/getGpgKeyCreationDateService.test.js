/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import GetGpgKeyCreationDateService from "./getGpgKeyCreationDateService";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "../api/apiClient/apiClientOptions.test.data";

let currentTime;
beforeEach(() => {
  enableFetchMocks();
  MockExtension.withMissingPrivateKeyAccount();

  jest.useFakeTimers();
  currentTime = new Date();
  currentTime.setMilliseconds(0);
  jest.setSystemTime(currentTime);
});

describe("GetGpgCompatibleDate service", () => {
  it("should get the server time if it's in the past", async() => {
    const serverTimestamp = currentTime.getTime() - 3600000; //current time minus one hour
    const serverTime = new Date(serverTimestamp);

    fetch.doMock(() => mockApiResponse(anonymousOrganizationSettings(), {servertime: serverTime.getTime() / 1000}));

    const gpgDate = await GetGpgKeyCreationDateService.getDate(defaultApiClientOptions());
    expect(gpgDate).toEqual(serverTime.getTime());
  });

  it("should get the client time if the server time is in the future", async() => {
    const serverTimestamp = currentTime.getTime() + 3600000; //current time plus one hour
    const serverTime = new Date(serverTimestamp);

    fetch.doMock(() => mockApiResponse(anonymousOrganizationSettings(), {servertime: serverTime.getTime() / 1000}));

    const gpgDate = await GetGpgKeyCreationDateService.getDate(defaultApiClientOptions());
    expect(gpgDate).toEqual(currentTime.getTime());
  });

  it("should get by default the client time if the server time is not available", async() => {
    fetch.doMock(() => { throw new Error("Something wrong happened"); });

    const gpgDate = await GetGpgKeyCreationDateService.getDate(defaultApiClientOptions());
    expect(gpgDate).toEqual(currentTime.getTime());
  });
});
