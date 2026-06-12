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
import BextUserEntity from "./userEntity";
import AppEmailValidatorService from "../../../service/validator/appEmailValidatorService";
import OrganizationSettingsModel from "../../organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../organizationSettings/organizationSettingsEntity";
import { customEmailValidationProOrganizationSettings } from "../organizationSettings/organizationSettingsEntity.test.data";
import { defaultUserDto } from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import GroupsUsersCollection from "passbolt-styleguide/src/shared/models/entity/groupUser/groupsUsersCollection";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("BextUserEntity", () => {
  describe("BextUserEntity::getSchema", () => {
    it("injects AppEmailValidatorService.validate on username.custom", () => {
      expect.assertions(1);
      const schema = BextUserEntity.getSchema();
      expect(schema.properties.username.custom).toBe(AppEmailValidatorService.validate);
    });

    it("validates username with email format when no custom regex is configured", () => {
      assertEntityProperty.string(BextUserEntity, "username");
      assertEntityProperty.email(BextUserEntity, "username");
      assertEntityProperty.required(BextUserEntity, "username");
    });

    it("validates username with custom validation rule", () => {
      expect.assertions(2);
      const organizationSettings = customEmailValidationProOrganizationSettings();
      OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
      const dto = defaultUserDto({ username: "ada@passbolt.c" });
      const entity = new BextUserEntity(dto);
      expect(entity.username).toEqual("ada@passbolt.c");
      /*
       * Ensure that the custom formula used to validate the format of the email is dynamic, and can be changed even if the
       * entity schema is cached. This formula might loaded after the schema was cached and could lead to user not valid.
       */
      OrganizationSettingsModel.flushCache();
      expect(() => new BextUserEntity(dto)).toThrowEntityValidationError("username", "custom");
    });
  });

  describe("BextUserEntity::constructor", () => {
    it("constructs from a valid default DTO and inherits parent associations", () => {
      expect.assertions(2);
      const dto = defaultUserDto({}, { withGroupsUsers: true });
      const entity = new BextUserEntity(dto);
      expect(entity.username).toEqual(dto.username);
      expect(entity.groupsUsers).toBeInstanceOf(GroupsUsersCollection);
    });
  });
});
