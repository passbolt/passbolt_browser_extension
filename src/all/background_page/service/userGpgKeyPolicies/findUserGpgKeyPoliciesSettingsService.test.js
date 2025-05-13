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
 * @since         5.1.1
 */

import FindUserGpgKeyPoliciesSettingsService from "./findUserGpgKeyPoliciesSettingsService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import {v4 as uuidV4} from "uuid";
import UserGpgKeyPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/userGpgKeyPolicies/UserGpgKeyPoliciesSettingsEntity";
import {defaultUserGpgKeyPoliciesSettingsDto} from "passbolt-styleguide/src/shared/models/entity/userGpgKeyPolicies/UserGpgKeyPoliciesSettingsEntity.test.data";
import {anonymousOrganizationSettings, defaultCeOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsEntity from "../../model/entity/organizationSettings/organizationSettingsEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindUserGpgKeyPoliciesSettingsService", () => {
  describe("::findSettingsAsGuest", () => {
    it("retrieve the metadata types settings.", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const gpgKeyPoliciesDto = defaultUserGpgKeyPoliciesSettingsDto();
      const service = new FindUserGpgKeyPoliciesSettingsService(apiClientOptions, account);

      jest.spyOn(service.organizationSettingsModel, "getOrFind").mockImplementation(() => new OrganizationSettingsEntity(defaultCeOrganizationSettings()));
      jest.spyOn(service.userGpgKeyPoliciesSettingsApiService, "findSettingsAsGuest").mockImplementation(() => gpgKeyPoliciesDto);

      const userId = uuidV4();
      const authenticationToken = uuidV4();
      const result = await service.findSettingsAsGuest(userId, authenticationToken);

      expect(result).toBeInstanceOf(UserGpgKeyPoliciesSettingsEntity);
      expect(result.preferredKeyType).toStrictEqual(gpgKeyPoliciesDto.preferred_key_type);
      expect(result.source).toStrictEqual(gpgKeyPoliciesDto.source);
    });

    it("should return default setting if plugin is disabled", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const gpgKeyPoliciesDto = UserGpgKeyPoliciesSettingsEntity.createFromDefault();
      const service = new FindUserGpgKeyPoliciesSettingsService(apiClientOptions, account);

      const orgSettings = anonymousOrganizationSettings();
      delete orgSettings.passbolt.plugins?.userGpgKeyPolicies;

      jest.spyOn(service.organizationSettingsModel, "getOrFind").mockImplementation(() => new OrganizationSettingsEntity(orgSettings));
      jest.spyOn(service.userGpgKeyPoliciesSettingsApiService, "findSettingsAsGuest").mockImplementation(() => { throw new Error("Something went wrong!"); });

      const userId = uuidV4();
      const authenticationToken = uuidV4();
      const result = await service.findSettingsAsGuest(userId, authenticationToken);

      expect(result).toBeInstanceOf(UserGpgKeyPoliciesSettingsEntity);
      expect(result.preferredKeyType).toStrictEqual(gpgKeyPoliciesDto.preferredKeyType);
      expect(result.source).toStrictEqual(gpgKeyPoliciesDto.source);
    });

    it("should return default setting if something goes wrong on the API", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const gpgKeyPoliciesDto = UserGpgKeyPoliciesSettingsEntity.createFromDefault();
      const service = new FindUserGpgKeyPoliciesSettingsService(apiClientOptions, account);

      jest.spyOn(service.organizationSettingsModel, "getOrFind").mockImplementation(() => new OrganizationSettingsEntity(defaultCeOrganizationSettings()));
      jest.spyOn(service.userGpgKeyPoliciesSettingsApiService, "findSettingsAsGuest").mockImplementation(() => { throw new Error("Something went wrong!"); });

      const userId = uuidV4();
      const authenticationToken = uuidV4();
      const result = await service.findSettingsAsGuest(userId, authenticationToken);

      expect(result).toBeInstanceOf(UserGpgKeyPoliciesSettingsEntity);
      expect(result.preferredKeyType).toStrictEqual(gpgKeyPoliciesDto.preferredKeyType);
      expect(result.source).toStrictEqual(gpgKeyPoliciesDto.source);
    });

    it("should throw an error if userId is not a valid UUID.", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const service = new FindUserGpgKeyPoliciesSettingsService(apiClientOptions, account);

      const userId = "test";
      const authenticationToken = uuidV4();
      await expect(() => service.findSettingsAsGuest(userId, authenticationToken)).rejects.toThrow("The userId must be a valid UUID");
    });

    it("should throw an error if authenticationToken is not a valid UUID.", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const service = new FindUserGpgKeyPoliciesSettingsService(apiClientOptions, account);

      const userId = uuidV4();
      const authenticationToken = "test";
      await expect(() => service.findSettingsAsGuest(userId, authenticationToken)).rejects.toThrow("The authenticationToken must be a valid UUID");
    });
  });
});
