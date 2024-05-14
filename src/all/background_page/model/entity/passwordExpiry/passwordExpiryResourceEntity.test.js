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
 * @since         4.5.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import PasswordExpiryResourceEntity from "./passwordExpiryResourceEntity";
import {defaultPasswordExpiryResourceDto} from "./passwordExpiryResourceEntity.test.data";
import {v4 as uuid} from "uuid";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("PasswordExpiryResource entity", () => {
  describe("PasswordExpiryResourceEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(PasswordExpiryResourceEntity.ENTITY_NAME, PasswordExpiryResourceEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(PasswordExpiryResourceEntity, "id");
      assertEntityProperty.required(PasswordExpiryResourceEntity, "id");
    });

    it("validates expires property", () => {
      const successScenarios = [
        ...assertEntityProperty.SUCCESS_DATETIME_SCENARIO,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = assertEntityProperty.FAIL_DATETIME_SCENARIO;

      assertEntityProperty.assert(PasswordExpiryResourceEntity, "expired", successScenarios, failingScenarios, "format");
      assertEntityProperty.required(PasswordExpiryResourceEntity, "expired");
    });

    it("validates created property", () => {
      assertEntityProperty.string(PasswordExpiryResourceEntity, "created");
      assertEntityProperty.dateTime(PasswordExpiryResourceEntity, "created");
      assertEntityProperty.notRequired(PasswordExpiryResourceEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(PasswordExpiryResourceEntity, "modified");
      assertEntityProperty.dateTime(PasswordExpiryResourceEntity, "modified");
      assertEntityProperty.notRequired(PasswordExpiryResourceEntity, "modified");
    });

    it("validates created_by property", () => {
      assertEntityProperty.uuid(PasswordExpiryResourceEntity, "created_by");
      assertEntityProperty.notRequired(PasswordExpiryResourceEntity, "created_by");
    });

    it("validates modified_by property", () => {
      assertEntityProperty.uuid(PasswordExpiryResourceEntity, "modified_by");
      assertEntityProperty.notRequired(PasswordExpiryResourceEntity, "modified_by");
    });
  });

  it("should accept a mininal valid DTO", () => {
    expect.assertions(2);
    const minmalDto = defaultPasswordExpiryResourceDto();

    const entity = new PasswordExpiryResourceEntity(minmalDto);

    expect(entity.id).toStrictEqual(minmalDto.id);
    expect(entity.expired).toStrictEqual(minmalDto.expired);
  });

  it("should build an entity with given parameters", () => {
    expect.assertions(1);
    const expectedDto = {
      id: uuid(),
      expired: "2024-11-06T10:05:46Z",
      created: "2023-05-06T10:05:46+00:00",
      created_by: uuid(),
      modified: "2023-06-06T10:05:46+00:00",
      modified_by: uuid()
    };

    const entity = new PasswordExpiryResourceEntity(expectedDto);
    expect(entity.toDto()).toStrictEqual(expectedDto);
  });
});
