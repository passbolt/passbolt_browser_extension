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
import LoggedUserEntity from "./loggedUserEntity";

describe("Logged user entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(LoggedUserEntity.ENTITY_NAME, LoggedUserEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
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
    };
    const entity = new LoggedUserEntity(dto);
    expect(entity.toDto(LoggedUserEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
    expect(entity.id).toEqual('f848277c-5398-58f8-a82a-72397af2d450');
    expect(entity.username).toEqual('ada@passbolt.com');
    expect(entity.profile.firstName).toBe('Ada');
    expect(entity.profile.lastName).toBe('Lovelace');
    expect(entity.profile.avatar.urlMedium).toBe("img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.a99472d5.png");
    expect(entity.profile.avatar.urlSmall).toBe("img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.65a0ba70.png");
  });

  it("constructor works fails if not enough data is provided", () => {
    let t;
    t = () => { new LoggedUserEntity({}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new LoggedUserEntity({id: "f848277c-5398-58f8-a82a-72397af2d450"}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new LoggedUserEntity({id: "f848277c-5398-58f8-a82a-72397af2d450", "username": "ada@passbolt.com"}); };
    expect(t).toThrow(EntityValidationError);
  });
});
