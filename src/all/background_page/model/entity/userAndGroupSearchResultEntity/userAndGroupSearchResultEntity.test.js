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
import UserAndGroupSearchResultEntity from "./userAndGroupSearchResultEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultProfileDto} from "passbolt-styleguide/src/shared/models/entity/profile/ProfileEntity.test.data";
import {defaultGroupSearchResultDto, defaultUserSearchResultDto} from "./userAndGroupSearchResultEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {v4 as uuid} from 'uuid';

describe("UserAndGroupSearchResultEntity", () => {
  describe("UserAndGroupSearchResultEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(UserAndGroupSearchResultEntity.ENTITY_NAME, UserAndGroupSearchResultEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(UserAndGroupSearchResultEntity, "id");
      assertEntityProperty.uuid(UserAndGroupSearchResultEntity, "id");
      assertEntityProperty.required(UserAndGroupSearchResultEntity, "id");
    });

    it("validates username property", () => {
      assertEntityProperty.string(UserAndGroupSearchResultEntity, "username");
      assertEntityProperty.email(UserAndGroupSearchResultEntity, "username");
      assertEntityProperty.notRequired(UserAndGroupSearchResultEntity, "username");
    });

    it("validates profile property", () => {
      const failProfileScenario = [
        {scenario: "not a profile", value: "not-a-profile"},
        {scenario: "year, month, day, time and zulu", value: "2018-10-18T08:04:30+00:00Z"},
      ];

      const successProfileScenario = [
        {scenario: "a correct profile", value: defaultProfileDto()},
      ];

      assertEntityProperty.assert(UserAndGroupSearchResultEntity, "profile", successProfileScenario, failProfileScenario, "type");
      assertEntityProperty.notRequired(UserAndGroupSearchResultEntity, "profile");
    });

    it("validates name property", () => {
      assertEntityProperty.string(UserAndGroupSearchResultEntity, "name");
      assertEntityProperty.notRequired(UserAndGroupSearchResultEntity, "name");
    });

    it("validates user_count property", () => {
      assertEntityProperty.integer(UserAndGroupSearchResultEntity, "user_count");
      assertEntityProperty.notRequired(UserAndGroupSearchResultEntity, "user_count");
    });
  });

  describe("UserAndGroupSearchResultEntity::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(1);
      const dto = {
        "id": uuid(),
      };
      const entity = new UserAndGroupSearchResultEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });

    it("works if valid user search result DTO is provided", () => {
      const dto = defaultUserSearchResultDto();
      const entity = new UserAndGroupSearchResultEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });

    it("works if valid group search result DTO is provided", () => {
      const dto = defaultGroupSearchResultDto();
      const entity = new UserAndGroupSearchResultEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });
  });
});
