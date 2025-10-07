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
import ExternalResourceEntity from "./externalResourceEntity";
import ExternalFolderEntity from "../../folder/external/externalFolderEntity";
import {defaultTotpDto} from "../../totp/totpDto.test.data";
import ResourceEntity from "../resourceEntity";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultResourcesSecretsDtos} from "../../secret/resource/resourceSecretsCollection.test.data";
import {defaultExternalResourceDto, defaultExternalResourceImportDto, minimalExternalResourceDto} from "./externalResourceEntity.test.data";
import ExternalTotpEntity from "../../totp/externalTotpEntity";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {v4 as uuid} from "uuid";
import ResourceSecretsCollection from "../../secret/resource/resourceSecretsCollection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import CustomFieldsCollection from "passbolt-styleguide/src/shared/models/entity/customField/customFieldsCollection";
import {defaultCustomFieldsCollection} from "passbolt-styleguide/src/shared/models/entity/customField/customFieldsCollection.test.data";
import {defaultResourceMetadataDto} from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  RESOURCE_TYPE_PASSWORD_STRING_SLUG,
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
  RESOURCE_TYPE_TOTP_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_SLUG,
  RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG,
  RESOURCE_TYPE_V5_TOTP_SLUG,
  RESOURCE_TYPE_V5_CUSTOM_FIELDS_SLUG,
  RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition.js";
import {SECRET_DATA_OBJECT_TYPE} from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataEntity";

