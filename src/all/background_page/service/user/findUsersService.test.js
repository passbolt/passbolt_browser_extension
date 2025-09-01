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
 * @since         4.11.0
 */

import {defaultUsersDtos} from "passbolt-styleguide/src/shared/models/entity/user/usersCollection.test.data";
import UsersCollection from "../../model/entity/user/usersCollection";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindUsersService from "./findUsersService";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import UserLocalStorage from "../local_storage/userLocalStorage";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import {
  customEmailValidationProOrganizationSettings
} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../../model/entity/organizationSettings/organizationSettingsEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindResourcesService", () => {
  let findUsersService, apiClientOptions;
  const account = new AccountEntity(defaultAccountDto());
  const defaultFindAllContains = {
    profile: false,
    gpgkey: false,
    groups_users: false,
    role: false,
  };

  beforeEach(async() => {
    apiClientOptions = defaultApiClientOptions();
    findUsersService = new FindUsersService(account, apiClientOptions);
  });

  describe("::findAll", () => {
    it("returns all users as a collection.", async() => {
      expect.assertions(2);

      const usersDto = defaultUsersDtos();
      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue(usersDto);

      const users = await findUsersService.findAll();

      expect(users).toBeInstanceOf(UsersCollection);
      expect(users.toDto()).toEqual(usersDto);
    });

    it("disables default API contains when not explicitly requested.", async() => {
      expect.assertions(1);

      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue([]);

      await findUsersService.findAll();

      expect(findUsersService.userApiService.findAll).toHaveBeenCalledWith(defaultFindAllContains, {});
    });

    it("requests the API with the given contains.", async() => {
      expect.assertions(3);

      const usersDto = defaultUsersDtos();
      jest.spyOn(findUsersService.userApiService, "findAll").mockImplementation(() => usersDto);

      const users = await findUsersService.findAll({
        is_mfa_enabled: true,
        last_logged_in: true,
        gpgkey: true,
        groups_users: true,
        profile: true,
        role: true,
        account_recovery_user_setting: true,
        pending_account_recovery_request: true,
      }, null);

      expect(users).toBeInstanceOf(UsersCollection);
      expect(findUsersService.userApiService.findAll).toHaveBeenCalledWith({
        is_mfa_enabled: true,
        last_logged_in: true,
        gpgkey: true,
        groups_users: true,
        profile: true,
        role: true,
        account_recovery_user_setting: true,
        pending_account_recovery_request: true,
      }, null);
      expect(users.toDto()).toEqual(usersDto);
    });

    it("throws if unsupported contains are given.", async() => {
      expect.assertions(1);

      const usersDto = defaultUsersDtos();
      jest.spyOn(findUsersService.userApiService, "findAll").mockImplementation(() => usersDto);

      const promise = findUsersService.findAll({
        invalid: true
      });

      expect(promise).rejects.toThrow(Error("Unsupported contains parameter used, please check supported contains"));
    });

    it("requests the API with the give filters.", async() => {
      expect.assertions(3);

      const usersDto = defaultUsersDtos();
      jest.spyOn(findUsersService.userApiService, "findAll").mockImplementation(() => usersDto);

      const users = await findUsersService.findAll(null, {
        "search": false,
        "has-groups": true,
        "has-access": false,
        "is-admin": true,
        "is-active": true,
      });

      expect(users).toBeInstanceOf(UsersCollection);
      expect(findUsersService.userApiService.findAll).toHaveBeenCalledWith(defaultFindAllContains, {
        "search": false,
        "has-groups": true,
        "has-access": false,
        "is-admin": true,
        "is-active": true,
      });
      expect(users.toDto()).toEqual(usersDto);
    });

    it("throws if unsupported filters are given.", async() => {
      expect.assertions(1);

      const usersDto = defaultUsersDtos();
      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue(usersDto);

      const promise = findUsersService.findAll(null, {
        "is-not-supported": true
      });

      expect(promise).rejects.toThrow(Error("Unsupported filter parameter used, please check supported filters"));
    });

    it("skips invalid entity with ignore strategy.", async() => {
      expect.assertions(2);

      const usersDto = defaultUsersDtos();
      const usersDtoWithInvalidUser = usersDto.concat([defaultUserDto({
        username: null
      })]);

      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue(usersDtoWithInvalidUser);
      const users = await findUsersService.findAll(null, null, true);

      expect(users).toHaveLength(10);
      expect(users.toDto(UserLocalStorage.DEFAULT_CONTAIN)).toEqual(usersDto);
    });

    it("does not skip invalid entity without ignore strategy.", async() => {
      expect.assertions(1);

      let usersDto = defaultUsersDtos();
      usersDto = usersDto.concat([defaultUserDto({
        username: null
      })]);

      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue(usersDto);
      const promise = findUsersService.findAll(null, null, false);

      await expect(promise).rejects.toThrow(CollectionValidationError);
    });

    it("validates username with custom validation rule", async() => {
      expect.assertions(2);

      const organizationSettings = customEmailValidationProOrganizationSettings();
      OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
      const usersDto = [defaultUserDto({username: "ada@passbolt.c"})];
      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue(usersDto);

      const users = await findUsersService.findAll();

      expect(users.items[0].username).toBe("ada@passbolt.c");

      /*
       * Ensure that the custom formula used to validate the format of the email is dynamic, and can be changed even if the
       * entity schema is cached. This formula might loaded after the schema was cached and could lead to user not valid.
       */
      OrganizationSettingsModel.flushCache();
      try {
        await findUsersService.findAll();
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error?.details?.[0]?.username?.custom).not.toBeUndefined();
      }
    });
  });

  describe("::findAllActive", () => {
    it("requests the API with the is-active filter.", async() => {
      expect.assertions(2);
      const usersDto = defaultUsersDtos();
      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue(usersDto);

      const users = await findUsersService.findAllActive();

      const expectedFilters = {"is-active": true};
      expect(findUsersService.userApiService.findAll).toHaveBeenCalledWith(defaultFindAllContains, expectedFilters);
      expect(users).toBeInstanceOf(UsersCollection);
    });
  });

  describe("::findAllActive", () => {
    it("requests the API with the is-active filter.", async() => {
      expect.assertions(2);
      const usersDto = defaultUsersDtos();
      jest.spyOn(findUsersService.userApiService, "findAll").mockReturnValue(usersDto);

      const users = await findUsersService.findAllActiveWithMissingKeys();

      const expectedContains = {...defaultFindAllContains, "missing_metadata_key_ids": true};
      const expectedFilters = {"is-active": true};
      expect(findUsersService.userApiService.findAll).toHaveBeenCalledWith(expectedContains, expectedFilters);
      expect(users).toBeInstanceOf(UsersCollection);
    });
  });
});
