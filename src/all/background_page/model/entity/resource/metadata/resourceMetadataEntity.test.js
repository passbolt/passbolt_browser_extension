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
 * @since         4.10.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import ResourceMetadataEntity from "./resourceMetadataEntity";
import {defaultResourceMetadataDto, minimalResourceMetadataDto} from "./resourceMetadataEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("Resource Metadata entity", () => {
  describe("ResourceMetadataEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ResourceMetadataEntity.ENTITY_NAME, ResourceMetadataEntity.getSchema());
    });

    it("validates object_type property", () => {
      assertEntityProperty.string(ResourceMetadataEntity, "object_type");
      assertEntityProperty.enumeration(ResourceMetadataEntity, "object_type", [ResourceMetadataEntity.METADATA_OBJECT_TYPE]);
      assertEntityProperty.notRequired(ResourceMetadataEntity, "object_type");
    });

    it("validates resource_type_id property", () => {
      assertEntityProperty.string(ResourceMetadataEntity, "resource_type_id");
      assertEntityProperty.uuid(ResourceMetadataEntity, "resource_type_id");
      assertEntityProperty.required(ResourceMetadataEntity, "resource_type_id");
    });

    it("validates name property", () => {
      assertEntityProperty.string(ResourceMetadataEntity, "name");
      assertEntityProperty.maxLength(ResourceMetadataEntity, "name", 255);
      assertEntityProperty.required(ResourceMetadataEntity, "name");
    });

    it("validates username property", () => {
      assertEntityProperty.string(ResourceMetadataEntity, "username");
      assertEntityProperty.maxLength(ResourceMetadataEntity, "username", 255);
      assertEntityProperty.nullable(ResourceMetadataEntity, "username");
      assertEntityProperty.notRequired(ResourceMetadataEntity, "username");
    });

    it("validates uris property", () => {
      assertEntityProperty.array(ResourceMetadataEntity, "uris");
      assertEntityProperty.assertArrayItemString(ResourceMetadataEntity, "uris");
      assertEntityProperty.arrayStringMaxLength(ResourceMetadataEntity, "uris", ResourceMetadataEntity.URI_MAX_LENGTH);
    });

    it("validates description property", () => {
      assertEntityProperty.string(ResourceMetadataEntity, "description");
      assertEntityProperty.maxLength(ResourceMetadataEntity, "description", 10_000);
      assertEntityProperty.nullable(ResourceMetadataEntity, "description");
      assertEntityProperty.notRequired(ResourceMetadataEntity, "description");
    });
  });

  describe("ResourceEntity::constructor", () => {
    it("constructor returns validation error if dto required fields are missing", () => {
      try {
        new ResourceMetadataEntity({});
      } catch (error) {
        expect(error instanceof EntityValidationError).toBe(true);
        expect(error.details).toEqual({
          name: {required: "The name is required."},
          resource_type_id: {required: "The resource_type_id is required."},
        });
      }
    });

    it("works if minimal DTO is provided", () => {
      const metadataDto = minimalResourceMetadataDto();
      const metadataEntity = new ResourceMetadataEntity(metadataDto);
      expect(metadataEntity.toDto()).toEqual(metadataDto);
    });

    it("works if complete DTO is provided", () => {
      const metadataDto = defaultResourceMetadataDto();
      const metadataEntity = new ResourceMetadataEntity(metadataDto);
      expect(metadataEntity.toDto()).toEqual(metadataDto);
    });
  });
});
