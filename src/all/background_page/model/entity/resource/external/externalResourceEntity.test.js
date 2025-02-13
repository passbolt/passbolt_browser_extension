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

    it("validates uri property", () => {
      assertEntityProperty.string(ExternalResourceEntity, "uri");
      assertEntityProperty.maxLength(ExternalResourceEntity, "uri", 1024);
      assertEntityProperty.notRequired(ExternalResourceEntity, "uri");
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
      expect(entity.uri).toBeNull();
      expect(entity.description).toBeNull();
      expect(entity.secretClear).toEqual(dto.secret_clear);
      expect(entity.folderParentId).toBeNull();
      expect(entity.folderParentPath).toEqual("");
      expect(entity.secrets).toBeNull();
    });

    it("constructor works if valid fields DTO is provided", () => {
      expect.assertions(12);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);
      expect(entity.toDto()).toStrictEqual(dto);
      expect(entity.id).toStrictEqual(dto.id);
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.username).toStrictEqual(dto.username);
      expect(entity.uri).toStrictEqual(dto.uri);
      expect(entity.description).toStrictEqual(dto.description);
      expect(entity.secretClear).toStrictEqual(dto.secret_clear);
      expect(entity.folderParentId).toStrictEqual(dto.folder_parent_id);
      expect(entity.folderParentPath).toStrictEqual(dto.folder_parent_path);
      expect(entity.totp.toDto()).toStrictEqual(dto.totp);
      expect(entity.secrets.toDto()).toStrictEqual(dto.secrets);
      entity.totp = new ExternalTotpEntity(defaultTotpDto({secret_key: "OFL3VF3OU4BZP45D4ZME6KTF654JRSSO4Q2EO6FJFGPKHRHYSVJA"}));
      expect(entity.totp.secret_key !== dto.totp.secret_key).toBeTruthy();
    });

    it("constructor build resource with default values", () => {
      expect.assertions(2);

      const entity = new ExternalResourceEntity();
      expect(entity.name).toEqual(ExternalResourceEntity.DEFAULT_RESOURCE_NAME);
      expect(entity.folderParentPath).toEqual("");
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
        uri: entity.metadata.uris[0],
        description: entity.metadata.description,
        secrets: secrets,
        folder_parent_id: entity.folderParentId,
        resource_type_id: entity.metadata.resourceTypeId,
        folder_parent_path: "",
        expired: null,
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
  });

  describe("::toResourceEntityImportDto", () => {
    it("should export a DTO in the expected format", () => {
      expect.assertions(1);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      const resourceEntityDto = entity.toResourceEntityImportDto();
      expect(resourceEntityDto).toStrictEqual({
        resource_type_id: dto.resource_type_id,
        expired: dto.expired,
        folder_parent_id: dto.folder_parent_id,
        metadata: {
          object_type: "PASSBOLT_RESOURCE_METADATA",
          name: dto.name,
          username: dto.username,
          uris: [dto.uri],
          description: dto.description,
          resource_type_id: dto.resource_type_id,
        },
        secrets: dto.secrets,
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

  describe("::getters", () => {
    it("should provide the right values when everything is set", () => {
      expect.assertions(11);

      const dto = defaultExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      expect(entity.id).toStrictEqual(dto.id);
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.username).toStrictEqual(dto.username);
      expect(entity.uri).toStrictEqual(dto.uri);
      expect(entity.description).toStrictEqual(dto.description);
      expect(entity.secretClear).toStrictEqual(dto.secret_clear);
      expect(entity.folderParentId).toStrictEqual(dto.folder_parent_id);
      expect(entity.folderParentPath).toStrictEqual(dto.folder_parent_path);
      expect(entity.resourceTypeId).toStrictEqual(dto.resource_type_id);
      expect(entity.expired).toStrictEqual(dto.expired);
      expect(entity.path).toStrictEqual(`${dto.folder_parent_path}/${dto.name}`);
    });

    it("should provide the default values with minimal dto", () => {
      expect.assertions(11);

      const dto = minimalExternalResourceDto();
      const entity = new ExternalResourceEntity(dto);

      expect(entity.id).toBeNull();
      expect(entity.name).toStrictEqual(dto.name);
      expect(entity.username).toBeNull();
      expect(entity.uri).toBeNull();
      expect(entity.description).toBeNull();
      expect(entity.secretClear).toStrictEqual(dto.secret_clear);
      expect(entity.folderParentId).toBeNull();
      expect(entity.folderParentPath).toStrictEqual("");
      expect(entity.resourceTypeId).toBeNull();
      expect(entity.expired).toBeNull();
      expect(entity.path).toStrictEqual(dto.name);
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
        totp: new ExternalTotpEntity(defaultTotpDto())
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
  });
});
