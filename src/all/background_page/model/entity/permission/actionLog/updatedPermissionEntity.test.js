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
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import UpdatedPermissionEntity from "./updatedPermissionEntity";
import {defaultUpdatePermissionDto} from "./updatedPermissionEntity.test.data";

describe("Updated permission entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UpdatedPermissionEntity.ENTITY_NAME, UpdatedPermissionEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(9);

    const dto = defaultUpdatePermissionDto();
    const entity = new UpdatedPermissionEntity(dto);

    expect(entity.toDto(UpdatedPermissionEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
    expect(entity.id).toStrictEqual(dto.id);
    expect(entity.type).toStrictEqual(dto.type);
    expect(entity.user.id).toStrictEqual(dto.user.id);
    expect(entity.user.username).toStrictEqual(dto.user.username);
    expect(entity.user.profile.firstName).toStrictEqual(dto.user.profile.first_name);
    expect(entity.user.profile.lastName).toStrictEqual(dto.user.profile.last_name);
    expect(entity.user.profile.avatar.urlMedium).toStrictEqual(dto.user.profile.avatar.url.medium);
    expect(entity.user.profile.avatar.urlSmall).toStrictEqual(dto.user.profile.avatar.url.small);
  });

  it("constructor works fails if not enough data is provided", () => {
    expect.assertions(3);

    expect(() => new UpdatedPermissionEntity({})).toThrow(EntityValidationError);
    expect(() => new UpdatedPermissionEntity({id: "fa5f5d7a-32cc-4c5b-9478-f58584ca4222"})).toThrow(EntityValidationError);
    expect(() => new UpdatedPermissionEntity({"type": 15})).toThrow(EntityValidationError);
  });
});
