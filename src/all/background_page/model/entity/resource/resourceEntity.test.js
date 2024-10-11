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
import {
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {
  defaultResourceMetadataDto
} from "passbolt-styleguide/src/shared/models/entity/resourceMetadata/resourceMetadataEntity.test.data";
import ResourceMetadataEntity from "./metadata/resourceMetadataEntity";
import {v4 as uuidv4} from "uuid";

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
      assertEntityProperty.required(ResourceEntity, "resource_type_id");
    });

    it("validates personal property", () => {
      assertEntityProperty.boolean(ResourceEntity, "personal");
      assertEntityProperty.notRequired(ResourceEntity, "personal");
      assertEntityProperty.nullable(ResourceEntity, "personal");
    });

    it("validates metadata property anyOf", () => {
      const successScenario = [
        assertEntityProperty.SCENARIO_OBJECT,
        {scenario: "an armored GPG message", value: "-----BEGIN PGP MESSAGE-----\n\nwcFMAxYTR81eetNbAQ\/\/TEWCA7W1kx7IzcZi4nmT92IZbdpzCBSQt5htSCoJ\nFfzGd27yeDT2GoEtmxmkG+gEak8ci0Jxa9FECaYDBzG4ixEDfDMfWqw\/WK2w\nj04oja+0qCAimV2nyItSYoaK5aZj8vL97V6U\/7YcraC9QTNY1Kd8RDPeL32D\nO2dpquPDLx5uMAmMoSZWruNCGqqJPjxMcxc2PBco+GJMcaGcYa5Y3+YueNpZ\nIIS0PbMpgiJlVvYzZywYC5lkIKFadVeV6MNkMmJfWB4VHq2Hoo3poZVP1rZV\n6cU7a7UuG4W3UUmezxQGQ6WAjh+qzkQHXrwI3cgU14du9sTCh8occwcPhG1C\nj8ljcTJqexQxA91TSj2UqhAnyB9yzZRcoh38bj\/OyGQmtiwxEFIzUymSi2pt\nysjJOZ7lB1Oh2l4vbgxJoNxtgvzY+3dsNXL510x793Hev3X2YcbO\/TJoy6G9\n89cuocJ1dlLIHqrfri43y1V0ZTfoa\/vigma4Qa5kUtB1tN0j38z+6tcjiz\/s\n8RJmXUK2bfHhvEbuc\/YnDDltpiZHc3QUtbj5TV2m+fO0ad2jVqxsi4eZid\/V\n\/WDUrAxRzY7xNRTRQQDbnT831NZeZbYobCpfPqU8ylF9iv\/V4lsyNYFrU0ne\n37JRFzl3cOY+jlqxGHaAF9\/mC3b3D3DmlZ+kOOQ7lE\/SwaoBAuDaJRsKzNqj\nTz8UFif5iwrEQY5BNzYd+zwGVzMlVP\/RNXR2YlAHx5lPMylgI73RDMoMZ4RT\nb7AQB9DqgobZI3dh3B90XqjkRiy3VJ\/nMhwknaZc6onJQgl2O\/ULie9kh69U\n1ojIkN+SHFCl42T1iT2eN08QUPffDVTMvT103WlX+MW8FV6CmF+TcDRUexs3\nT\/2EvFlxP6QTG41vLk4Sm3xce7rEZHiJ9hRrF26xVfT5jM+7z149lP5J8mgA\nARSBj2jlO7P1afQX+5RyYR+guD9LN95qMsNJwukTCzIo1AhE7yywf7b8v3a6\nXyanZo+TbDqxnJlozEMsdyGBwBn7UX6Erv072cZadO\/ZG2RBkbgiBGZ5hAjg\nPqwRAkfzDNa4WhsE9Crqs5ROy6IsDBGuAa8\/as0oCzIV+Ou4BPzKHfQDQS6U\nT0R+48sVAZAYY7TqaNHvf+3nlqMyssaK0SPm2fg3DZXPM2pcDatCFb4gVElC\n1qbG8pRIBmS\/NYr8m7IBnazDs9L6lYAjybuHes6cPqasDmHKha6DKl1P6jX+\nEeDxA0AVL4rZdUCt1fpEcFR\/R\/o4uDDLO8NGiHwM3MnbNI8G0SQy8q\/NhI11\nzWXyDeAR6hHKYC4h6WCCTFxe364PWLjQ5PGOLeAfeWEPCDZmP6U99kwoiOUu\ni8UuoIAFon3lIOXZnJ3ZtAcQ5UJ3gNcJH1EImZFdYtRgLo3GOPjBcNqGbmCu\n4xo+yMGy9Y8YJZM9HakKAChmHf01J3DAwNfUm8Rhx5w+NBQRm0aJ319wsACH\nlLEYvv+bVfPkNTvW\/vWND9eOPGI0Q8o=\n=AOt0\n-----END PGP MESSAGE-----\n"},
        // @todo Entity schema validation should be strict and the following should not validate.
        assertEntityProperty.SCENARIO_ARRAY,
      ];
      const failScenario = [
        assertEntityProperty.SCENARIO_STRING,
        assertEntityProperty.SCENARIO_INTEGER,
        assertEntityProperty.SCENARIO_TRUE,
        assertEntityProperty.SCENARIO_FALSE,
        assertEntityProperty.SCENARIO_FLOAT,
        /*
         *  @todo Entity schema validation should be strict and the following should not validate.
         *  assertEntityProperty.SCENARIO_ARRAY,
         */
      ];

      assertEntityProperty.assert(ResourceEntity, "metadata", successScenario, failScenario, "type");
    });
  });

  it("constructor works if valid DTO is provided", () => {
    expect.assertions(1);

    const contain = {secrets: true, permissions: true, permission: true, tags: true, favorite: true, creator: true, modifier: true};
    const dto = defaultResourceDto({}, contain);
    const entity = new ResourceEntity(dto);

    expect(entity.toDto(contain)).toEqual(ResourceEntity.transformDtoFromV4toV5(dto));
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    expect.assertions(2);
    try {
      new ResourceEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        resource_type_id: {required: "The resource_type_id is required."},
      });
    }
  });

  it("constructor returns validation error if dto required metadata fields are missing", () => {
    expect.assertions(2);
    try {
      new ResourceEntity({resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        name: {type: "The name is not a valid string."},
      });
    }
  });

  it("constructor returns validation error if dto required metadata fields are not a valid object", () => {
    expect.assertions(2);
    try {
      new ResourceEntity({resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION, metadata: []});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        name: {required: "The name is required."},
        resource_type_id: {required: "The resource_type_id is required."},
      });
    }
  });

  describe("ResourceEntity::transformDtoFromV4toV5", () => {
    it("Should transform DTO by including V5 format", () => {
      expect.assertions(2);

      const resourceDTO = defaultResourceV4Dto();
      const entityV5 = ResourceEntity.transformDtoFromV4toV5(resourceDTO);

      // V4 root format
      expect(entityV5.resource_type_id).toEqual(resourceDTO.resource_type_id);
      // V5 metadata data object
      expect(entityV5.metadata).toEqual(resourceDTO.metadata);
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

      expect(dtoV4.name).toEqual(entityV5.metadata.name);
      expect(dtoV4.username).toEqual(entityV5.metadata.username);
      expect(dtoV4.description).toEqual(entityV5.metadata.description);
      expect(dtoV4.uri).toEqual(entityV5.metadata.uris?.[0]);
      expect(dtoV4.metadata).toBeUndefined();
    });
  });

  describe("ResourceEntity::validateBuildRules", () => {
    it("Should fail if build rules is not valid", () => {
      expect.assertions(1);

      const resourceDTO = defaultResourceDto({metadata: "-----BEGIN PGP MESSAGE-----\n\nwcFMAxYTR81eetNbAQ\/\/TEWCA7W1kx7IzcZi4nmT92IZbdpzCBSQt5htSCoJ\nFfzGd27yeDT2GoEtmxmkG+gEak8ci0Jxa9FECaYDBzG4ixEDfDMfWqw\/WK2w\nj04oja+0qCAimV2nyItSYoaK5aZj8vL97V6U\/7YcraC9QTNY1Kd8RDPeL32D\nO2dpquPDLx5uMAmMoSZWruNCGqqJPjxMcxc2PBco+GJMcaGcYa5Y3+YueNpZ\nIIS0PbMpgiJlVvYzZywYC5lkIKFadVeV6MNkMmJfWB4VHq2Hoo3poZVP1rZV\n6cU7a7UuG4W3UUmezxQGQ6WAjh+qzkQHXrwI3cgU14du9sTCh8occwcPhG1C\nj8ljcTJqexQxA91TSj2UqhAnyB9yzZRcoh38bj\/OyGQmtiwxEFIzUymSi2pt\nysjJOZ7lB1Oh2l4vbgxJoNxtgvzY+3dsNXL510x793Hev3X2YcbO\/TJoy6G9\n89cuocJ1dlLIHqrfri43y1V0ZTfoa\/vigma4Qa5kUtB1tN0j38z+6tcjiz\/s\n8RJmXUK2bfHhvEbuc\/YnDDltpiZHc3QUtbj5TV2m+fO0ad2jVqxsi4eZid\/V\n\/WDUrAxRzY7xNRTRQQDbnT831NZeZbYobCpfPqU8ylF9iv\/V4lsyNYFrU0ne\n37JRFzl3cOY+jlqxGHaAF9\/mC3b3D3DmlZ+kOOQ7lE\/SwaoBAuDaJRsKzNqj\nTz8UFif5iwrEQY5BNzYd+zwGVzMlVP\/RNXR2YlAHx5lPMylgI73RDMoMZ4RT\nb7AQB9DqgobZI3dh3B90XqjkRiy3VJ\/nMhwknaZc6onJQgl2O\/ULie9kh69U\n1ojIkN+SHFCl42T1iT2eN08QUPffDVTMvT103WlX+MW8FV6CmF+TcDRUexs3\nT\/2EvFlxP6QTG41vLk4Sm3xce7rEZHiJ9hRrF26xVfT5jM+7z149lP5J8mgA\nARSBj2jlO7P1afQX+5RyYR+guD9LN95qMsNJwukTCzIo1AhE7yywf7b8v3a6\nXyanZo+TbDqxnJlozEMsdyGBwBn7UX6Erv072cZadO\/ZG2RBkbgiBGZ5hAjg\nPqwRAkfzDNa4WhsE9Crqs5ROy6IsDBGuAa8\/as0oCzIV+Ou4BPzKHfQDQS6U\nT0R+48sVAZAYY7TqaNHvf+3nlqMyssaK0SPm2fg3DZXPM2pcDatCFb4gVElC\n1qbG8pRIBmS\/NYr8m7IBnazDs9L6lYAjybuHes6cPqasDmHKha6DKl1P6jX+\nEeDxA0AVL4rZdUCt1fpEcFR\/R\/o4uDDLO8NGiHwM3MnbNI8G0SQy8q\/NhI11\nzWXyDeAR6hHKYC4h6WCCTFxe364PWLjQ5PGOLeAfeWEPCDZmP6U99kwoiOUu\ni8UuoIAFon3lIOXZnJ3ZtAcQ5UJ3gNcJH1EImZFdYtRgLo3GOPjBcNqGbmCu\n4xo+yMGy9Y8YJZM9HakKAChmHf01J3DAwNfUm8Rhx5w+NBQRm0aJ319wsACH\nlLEYvv+bVfPkNTvW\/vWND9eOPGI0Q8o=\n=AOt0\n-----END PGP MESSAGE-----\n"});
      const entityV5 =  new ResourceEntity(resourceDTO);
      entityV5._metadata = new ResourceMetadataEntity(defaultResourceMetadataDto());
      try {
        entityV5.validateBuildRules();
      } catch (error) {
        expect(error.getError("metadata", "only-one-defined")).toEqual("The property metadata and _metadata cannot be set at the same time");
      }
    });
  });

  describe("ResourceEntity::setMetadata", () => {
    it("Should set metadata with string", () => {
      expect.assertions(5);

      const resourceDTO = defaultResourceDto();
      const metadataEncrypted = "-----BEGIN PGP MESSAGE-----\n\nwcFMAxYTR81eetNbAQ\/\/TEWCA7W1kx7IzcZi4nmT92IZbdpzCBSQt5htSCoJ\nFfzGd27yeDT2GoEtmxmkG+gEak8ci0Jxa9FECaYDBzG4ixEDfDMfWqw\/WK2w\nj04oja+0qCAimV2nyItSYoaK5aZj8vL97V6U\/7YcraC9QTNY1Kd8RDPeL32D\nO2dpquPDLx5uMAmMoSZWruNCGqqJPjxMcxc2PBco+GJMcaGcYa5Y3+YueNpZ\nIIS0PbMpgiJlVvYzZywYC5lkIKFadVeV6MNkMmJfWB4VHq2Hoo3poZVP1rZV\n6cU7a7UuG4W3UUmezxQGQ6WAjh+qzkQHXrwI3cgU14du9sTCh8occwcPhG1C\nj8ljcTJqexQxA91TSj2UqhAnyB9yzZRcoh38bj\/OyGQmtiwxEFIzUymSi2pt\nysjJOZ7lB1Oh2l4vbgxJoNxtgvzY+3dsNXL510x793Hev3X2YcbO\/TJoy6G9\n89cuocJ1dlLIHqrfri43y1V0ZTfoa\/vigma4Qa5kUtB1tN0j38z+6tcjiz\/s\n8RJmXUK2bfHhvEbuc\/YnDDltpiZHc3QUtbj5TV2m+fO0ad2jVqxsi4eZid\/V\n\/WDUrAxRzY7xNRTRQQDbnT831NZeZbYobCpfPqU8ylF9iv\/V4lsyNYFrU0ne\n37JRFzl3cOY+jlqxGHaAF9\/mC3b3D3DmlZ+kOOQ7lE\/SwaoBAuDaJRsKzNqj\nTz8UFif5iwrEQY5BNzYd+zwGVzMlVP\/RNXR2YlAHx5lPMylgI73RDMoMZ4RT\nb7AQB9DqgobZI3dh3B90XqjkRiy3VJ\/nMhwknaZc6onJQgl2O\/ULie9kh69U\n1ojIkN+SHFCl42T1iT2eN08QUPffDVTMvT103WlX+MW8FV6CmF+TcDRUexs3\nT\/2EvFlxP6QTG41vLk4Sm3xce7rEZHiJ9hRrF26xVfT5jM+7z149lP5J8mgA\nARSBj2jlO7P1afQX+5RyYR+guD9LN95qMsNJwukTCzIo1AhE7yywf7b8v3a6\nXyanZo+TbDqxnJlozEMsdyGBwBn7UX6Erv072cZadO\/ZG2RBkbgiBGZ5hAjg\nPqwRAkfzDNa4WhsE9Crqs5ROy6IsDBGuAa8\/as0oCzIV+Ou4BPzKHfQDQS6U\nT0R+48sVAZAYY7TqaNHvf+3nlqMyssaK0SPm2fg3DZXPM2pcDatCFb4gVElC\n1qbG8pRIBmS\/NYr8m7IBnazDs9L6lYAjybuHes6cPqasDmHKha6DKl1P6jX+\nEeDxA0AVL4rZdUCt1fpEcFR\/R\/o4uDDLO8NGiHwM3MnbNI8G0SQy8q\/NhI11\nzWXyDeAR6hHKYC4h6WCCTFxe364PWLjQ5PGOLeAfeWEPCDZmP6U99kwoiOUu\ni8UuoIAFon3lIOXZnJ3ZtAcQ5UJ3gNcJH1EImZFdYtRgLo3GOPjBcNqGbmCu\n4xo+yMGy9Y8YJZM9HakKAChmHf01J3DAwNfUm8Rhx5w+NBQRm0aJ319wsACH\nlLEYvv+bVfPkNTvW\/vWND9eOPGI0Q8o=\n=AOt0\n-----END PGP MESSAGE-----\n";
      const entityV5 =  new ResourceEntity(resourceDTO);

      expect(entityV5._metadata).toBeDefined();

      entityV5.metadata = metadataEncrypted;
      const expectedDto = {...resourceDTO, metadata: metadataEncrypted};

      expect(entityV5._props.metadata).toBeDefined();
      expect(entityV5.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS)).toEqual(expectedDto);
      expect(entityV5._metadata).toBeUndefined();
      expect(typeof entityV5.metadata === "string").toBeTruthy();
    });

    it("Should set metadata with metadata entity", () => {
      expect.assertions(5);

      const metadataEncrypted = "-----BEGIN PGP MESSAGE-----\n\nwcFMAxYTR81eetNbAQ\/\/TEWCA7W1kx7IzcZi4nmT92IZbdpzCBSQt5htSCoJ\nFfzGd27yeDT2GoEtmxmkG+gEak8ci0Jxa9FECaYDBzG4ixEDfDMfWqw\/WK2w\nj04oja+0qCAimV2nyItSYoaK5aZj8vL97V6U\/7YcraC9QTNY1Kd8RDPeL32D\nO2dpquPDLx5uMAmMoSZWruNCGqqJPjxMcxc2PBco+GJMcaGcYa5Y3+YueNpZ\nIIS0PbMpgiJlVvYzZywYC5lkIKFadVeV6MNkMmJfWB4VHq2Hoo3poZVP1rZV\n6cU7a7UuG4W3UUmezxQGQ6WAjh+qzkQHXrwI3cgU14du9sTCh8occwcPhG1C\nj8ljcTJqexQxA91TSj2UqhAnyB9yzZRcoh38bj\/OyGQmtiwxEFIzUymSi2pt\nysjJOZ7lB1Oh2l4vbgxJoNxtgvzY+3dsNXL510x793Hev3X2YcbO\/TJoy6G9\n89cuocJ1dlLIHqrfri43y1V0ZTfoa\/vigma4Qa5kUtB1tN0j38z+6tcjiz\/s\n8RJmXUK2bfHhvEbuc\/YnDDltpiZHc3QUtbj5TV2m+fO0ad2jVqxsi4eZid\/V\n\/WDUrAxRzY7xNRTRQQDbnT831NZeZbYobCpfPqU8ylF9iv\/V4lsyNYFrU0ne\n37JRFzl3cOY+jlqxGHaAF9\/mC3b3D3DmlZ+kOOQ7lE\/SwaoBAuDaJRsKzNqj\nTz8UFif5iwrEQY5BNzYd+zwGVzMlVP\/RNXR2YlAHx5lPMylgI73RDMoMZ4RT\nb7AQB9DqgobZI3dh3B90XqjkRiy3VJ\/nMhwknaZc6onJQgl2O\/ULie9kh69U\n1ojIkN+SHFCl42T1iT2eN08QUPffDVTMvT103WlX+MW8FV6CmF+TcDRUexs3\nT\/2EvFlxP6QTG41vLk4Sm3xce7rEZHiJ9hRrF26xVfT5jM+7z149lP5J8mgA\nARSBj2jlO7P1afQX+5RyYR+guD9LN95qMsNJwukTCzIo1AhE7yywf7b8v3a6\nXyanZo+TbDqxnJlozEMsdyGBwBn7UX6Erv072cZadO\/ZG2RBkbgiBGZ5hAjg\nPqwRAkfzDNa4WhsE9Crqs5ROy6IsDBGuAa8\/as0oCzIV+Ou4BPzKHfQDQS6U\nT0R+48sVAZAYY7TqaNHvf+3nlqMyssaK0SPm2fg3DZXPM2pcDatCFb4gVElC\n1qbG8pRIBmS\/NYr8m7IBnazDs9L6lYAjybuHes6cPqasDmHKha6DKl1P6jX+\nEeDxA0AVL4rZdUCt1fpEcFR\/R\/o4uDDLO8NGiHwM3MnbNI8G0SQy8q\/NhI11\nzWXyDeAR6hHKYC4h6WCCTFxe364PWLjQ5PGOLeAfeWEPCDZmP6U99kwoiOUu\ni8UuoIAFon3lIOXZnJ3ZtAcQ5UJ3gNcJH1EImZFdYtRgLo3GOPjBcNqGbmCu\n4xo+yMGy9Y8YJZM9HakKAChmHf01J3DAwNfUm8Rhx5w+NBQRm0aJ319wsACH\nlLEYvv+bVfPkNTvW\/vWND9eOPGI0Q8o=\n=AOt0\n-----END PGP MESSAGE-----\n";
      const resourceDTO = defaultResourceDto({metadata: metadataEncrypted});
      const entityV5 =  new ResourceEntity(resourceDTO);
      const metadataDecrypted = defaultResourceMetadataDto();

      expect(entityV5._props.metadata).toBeDefined();

      entityV5.metadata = new ResourceMetadataEntity(metadataDecrypted);
      const expectedDto = {...resourceDTO, metadata: metadataDecrypted};

      expect(entityV5._metadata).toBeDefined();
      expect(entityV5.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS)).toEqual(expectedDto);
      expect(entityV5._props.metadata).toBeUndefined();
      expect(entityV5.metadata instanceof ResourceMetadataEntity).toBeTruthy();
    });

    it("Should failed to set metadata with malformed string", () => {
      expect.assertions(1);

      const resourceDTO = defaultResourceDto();
      const metadataEncrypted = "string";
      const entityV5 =  new ResourceEntity(resourceDTO);
      try {
        entityV5.metadata = metadataEncrypted;
      } catch (error) {
        expect(error.getError("metadata", "pattern")).toEqual("The metadata is not valid.");
      }
    });

    it("Should not set metadata with type not supported", () => {
      expect.assertions(1);

      const resourceDTO = defaultResourceDto();
      const metadata = 14;
      const entityV5 =  new ResourceEntity(resourceDTO);
      try {
        entityV5.metadata = metadata;
      } catch (error) {
        expect(error.getError("metadata", "type")).toEqual("The metadata is not a valid string.");
      }
    });
  });

  describe("ResourceEntity::metadataKeyId", () => {
    it("Should set metadataKeyId with uuid", () => {
      expect.assertions(3);

      const resourceDTO = defaultResourceDto();
      const metadataKeyId = uuidv4();
      const entityV5 =  new ResourceEntity(resourceDTO);

      expect(entityV5.metadataKeyId).toBeNull();

      entityV5.metadataKeyId = metadataKeyId;
      const expectedDto = {...resourceDTO, metadata_key_id: metadataKeyId};

      expect(entityV5._props.metadata_key_id).toBeDefined();
      expect(entityV5.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS)).toEqual(expectedDto);
    });

    it("Should failed to set metadataKeyId with string", () => {
      expect.assertions(1);

      const resourceDTO = defaultResourceDto();
      const metadataKeyId = "string";
      const entityV5 =  new ResourceEntity(resourceDTO);
      try {
        entityV5.metadataKeyId = metadataKeyId;
      } catch (error) {
        expect(error.getError("metadata_key_id", "format")).toEqual("The metadata_key_id is not a valid uuid.");
      }
    });
  });

  describe("ResourceEntity::metadataKeyType", () => {
    it("Should set metadataKeyType with METADATA_KEY_TYPE_USER_KEY", () => {
      expect.assertions(3);

      const resourceDTO = defaultResourceDto();
      const entityV5 =  new ResourceEntity(resourceDTO);

      expect(entityV5.metadataKeyType).toBeUndefined();

      entityV5.metadataKeyType = ResourceEntity.METADATA_KEY_TYPE_USER_KEY;
      const expectedDto = {...resourceDTO, metadata_key_type: ResourceEntity.METADATA_KEY_TYPE_USER_KEY};

      expect(entityV5._props.metadata_key_type).toBeDefined();
      expect(entityV5.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS)).toEqual(expectedDto);
    });

    it("Should set metadataKeyType with METADATA_KEY_TYPE_METADATA_KEY", () => {
      expect.assertions(3);

      const resourceDTO = defaultResourceDto();
      const entityV5 =  new ResourceEntity(resourceDTO);

      expect(entityV5.metadataKeyType).toBeUndefined();

      entityV5.metadataKeyType = ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY;
      const expectedDto = {...resourceDTO, metadata_key_type: ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY};

      expect(entityV5._props.metadata_key_type).toBeDefined();
      expect(entityV5.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS)).toEqual(expectedDto);
    });

    it("Should failed to set metadataKeyId with string", () => {
      expect.assertions(1);

      const resourceDTO = defaultResourceDto();
      const metadataKeyId = "string";
      const entityV5 =  new ResourceEntity(resourceDTO);
      try {
        entityV5.metadataKeyType = metadataKeyId;
      } catch (error) {
        expect(error.getError("metadata_key_type", "enum")).toEqual("The metadata_key_type value is not included in the supported list.");
      }
    });
  });
});
