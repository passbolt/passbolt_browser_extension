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
 * @since         5.8.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from '../../model/entity/account/accountEntity.test.data';
import FindRolesService from "./findRolesService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import {rolesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection.test.data";
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import {TEST_ROLE_GUEST_ID, adminRoleDto} from "passbolt-styleguide/src/shared/models/entity/role/roleEntity.test.data";

describe('FindRolesService', () => {
  beforeEach(async() => {
    jest.clearAllMocks();
  });

  describe('::findAll', () => {
    it("should find all roles", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = rolesCollectionDto;
      const expectedCollectionDto = rolesCollectionDto.filter(r => r.name !== RoleEntity.ROLE_GUEST);
      const service = new FindRolesService(account, apiClientOptions);
      jest.spyOn(service.roleApiService, "findAll").mockImplementation(async() => new PassboltResponseEntity({header: {}, body: collectionDto}));

      const result = await service.findAll();
      expect(result).toBeInstanceOf(RolesCollection);
      expect(result).toHaveLength(expectedCollectionDto.length);
      expect(result.toDto()).toStrictEqual(expectedCollectionDto);
    });

    it("should let error be thrown from the api service", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const service = new FindRolesService(account, apiClientOptions);
      jest.spyOn(service.roleApiService, "findAll").mockImplementation(async() => { throw new Error("Something went wrong"); });

      await expect(() => service.findAll()).rejects.toThrowError();
    });

    it("should throw an error if the data is invalid", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = [adminRoleDto(), adminRoleDto()];

      const service = new FindRolesService(account, apiClientOptions);
      jest.spyOn(service.roleApiService, "findAll").mockImplementation(async() => new PassboltResponseEntity({header: {}, body: collectionDto}));

      await expect(() => service.findAll()).rejects.toThrowError();
    });

    it("should not have the guest role in the resulting list", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();

      const collectionDto = rolesCollectionDto;
      const service = new FindRolesService(account, apiClientOptions);
      jest.spyOn(service.roleApiService, "findAll").mockImplementation(async() => new PassboltResponseEntity({header: {}, body: collectionDto}));

      const result = await service.findAll();
      expect(result).toBeInstanceOf(RolesCollection);
      expect(result).toHaveLength(collectionDto.length - 1);
      expect(result.getById(TEST_ROLE_GUEST_ID)).toBeNull();
    });
  });
});
