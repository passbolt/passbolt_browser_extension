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

describe("Updated permission entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UpdatedPermissionEntity.ENTITY_NAME, UpdatedPermissionEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "fa5f5d7a-32cc-4c5b-9478-f58584ca4222",
      "type": 15,
      "user": {
        "id": "f848277c-5398-58f8-a82a-72397af2d450",
        "username": "ada@passbolt.com",
        "profile": {
          "first_name": "Ada",
          "last_name": "Lovelace",
          "avatar": {
            "url": {
              "medium": "img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.a99472d5.png",
              "small": "img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.65a0ba70.png"
            }
          }
        },
      }
    };
    const entity = new UpdatedPermissionEntity(dto);
    expect(entity.toDto(UpdatedPermissionEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
    expect(entity.id).toEqual("fa5f5d7a-32cc-4c5b-9478-f58584ca4222");
    expect(entity.type).toEqual(15);
    expect(entity.user.id).toEqual('f848277c-5398-58f8-a82a-72397af2d450');
    expect(entity.user.username).toEqual('ada@passbolt.com');
    expect(entity.user.profile.firstName).toBe('Ada');
    expect(entity.user.profile.lastName).toBe('Lovelace');
    expect(entity.user.profile.avatar.urlMedium).toBe("img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.a99472d5.png");
    expect(entity.user.profile.avatar.urlSmall).toBe("img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.65a0ba70.png");
  });

  it("constructor works fails if not enough data is provided", () => {
    let t;
    t = () => { new UpdatedPermissionEntity({}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UpdatedPermissionEntity({id: "fa5f5d7a-32cc-4c5b-9478-f58584ca4222"}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UpdatedPermissionEntity({"type": 15}); };
    expect(t).toThrow(EntityValidationError);
  });
});
