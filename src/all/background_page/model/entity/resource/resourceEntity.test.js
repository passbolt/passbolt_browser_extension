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
import ResourceEntity from "./resourceEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultResourceDto, defaultResourceV4Dto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ResourceMetadataEntity from "./metadata/resourceMetadataEntity";

describe("Resource entity", () => {
  describe("ResourceEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ResourceEntity.ENTITY_NAME, ResourceEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(ResourceEntity, "id");
      assertEntityProperty.uuid(ResourceEntity, "id");
      assertEntityProperty.notRequired(ResourceEntity, "id");
    });

    it("validates expired property", () => {
      assertEntityProperty.dateTime(ResourceEntity, "expired");
      assertEntityProperty.nullable(ResourceEntity, "expired");
      assertEntityProperty.notRequired(ResourceEntity, "expired");
    });

    it("validates deleted property", () => {
      assertEntityProperty.boolean(ResourceEntity, "deleted");
      assertEntityProperty.notRequired(ResourceEntity, "deleted");
    });

    it("validates created property", () => {
      assertEntityProperty.string(ResourceEntity, "created");
      assertEntityProperty.dateTime(ResourceEntity, "created");
      assertEntityProperty.notRequired(ResourceEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(ResourceEntity, "modified");
      assertEntityProperty.dateTime(ResourceEntity, "modified");
      assertEntityProperty.notRequired(ResourceEntity, "modified");
    });

    it("validates created_by property", () => {
      assertEntityProperty.uuid(ResourceEntity, "created_by");
      assertEntityProperty.notRequired(ResourceEntity, "created_by");
    });

    it("validates modified_by property", () => {
      assertEntityProperty.uuid(ResourceEntity, "modified_by");
      assertEntityProperty.notRequired(ResourceEntity, "modified_by");
    });

    it("validates folder_parent_id property", () => {
      assertEntityProperty.uuid(ResourceEntity, "folder_parent_id");
      assertEntityProperty.nullable(ResourceEntity, "folder_parent_id");
      assertEntityProperty.notRequired(ResourceEntity, "folder_parent_id");
    });

    it("validates resource_type_id property", () => {
      assertEntityProperty.string(ResourceEntity, "resource_type_id");
      assertEntityProperty.uuid(ResourceEntity, "resource_type_id");
      assertEntityProperty.notRequired(ResourceEntity, "resource_type_id");
    });

    it("validates personal property", () => {
      assertEntityProperty.boolean(ResourceEntity, "personal");
      assertEntityProperty.notRequired(ResourceEntity, "personal");
      assertEntityProperty.nullable(ResourceEntity, "personal");
    });
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(1);

    const contain = {secrets: true, permissions: true, permission: true, tags: true, favorite: true, creator: true, modifier: true};
    const dto = defaultResourceDto({}, contain);
    const entity = new ResourceEntity(dto);

    expect(entity.toDto(contain)).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new ResourceEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        name: {type: "The name is not a valid string."},
      });
    }
  });

  describe("ResourceEntity::transformDtoFromV4toV5", () => {
    it("Should transform DTO by including V5 format", () => {
      expect.assertions(6);

      const resourceDTO = defaultResourceV4Dto();
      const entityV5 = ResourceEntity.transformDtoFromV4toV5(resourceDTO);

      // V4 root format
      expect(entityV5.name).toEqual(resourceDTO.name);
      expect(entityV5.description).toEqual(resourceDTO.description);
      expect(entityV5.username).toEqual(resourceDTO.username);
      expect(entityV5.uri).toEqual(resourceDTO.uri);
      expect(entityV5.resource_type_id).toEqual(resourceDTO.resource_type_id);
      // V5 metata data object
      expect(entityV5.metadata).toEqual({
        object_type: ResourceMetadataEntity.METADATA_OBJECT_TYPE,
        resource_type_id: resourceDTO.resource_type_id,
        name: resourceDTO.name,
        username: resourceDTO.username,
        uris: [resourceDTO.uri],
        description: resourceDTO.description
      });
    });
    it("Should not create metadata if exist", () => {
      expect.assertions(1);

      const resourceDTO = defaultResourceDto();

      const entityV5 = ResourceEntity.transformDtoFromV4toV5(resourceDTO);

      expect(entityV5.metadata).toEqual(resourceDTO.metadata);
    });
  });
  describe("ResourceEntity::toDTOv4", () => {
    it("Should transform DTO v5 to v4", () => {
      expect.assertions(5);

      const resourceDTO = defaultResourceV4Dto();
      const entityV5 =  new ResourceEntity(resourceDTO);
      const dtoV4 = entityV5.toV4Dto();

      expect(dtoV4.name).toEqual(resourceDTO.name);
      expect(dtoV4.username).toEqual(resourceDTO.username);
      expect(dtoV4.description).toEqual(resourceDTO.description);
      expect(dtoV4.uri).toEqual(resourceDTO.uri);
      expect(dtoV4.metadata).toBeUndefined();
    });
  });
});
