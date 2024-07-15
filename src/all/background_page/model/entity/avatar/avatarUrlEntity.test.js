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
 * @since         4.9.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import AvatarUrlEntity from "./avatarUrlEntity";
import {defaultAvatarUrlDto} from "./avatarUrlEntity.test.data";

describe("AvatarUrlEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AvatarUrlEntity.ENTITY_NAME, AvatarUrlEntity.getSchema());
    });

    it("validates medium property", () => {
      assertEntityProperty.string(AvatarUrlEntity, "medium");
      assertEntityProperty.required(AvatarUrlEntity, "medium");
    });

    it("validates small property", () => {
      assertEntityProperty.string(AvatarUrlEntity, "small");
      assertEntityProperty.required(AvatarUrlEntity, "small");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid DTO is provided", () => {
      expect.assertions(2);
      const dto = defaultAvatarUrlDto();
      const entity = new AvatarUrlEntity(dto);
      expect(entity.medium).toEqual("img/avatar/user_medium.png");
      expect(entity.small).toEqual("img/avatar/user.png");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid DTO is provided", () => {
      expect.assertions(3);
      const dto = defaultAvatarUrlDto();
      const entity = new AvatarUrlEntity(dto);
      const resultDto = entity.toDto();
      expect(resultDto).toEqual(dto);
      expect(resultDto.medium).toEqual("img/avatar/user_medium.png");
      expect(resultDto.small).toEqual("img/avatar/user.png");
    });
  });
});
