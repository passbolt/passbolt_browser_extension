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
 * @since         2.13.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { v4 as uuidv4 } from "uuid";
import { mockApiResponse, mockApiResponseError } from "../../../../../../test/mocks/mockApiResponse";
import GroupApiService from "./groupApiService";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultGroupDto } from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("GroupApiService", () => {
  describe("::findAll", () => {
    it("should return a PassboltResponseEntity containing all groups", async () => {
      expect.assertions(3);
      const groupsDto = [defaultGroupDto(), defaultGroupDto()];
      fetch.doMockOnceIf(/groups\.json/, () => mockApiResponse(groupsDto));

      const service = new GroupApiService(defaultApiClientOptions());
      const response = await service.findAll();

      expect(response).toBeInstanceOf(PassboltResponseEntity);
      expect(response.body).toHaveLength(2);
      expect(response.body).toStrictEqual(groupsDto);
    });
  });

  describe("::get", () => {
    it("should return a PassboltResponseEntity containing the group for the given id", async () => {
      expect.assertions(3);
      const groupDto = defaultGroupDto();
      let request;
      fetch.doMockOnceIf(new RegExp(`/groups/${groupDto.id}.json`), (req) => {
        request = req;
        return mockApiResponse(groupDto);
      });

      const service = new GroupApiService(defaultApiClientOptions());
      const response = await service.get(groupDto.id);

      expect(response).toBeInstanceOf(PassboltResponseEntity);
      expect(response.body).toStrictEqual(groupDto);
      // No contain params should be sent when no contains is given.
      const containParams = [...new URL(request.url).searchParams.keys()].filter((key) => key.startsWith("contain"));
      expect(containParams).toStrictEqual([]);
    });

    it("should request the given contain options", async () => {
      expect.assertions(3);
      const groupDto = defaultGroupDto();
      const contains = { groups_users: true, my_group_user: true, modifier: false };
      let request;
      fetch.doMockOnceIf(new RegExp(`/groups/${groupDto.id}.json`), (req) => {
        request = req;
        return mockApiResponse(groupDto);
      });

      const service = new GroupApiService(defaultApiClientOptions());
      await service.get(groupDto.id, contains);

      const url = new URL(request.url);
      expect(url.searchParams.get("contain[groups_users]")).toStrictEqual("1");
      expect(url.searchParams.get("contain[my_group_user]")).toStrictEqual("1");
      expect(url.searchParams.get("contain[modifier]")).toStrictEqual("0");
    });

    it("should ignore unsupported contain options", async () => {
      expect.assertions(2);
      const groupDto = defaultGroupDto();
      const contains = { groups_users: true, unsupported_option: true };
      let request;
      fetch.doMockOnceIf(new RegExp(`/groups/${groupDto.id}.json`), (req) => {
        request = req;
        return mockApiResponse(groupDto);
      });

      const service = new GroupApiService(defaultApiClientOptions());
      await service.get(groupDto.id, contains);

      const url = new URL(request.url);
      expect(url.searchParams.get("contain[groups_users]")).toStrictEqual("1");
      expect(url.searchParams.has("contain[unsupported_option]")).toStrictEqual(false);
    });

    it("should throw an error if the API returns a 404", async () => {
      expect.assertions(1);
      const groupId = uuidv4();
      fetch.doMockOnceIf(new RegExp(`/groups/${groupId}.json`), () => mockApiResponseError(404, "Group not found"));

      const service = new GroupApiService(defaultApiClientOptions());

      await expect(service.get(groupId)).rejects.toThrow("Group not found");
    });

    it("should throw a TypeError if the id is not a valid uuid", async () => {
      expect.assertions(1);
      const service = new GroupApiService(defaultApiClientOptions());

      await expect(service.get("not-a-uuid")).rejects.toThrow(TypeError);
    });
  });
});

describe("Group entity", () => {
  it("remap legacy contains", () => {
    const v1 = {
      Group: {
        name: "test name",
      },
      GroupUsers: [
        { GroupUser: { user_id: "uuid1" } },
        { GroupUser: { user_id: "uuid2", is_admin: 1 } },
        { GroupUser: { user_id: "uuid3", is_admin: 0 } },
      ],
    };
    const v2 = {
      name: "test name",
      groups_users: [{ user_id: "uuid1" }, { user_id: "uuid2", is_admin: true }, { user_id: "uuid3", is_admin: false }],
    };
    const sut = GroupApiService.remapV2DataToV1(v2); // crassette
    expect(sut).toEqual(v1);
  });

  it("remap to legacy data", () => {
    let v2 = {
      modifier: true,
      groups_users: true,
    };
    let v1 = {
      modifier: true,
      group_user: true,
    };
    expect(GroupApiService.remapLegacyContain(v2)).toEqual(v1);
    v2 = { groups_users: { user: { profile: true } } };
    v1 = { group_user: { user: { profile: true } } };
    expect(GroupApiService.remapLegacyContain(v2)).toEqual(v1);
  });
});