describe("ExternalResourceEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ExternalResourceEntity.name, ExternalResourceEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(ExternalResourceEntity, "id");
      assertEntityProperty.uuid(ExternalResourceEntity, "id");
      assertEntityProperty.notRequired(ExternalResourceEntity, "id");
    });

    it("validates name property", () => {
      assertEntityProperty.maxLength(ExternalResourceEntity, "name", 255);
      //Even though the schema stated it's required, here it's not as a sanitisation happens.
      assertEntityProperty.notRequired(ExternalResourceEntity, "name");
    });

    it("validates username property", () => {
      assertEntityProperty.string(ExternalResourceEntity, "username");
      assertEntityProperty.maxLength(ExternalResourceEntity, "username", 255);
      assertEntityProperty.nullable(ExternalResourceEntity, "username");
      assertEntityProperty.notRequired(ExternalResourceEntity, "username");
    });

    it("validates uris property", () => {
      assertEntityProperty.array(ExternalResourceEntity, "uris");
      assertEntityProperty.assertArrayItemString(ExternalResourceEntity, "uris");
      assertEntityProperty.arrayStringMaxLength(ExternalResourceEntity, "uris", ExternalResourceEntity.URI_MAX_LENGTH);
      assertEntityProperty.notRequired(ExternalResourceEntity, "uris");
    });

    it("validates description property", () => {
      assertEntityProperty.string(ExternalResourceEntity, "description");
      assertEntityProperty.maxLength(ExternalResourceEntity, "description", 10_000);
      assertEntityProperty.notRequired(ExternalResourceEntity, "description");
    });

    it("validates secrets property", () => {
      const dto = defaultExternalResourceDto();
      const invalidSecret = defaultResourcesSecretsDtos();

      const successScenario = [
        {scenario: "valid secrets collection", value: dto.secrets},
      ];

      const failingScenario = [
        {scenario: "invalid secrets: different resource_id", value: invalidSecret},
      ];
      assertEntityProperty.assertAssociation(ExternalResourceEntity, "secrets", dto, successScenario, failingScenario);
      assertEntityProperty.notRequired(ExternalResourceEntity, "secrets");
    });

    it("validates folder_parent_id property", () => {
      assertEntityProperty.string(ExternalResourceEntity, "folder_parent_id");
      assertEntityProperty.uuid(ExternalResourceEntity, "folder_parent_id");
      assertEntityProperty.notRequired(ExternalResourceEntity, "folder_parent_id");
    });

    it("validates resource_type_id property", () => {
      assertEntityProperty.string(ExternalResourceEntity, "resource_type_id");
      assertEntityProperty.uuid(ExternalResourceEntity, "resource_type_id");
      assertEntityProperty.notRequired(ExternalResourceEntity, "resource_type_id");
    });

    it("validates secret_clear property", () => {
      assertEntityProperty.notRequired(ExternalResourceEntity, "secret_clear");
    });

    it("validates totp property", () => {
      const dto = defaultExternalResourceDto();
      const invalidTotp = Object.assign({}, dto.totp, {algorithm: "CHAT-1"});

      const successScenario = [
        {scenario: "valid totp", value: dto.totp},
      ];

      const failingScenario = [
        {scenario: "invalid totp: string", value: "abcd"},
        {scenario: "invalid totp: wrong fields", value: invalidTotp},
      ];

      assertEntityProperty.assertAssociation(ExternalResourceEntity, "totp", dto, successScenario, failingScenario);
      assertEntityProperty.notRequired(ExternalResourceEntity, "totp");
      assertEntityProperty.nullable(ExternalResourceEntity, "totp");
    });

    it("validates folder_parent_path property", () => {
      assertEntityProperty.notRequired(ExternalResourceEntity, "folder_parent_path");
    });

    it("validates expired property", () => {
      assertEntityProperty.dateTime(ResourceEntity, "expired");
      assertEntityProperty.nullable(ResourceEntity, "expired");
      assertEntityProperty.notRequired(ResourceEntity, "expired");
    });

    it("validates customFields property", () => {
      const dto = defaultExternalResourceDto();
      const invalidCustomFields = [{
        metadata_key: "key-0",
        secret_value: "secret-0",
      }];

      const successScenario = [
        {scenario: "valid customFields collection", value: dto.custom_fields},
      ];

      const failingScenario = [
        {scenario: "invalid id: string", value: invalidCustomFields},
      ];
      assertEntityProperty.assertAssociation(ExternalResourceEntity, "custom_fields", dto, successScenario, failingScenario);
      assertEntityProperty.notRequired(ExternalResourceEntity, "custom_fields");
      assertEntityProperty.nullable(ExternalResourceEntity, "custom_fields");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      expect.assertions(10);

      const dto = minimalExternalResourceDto({
        name: "Password 1",
      });

      const result = Object.assign({}, dto, {
        folder_parent_path: "",
      });

      const entity = new ExternalResourceEntity(dto);

      expect(entity.toDto()).toEqual(result);
      expect(entity.id).toBeNull();
      expect(entity.name).toEqual("Password 1");
      expect(entity.username).toBeNull();
      expect(entity.uris).toEqual([]);
      expect(entity.description).toBeNull();
      expect(entity.secretClear).toEqual(dto.secret_clear);
      expect(entity.folderParentId).toBeNull();
      expect(entity.folderParentPath).toEqual("");
      expect(entity.secrets).toBeNull();
    });

    it("constructor works if valid fields DTO is provided", () => {
      expect.assertions(13);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      expect(entity.toDto()).toStrictEqual(dto);
      expect(entity.id).toStrictEqual(dto.id);
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.username).toStrictEqual(dto.username);
      expect(entity.uris).toStrictEqual(dto.uris);
      expect(entity.description).toStrictEqual(dto.description);
      expect(entity.secretClear).toStrictEqual(dto.secret_clear);
      expect(entity.folderParentId).toStrictEqual(dto.folder_parent_id);
      expect(entity.folderParentPath).toStrictEqual(dto.folder_parent_path);
      expect(entity.totp.toDto()).toStrictEqual(dto.totp);
      expect(entity.secrets.toDto()).toStrictEqual(dto.secrets);
      expect(entity.customFields.toDto()).toStrictEqual(dto.custom_fields);
      entity.totp = new ExternalTotpEntity(defaultTotpDto({secret_key: "OFL3VF3OU4BZP45D4ZME6KTF654JRSSO4Q2EO6FJFGPKHRHYSVJA"}));
      expect(entity.totp.secret_key !== dto.totp.secret_key).toBeTruthy();
    });

    it("constructor works even if the icon property cannot be built", () => {
      expect.assertions(1);

      const dto = defaultExternalResourceDto({
        icon: {
          type: "wrong",
        }
      });

      expect(() => new ExternalResourceEntity(dto)).not.toThrow();
    });

    it("constructor build resource with default values", () => {
      expect.assertions(3);

      const entity = new ExternalResourceEntity();
      expect(entity.name).toEqual(ExternalResourceEntity.DEFAULT_RESOURCE_NAME);
      expect(entity.folderParentPath).toEqual("");
      expect(entity.customFields).toBeNull();
    });

    it("constructor sanitize folder_parent_path", () => {
      expect.assertions(1);

      const dto = minimalExternalResourceDto({
        "folder_parent_path": "// at/ the///root /"
      });
      const entity = new ExternalResourceEntity(dto);
      expect(entity.folderParentPath).toEqual("/ at/ the/root /");
    });
  });

  describe("::changeRootPath", () => {
    it("changeRootPath change the resource root path", () => {
      expect.assertions(2);

      const rootFolder = new ExternalFolderEntity({"name": "root"});
      const resource = new ExternalResourceEntity({"name": "Resource 1", "secret_clear": ""});
      resource.changeRootPath(rootFolder);
      expect(resource.folderParentPath).toEqual("root");
      resource.changeRootPath(rootFolder);
      expect(resource.folderParentPath).toEqual("root/root");
    });
  });

  describe("::buildDtoFromResourceEntityDto", () => {
    it("should build a dto from the DTO of a resource entity", () => {
      expect.assertions(1);

      const secrets = defaultResourcesSecretsDtos(1);
      const resourceDto = defaultResourceDto({
        id: secrets[0].resource_id,
        secrets: secrets,
      });
      const entity = new ResourceEntity(resourceDto);

      const resultDto = ExternalResourceEntity.buildDtoFromResourceEntityDto(entity.toDto({secrets: true, metadata: true}));
      expect(resultDto).toStrictEqual({
        id: entity.id,
        name: entity.metadata.name,
        username: entity.metadata.username,
        uris: entity.metadata.uris,
        description: entity.metadata.description,
        secrets: secrets,
        folder_parent_id: entity.folderParentId,
        resource_type_id: entity.metadata.resourceTypeId,
        folder_parent_path: "",
        expired: null,
        custom_fields: [],
      });
    });

    it("should build a dto from the DTO of a resource entity and that can use to instantiate an ExternalResourceEntity", () => {
      expect.assertions(1);

      const secrets = defaultResourcesSecretsDtos(1);
      const resourceDto = defaultResourceDto({
        id: secrets[0].resource_id,
        secrets: secrets,
      });
      const entity = new ResourceEntity(resourceDto);

      const resultDto = ExternalResourceEntity.buildDtoFromResourceEntityDto(entity.toDto({secrets: true, metadata: true}));
      expect(() => new ExternalResourceEntity(resultDto)).not.toThrow();
    });

    it("should build a dto from the DTO of a resource entity with customFields", () => {
      expect.assertions(1);
      const customFields = defaultCustomFieldsCollection();
      const secrets = defaultResourcesSecretsDtos(1);
      const resourceDto = defaultResourceDto({
        id: secrets[0].resource_id,
        secrets: secrets,
        metadata: defaultResourceMetadataDto({
          custom_fields: customFields
        }),
      });
      const entity = new ResourceEntity(resourceDto);

      const resultDto = ExternalResourceEntity.buildDtoFromResourceEntityDto(entity.toDto({secrets: true, metadata: true}));
      expect(resultDto.custom_fields).toStrictEqual(customFields);
    });
  });

  describe("::toResourceEntityImportDto", () => {
    it("should export a DTO in the expected format", () => {
      expect.assertions(1);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const customFieldsCollection = new CustomFieldsCollection(dto.custom_fields);
      // @tod
      const resourceEntityDto = entity.toResourceEntityImportDto();
      expect(resourceEntityDto).toStrictEqual({
        resource_type_id: dto.resource_type_id,
        expired: dto.expired,
        folder_parent_id: dto.folder_parent_id,
        metadata: {
          object_type: "PASSBOLT_RESOURCE_METADATA",
          name: dto.name,
          username: dto.username,
          uris: dto.uris,
          description: dto.description,
          resource_type_id: dto.resource_type_id,
          custom_fields: customFieldsCollection.toMetadataDto(),
        },
        secrets: dto.secrets,
        personal: true,
      });
    });

    it("should generate a DTO that could be used to instantiate a ResourceEntity", () => {
      expect.assertions(1);

      const dto = defaultExternalResourceImportDto();
      const entity = new ExternalResourceEntity(dto);

      const resourceEntityDto = entity.toResourceEntityImportDto();
      expect(() => new ResourceEntity(resourceEntityDto)).not.toThrow();
    });
  });

  describe("::toSecretDto", () => {
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());

    it("builds a secret dto for a password string resource type (when not resource type is provided).", () => {
      expect.assertions(1);

      const dto = minimalExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      const secretDto = entity.toSecretDto();
      expect(secretDto).toStrictEqual(dto.secret_clear);
    });

    it("builds a secret dto for a password string resource type.", () => {
      expect.assertions(1);

      const dto = minimalExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_PASSWORD_STRING_SLUG);

      const secretDto = entity.toSecretDto(resourceType);
      expect(secretDto).toStrictEqual(dto.secret_clear);
    });

    it("builds a secret dto for a v4 password with encrypted description.", () => {
      expect.assertions(5);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG);

      // Variation with populated description
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(2);
      expect(secretDto.password).toStrictEqual(dto.secret_clear);
      expect(secretDto.description).toStrictEqual(dto.description);

      // Variation with no description
      const dto2 = defaultExternalResourceDto();
      delete dto2.description;
      const entity2 = new ExternalResourceEntity(dto2);
      const secret2Dto = entity2.toSecretDto(resourceType);
      expect(Object.keys(secret2Dto).length).toStrictEqual(1);
      expect(secret2Dto.password).toStrictEqual(dto2.secret_clear);
    });

    it("builds a secret dto for a v4 password with totp.", () => {
      expect.assertions(7);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG);

      // Variation with populated description
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(3);
      expect(secretDto.password).toStrictEqual(dto.secret_clear);
      expect(secretDto.description).toStrictEqual(dto.description);
      expect(secretDto.totp).toStrictEqual(dto.totp);

      // Variation with no description
      const dto2 = defaultExternalResourceDto();
      delete dto2.description;
      const entity2 = new ExternalResourceEntity(dto2);
      const secret2Dto = entity2.toSecretDto(resourceType);
      expect(Object.keys(secret2Dto).length).toStrictEqual(2);
      expect(secret2Dto.password).toStrictEqual(dto2.secret_clear);
      expect(secret2Dto.totp).toStrictEqual(dto2.totp);
    });

    it("builds a secret dto for a v4 totp.", () => {
      expect.assertions(2);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_TOTP_SLUG);

      // Variation with populated description
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(1);
      expect(secretDto.totp).toStrictEqual(dto.totp);
    });

    it("builds a secret dto for a v5 password string resource type.", () => {
      expect.assertions(1);

      const dto = minimalExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG);

      const secretDto = entity.toSecretDto(resourceType);
      expect(secretDto).toStrictEqual(dto.secret_clear);
    });

    it("builds a secret dto for a v5 password with encrypted description.", () => {
      expect.assertions(12);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_DEFAULT_SLUG);

      // Variation with populated description & custom fields
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(4);
      expect(secretDto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secretDto.password).toStrictEqual(dto.secret_clear);
      expect(secretDto.description).toStrictEqual(dto.description);
      const expectedCustomFieldsDto = JSON.parse(JSON.stringify(dto.custom_fields));
      // Remove metadata information from expected custom fields dto.
      delete expectedCustomFieldsDto[0].metadata_key;
      delete expectedCustomFieldsDto[1].metadata_key;
      expect(secretDto.custom_fields).toStrictEqual(expectedCustomFieldsDto);

      // Variation with populated description & empty custom fields
      const dto2 = defaultExternalResourceDto();
      delete dto2.custom_fields;
      const entity2 = new ExternalResourceEntity(dto2);
      const secret2Dto = entity2.toSecretDto(resourceType);
      expect(Object.keys(secret2Dto).length).toStrictEqual(3);
      expect(secret2Dto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secret2Dto.password).toStrictEqual(dto2.secret_clear);
      expect(secret2Dto.description).toStrictEqual(dto2.description);

      // Variation with empty description & empty custom fields
      const dto3 = defaultExternalResourceDto();
      delete dto3.custom_fields;
      delete dto3.description;
      const entity3 = new ExternalResourceEntity(dto3);
      const secret3Dto = entity3.toSecretDto(resourceType);
      expect(Object.keys(secret3Dto).length).toStrictEqual(2);
      expect(secret3Dto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secret3Dto.password).toStrictEqual(dto3.secret_clear);
    });

    it("builds a secret dto for a v5 password with totp.", () => {
      expect.assertions(15);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG);

      // Variation with populated description & custom fields
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(5);
      expect(secretDto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secretDto.password).toStrictEqual(dto.secret_clear);
      expect(secretDto.totp).toStrictEqual(dto.totp);
      expect(secretDto.description).toStrictEqual(dto.description);
      const expectedCustomFieldsDto = JSON.parse(JSON.stringify(dto.custom_fields));
      // Remove metadata information from expected custom fields dto.
      delete expectedCustomFieldsDto[0].metadata_key;
      delete expectedCustomFieldsDto[1].metadata_key;
      expect(secretDto.custom_fields).toStrictEqual(expectedCustomFieldsDto);

      // Variation with populated description & empty custom fields
      const dto2 = defaultExternalResourceDto();
      delete dto2.custom_fields;
      const entity2 = new ExternalResourceEntity(dto2);
      const secret2Dto = entity2.toSecretDto(resourceType);
      expect(Object.keys(secret2Dto).length).toStrictEqual(4);
      expect(secret2Dto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secret2Dto.password).toStrictEqual(dto2.secret_clear);
      expect(secret2Dto.totp).toStrictEqual(dto.totp);
      expect(secret2Dto.description).toStrictEqual(dto2.description);

      // Variation with empty description & empty custom fields
      const dto3 = defaultExternalResourceDto();
      delete dto3.custom_fields;
      delete dto3.description;
      const entity3 = new ExternalResourceEntity(dto3);
      const secret3Dto = entity3.toSecretDto(resourceType);
      expect(Object.keys(secret3Dto).length).toStrictEqual(3);
      expect(secret3Dto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secret3Dto.password).toStrictEqual(dto3.secret_clear);
      expect(secret3Dto.totp).toStrictEqual(dto.totp);
    });

    it("builds a secret dto for a v5 totp.", () => {
      expect.assertions(3);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_TOTP_SLUG);

      // Variation with populated description
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(2);
      expect(secretDto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secretDto.totp).toStrictEqual(dto.totp);
    });

    it("builds a secret dto for a v5 custom fields.", () => {
      expect.assertions(3);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_CUSTOM_FIELDS_SLUG);

      // Variation with populated description
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(2);
      expect(secretDto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      const expectedCustomFieldsDto = JSON.parse(JSON.stringify(dto.custom_fields));
      // Remove metadata information from expected custom fields dto.
      delete expectedCustomFieldsDto[0].metadata_key;
      delete expectedCustomFieldsDto[1].metadata_key;
      expect(secretDto.custom_fields).toStrictEqual(expectedCustomFieldsDto);
    });

    it("builds a secret dto for a v5 note.", () => {
      expect.assertions(3);

      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG);

      // Variation with populated description
      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const secretDto = entity.toSecretDto(resourceType);
      expect(Object.keys(secretDto).length).toStrictEqual(2);
      expect(secretDto.object_type).toStrictEqual(SECRET_DATA_OBJECT_TYPE);
      expect(secretDto.description).toStrictEqual(dto.description);
    });
  });

  describe("::getters", () => {
    it("should provide the right values when everything is set", () => {
      expect.assertions(12);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      expect(entity.id).toStrictEqual(dto.id);
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.username).toStrictEqual(dto.username);
      expect(entity.uris).toStrictEqual(dto.uris);
      expect(entity.description).toStrictEqual(dto.description);
      expect(entity.secretClear).toStrictEqual(dto.secret_clear);
      expect(entity.folderParentId).toStrictEqual(dto.folder_parent_id);
      expect(entity.folderParentPath).toStrictEqual(dto.folder_parent_path);
      expect(entity.resourceTypeId).toStrictEqual(dto.resource_type_id);
      expect(entity.expired).toStrictEqual(dto.expired);
      expect(entity.path).toStrictEqual(`${dto.folder_parent_path}/${dto.name}`);
      expect(entity.customFields.toDto()).toStrictEqual(dto.custom_fields);
    });

    it("should provide the default values with minimal dto", () => {
      expect.assertions(12);

      const dto = minimalExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      expect(entity.id).toBeNull();
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.username).toBeNull();
      expect(entity.uris).toEqual([]);
      expect(entity.description).toBeNull();
      expect(entity.secretClear).toStrictEqual(dto.secret_clear);
      expect(entity.folderParentId).toBeNull();
      expect(entity.folderParentPath).toStrictEqual("");
      expect(entity.resourceTypeId).toBeNull();
      expect(entity.expired).toBeNull();
      expect(entity.path).toStrictEqual(dto.name);
      expect(entity.customFields).toBeNull();
    });
  });

  describe("::setters", () => {
    it("should provide the right values when everything is set", () => {
      expect.assertions(8);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      const expectedData = {
        id: uuid(),
        folder_parent_id: uuid(),
        description: "This is an updated description",
        folder_parent_path: "Root/Folder/SubFolder",
        secret_clear: "this is a secret",
        secrets: new ResourceSecretsCollection(defaultResourcesSecretsDtos()),
        totp: new ExternalTotpEntity(defaultTotpDto()),
        customFields: new CustomFieldsCollection(defaultCustomFieldsCollection())
      };

      entity.id = expectedData.id;
      entity.folderParentId = expectedData.folder_parent_id;
      entity.description = expectedData.description;
      entity.folderParentPath = expectedData.folder_parent_path;
      entity.secretClear = expectedData.secret_clear;
      entity.secrets = expectedData.secrets;
      entity.totp = expectedData.totp;

      expect(entity.id).toStrictEqual(expectedData.id);
      expect(entity.folderParentId).toStrictEqual(expectedData.folder_parent_id);
      expect(entity.description).toStrictEqual(expectedData.description);
      expect(entity.folderParentPath).toStrictEqual(expectedData.folder_parent_path);
      expect(entity.secretClear).toStrictEqual(expectedData.secret_clear);
      expect(entity.secrets).toStrictEqual(expectedData.secrets);
      expect(entity.totp).toStrictEqual(expectedData.totp);

      entity.totp = null;
      expect(entity.totp).toBeNull();
    });

    it("should validate id when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.id = 42; }).toThrow(EntityValidationError);
    });

    it("should validate folderParentId when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.folderParentId = 42; }).toThrow(EntityValidationError);
    });

    it("should validate description when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.description = 42; }).toThrow(EntityValidationError);
    });

    it("should validate secretClear when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.secretClear = 42; }).toThrow(EntityValidationError);
    });

    it("should validate folderParentPath when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.folderParentPath = 42; }).toThrow(EntityValidationError);
    });

    it("should validate totp when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.totp = defaultTotpDto(); }).toThrow(TypeError);
    });

    it("should validate secrets when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.secrets = defaultResourcesSecretsDtos(); }).toThrow(TypeError);
    });

    it("should validate customFields when using the setter", () => {
      expect.assertions(1);

      const entity = new ExternalResourceEntity(minimalExternalResourceDto());
      expect(() => { entity.customFields = defaultCustomFieldsCollection(); }).toThrow(TypeError);
    });
  });

  describe("::resetSecretProps", () => {
    const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());

    it("resets secrets for a password string resource type (when resource type is not given).", () => {
      expect.assertions(2);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      entity.resetSecretProps();
      expect(entity.secretClear).toStrictEqual("");
      expect(entity.description).toStrictEqual(dto.description);
    });

    it("resets secrets for a v4 password string resource type.", () => {
      expect.assertions(2);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_PASSWORD_STRING_SLUG);
      entity.resetSecretProps(resourceType);
      expect(entity.secretClear).toStrictEqual("");
      expect(entity.description).toStrictEqual(dto.description);
    });

    it("resets secrets for a v5 password string resource type.", () => {
      expect.assertions(2);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG);
      entity.resetSecretProps(resourceType);
      expect(entity.secretClear).toStrictEqual("");
      expect(entity.description).toStrictEqual(dto.description);
    });

    it("resets secret notes.", () => {
      expect.assertions(2);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_DEFAULT_SLUG);
      entity.resetSecretProps(resourceType);
      expect(entity.secretClear).toStrictEqual("");
      expect(entity.description).toBeNull();
    });

    it("resets secret totp.", () => {
      expect.assertions(1);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_TOTP_SLUG);
      entity.resetSecretProps(resourceType);
      expect(entity.totp).toBeNull();
    });

    /**
     * Skip for now, the reset should reset only secret custom fields part.
     */
    it.skip("resets secret custom fields.", () => {
      expect.assertions(1);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      const resourceType = resourceTypesCollection.getFirstBySlug(RESOURCE_TYPE_V5_CUSTOM_FIELDS_SLUG);
      entity.resetSecretProps(resourceType);
      // expect(entity.customFields).toBeNull();
    });
  });
});
