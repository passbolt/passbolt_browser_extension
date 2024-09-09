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
 * @since         3.0.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ResourceTypeEntity from "./resourceTypeEntity";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {
  resourceTypePasswordAndDescriptionDto,
  resourceTypePasswordDescriptionTotpDto,
  resourceTypePasswordStringDto,
  resourceTypeTotpDto,
  resourceTypeWithoutSecretDefinitionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("ResourceTypeEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ResourceTypeEntity.name, ResourceTypeEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(ResourceTypeEntity, "id");
      assertEntityProperty.required(ResourceTypeEntity, "id");
    });

    it("validates name property", () => {
      assertEntityProperty.string(ResourceTypeEntity, "name");
      assertEntityProperty.minLength(ResourceTypeEntity, "name", 1);
      assertEntityProperty.maxLength(ResourceTypeEntity, "name", 255);
      assertEntityProperty.required(ResourceTypeEntity, "name");
    });

    it("validates slug property", () => {
      assertEntityProperty.string(ResourceTypeEntity, "slug");
      assertEntityProperty.minLength(ResourceTypeEntity, "slug", 1);
      assertEntityProperty.maxLength(ResourceTypeEntity, "slug", 64);
      assertEntityProperty.required(ResourceTypeEntity, "slug");
    });

    it("validates definition property", () => {
      const successScenarios = [assertEntityProperty.SCENARIO_OBJECT];
      /*
       * @todo: //add failing scenarios when nested object will be checked
       */
      const failingScenarios = [];

      assertEntityProperty.assert(ResourceTypeEntity, "definition", successScenarios, failingScenarios, "type");
      assertEntityProperty.required(ResourceTypeEntity, "definition");
    });

    it("validates description property", () => {
      const successScenarios = [
        ...assertEntityProperty.SUCCESS_STRING_SCENARIOS,
        assertEntityProperty.SCENARIO_NULL,
      ];
      const failingScenarios = [
        ...assertEntityProperty.FAIL_STRING_SCENARIOS,
      ];

      assertEntityProperty.assert(ResourceTypeEntity, "description", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(ResourceTypeEntity, "description");
    });

    it("validates created property", () => {
      assertEntityProperty.string(ResourceTypeEntity, "created");
      assertEntityProperty.dateTime(ResourceTypeEntity, "created");
      assertEntityProperty.notRequired(ResourceTypeEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(ResourceTypeEntity, "modified");
      assertEntityProperty.dateTime(ResourceTypeEntity, "modified");
      assertEntityProperty.notRequired(ResourceTypeEntity, "modified");
    });
  });

  describe("::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(1);
      const dto = resourceTypePasswordStringDto();
      const entity = new ResourceTypeEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });

    it("works if full DTO is provided", () => {
      expect.assertions(1);
      const dto = resourceTypePasswordDescriptionTotpDto();
      const resourceTypeEntity = new ResourceTypeEntity(dto);
      expect(resourceTypeEntity.toDto()).toEqual(dto);
    });

    it("should throw an error if slug is unknown", () => {
      expect.assertions(1);
      const dto = resourceTypePasswordAndDescriptionDto({
        slug: "wrong-slug",
      });
      expect(() => new ResourceTypeEntity(dto)).toThrow(new EntityValidationError("Could not validate entity ResourceTypeEntity."));
    });

    it("should throw an error if slug is invalid", () => {
      expect.assertions(1);
      const dto = resourceTypePasswordAndDescriptionDto({
        slug: 42,
      });
      expect(() => new ResourceTypeEntity(dto)).toThrow(new EntityValidationError("Could not validate entity ResourceTypeEntity."));
    });
  });

  describe("::marshall", () => {
    it("should set the right plaintext secret definition for: password-string", () => {
      expect.assertions(2);

      const dto = resourceTypeWithoutSecretDefinitionDto({slug: "password-string"});
      const expectedSecretDefinition = resourceTypePasswordStringDto().definition.secret;

      const resourceTypeEntity = new ResourceTypeEntity(dto);

      expect(resourceTypeEntity.definition.secret).toBeTruthy();
      expect(resourceTypeEntity.definition.secret).toStrictEqual(expectedSecretDefinition);
    });

    it("should set the right plaintext secret definition for: password-and-description", () => {
      expect.assertions(2);

      const dto = resourceTypeWithoutSecretDefinitionDto({slug: "password-and-description"});
      const expectedSecretDefinition = resourceTypePasswordAndDescriptionDto().definition.secret;

      const resourceTypeEntity = new ResourceTypeEntity(dto);

      expect(resourceTypeEntity.definition.secret).toBeTruthy();
      expect(resourceTypeEntity.definition.secret).toStrictEqual(expectedSecretDefinition);
    });

    it("should set the right plaintext secret definition for: password-description-totp", () => {
      expect.assertions(2);

      const dto = resourceTypeWithoutSecretDefinitionDto({slug: "password-description-totp"});
      const expectedSecretDefinition = resourceTypePasswordDescriptionTotpDto().definition.secret;

      const resourceTypeEntity = new ResourceTypeEntity(dto);

      expect(resourceTypeEntity.definition.secret).toBeTruthy();
      expect(resourceTypeEntity.definition.secret).toStrictEqual(expectedSecretDefinition);
    });

    it("should set the right plaintext secret definition for: totp", () => {
      expect.assertions(2);

      const dto = resourceTypeWithoutSecretDefinitionDto({slug: "totp"});
      const expectedSecretDefinition = resourceTypeTotpDto().definition.secret;

      const resourceTypeEntity = new ResourceTypeEntity(dto);

      expect(resourceTypeEntity.definition.secret).toBeTruthy();
      expect(resourceTypeEntity.definition.secret).toStrictEqual(expectedSecretDefinition);
    });
  });

  describe("::getters", () => {
    it("should provide the right values when everything is set", () => {
      expect.assertions(3);

      const dto = resourceTypeWithoutSecretDefinitionDto({slug: "password-description-totp"});
      const entity = new ResourceTypeEntity(dto);

      const expectedDefinition = resourceTypePasswordDescriptionTotpDto().definition;

      expect(entity.id).toStrictEqual(dto.id);
      expect(entity.definition).toStrictEqual(expectedDefinition);
      expect(entity.slug).toStrictEqual(dto.slug);
    });
  });
});
