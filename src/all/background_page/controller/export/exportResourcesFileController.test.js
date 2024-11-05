/**
 * @jest-environment ./test/jest.custom-kdbx-environment
 */
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
 * @since         4.10.1
 */

import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import ExportResourcesFileController from "./exportResourcesFileController";
import ExportResourcesFileEntity, {FORMAT_CSV_KDBX, FORMAT_CSV_LASTPASS, FORMAT_KDBX} from "../../model/entity/export/exportResourcesFileEntity";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import ResourceService from "../../service/api/resource/resourceService";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import each from "jest-each";
import {v4 as uuidv4} from "uuid";
import {KdbxCsvFile} from "../../model/entity/import/importResourcesFileEntity.test.data";
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import FileService from "../../service/file/fileService";
import FolderLocalStorage from "../../service/local_storage/folderLocalStorage";
import ResourcesKdbxExporter from "../../model/export/resources/resourcesKdbxExporter";
import ExternalFoldersCollection from "../../model/entity/folder/external/externalFoldersCollection";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import ExternalResourcesCollection from "../../model/entity/resource/external/externalResourcesCollection";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import {defaultTotpDto} from "../../model/entity/totp/totpDto.test.data";
import TotpEntity from "../../model/entity/totp/totpEntity";
import {resourceCollectionV4ToExport} from "../../service/resource/export/exportResourcesService.test.data";

beforeEach(async() => {
  await MockExtension.withConfiguredAccount();
  jest.resetModules();
  jest.clearAllMocks();
});

describe("ExportResourcesFileController", () => {
  let controller, worker, foldersDto, resourceTypeCollection;
  describe("::exec", () => {
    const account = new AccountEntity(defaultAccountDto({user_id: pgpKeys.ada.userId}));
    const apiClientOptions = defaultApiClientOptions();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `passbolt-export-${date}.csv`;

    beforeEach(async() => {
      worker = {
        port: {
          emit: jest.fn(),
          request: jest.fn()
        },
        tab: {
          id: 1
        },
      };
      foldersDto = [defaultFolderDto({
        name: "Folder 1"
      })];
      resourceTypeCollection = resourceTypesCollectionDto();
      //Mock controller
      controller = new ExportResourcesFileController(worker, null, apiClientOptions, account);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      //Mock api
      jest.spyOn(FolderLocalStorage, "get").mockImplementation(() => foldersDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypeCollection);
      jest.spyOn(FileService, "saveFile").mockImplementation(jest.fn());
    });
    describe("Should export the csv file.", () => {
      it("Should export file - <v4>", async() => {
        expect.assertions(2);
        const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG);
        const file = {
          format: FORMAT_CSV_KDBX,
          resources_ids: [uuidv4()],
          folders_ids: [foldersDto[0].id],
        };
        const resourceCollectionV4 = await resourceCollectionV4ToExport({
          resourceType: resourceType,
          folder_parent_id: foldersDto[0].id,
          totp: defaultTotpDto({secret_key: "THISISASECRET"})
        });
        jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionV4);
        const result = await controller.exec(file);

        const blobFile = new Blob([result.file], {type: "text/csv"});

        expect(FileService.saveFile).toHaveBeenCalledWith(filename, blobFile, "text/csv", 1);
        expect(result.file).toEqual(KdbxCsvFile);
      });
    });

    describe("Should export the KDBX file.", () => {
      /**
       * Use to create the collection resources parsed into KDBX
       * @param {ExportResourcesFileEntity} resourceCollection
       * @param {ResourcesCollection} resourceCollection
       * @returns
       */
      async function getKDBXContent(exportResourcesFileEntity, resourceCollection) {
        const kdbxExporter = new ResourcesKdbxExporter(exportResourcesFileEntity);
        const exportFoldersCollection = new ExternalFoldersCollection(new FoldersCollection(foldersDto));
        const resourcecollection = new ResourcesCollection(resourceCollection);
        const exportResourcesCollection = ExternalResourcesCollection.constructFromResourcesCollection(resourcecollection, exportFoldersCollection);
        exportResourcesFileEntity.exportResources = exportResourcesCollection;
        exportResourcesFileEntity.exportFolders = exportFoldersCollection;
        exportResourcesFileEntity.exportResources.items[0].secretClear = "Password 1";
        exportResourcesFileEntity.exportResources.items[0].description = "Description 1";
        exportResourcesFileEntity.exportResources.items[0].totp = new TotpEntity(defaultTotpDto({secret_key: "THISISASECRET"}));
        await kdbxExporter.export(exportResourcesFileEntity);
      }
      it(`Should export KDBX ${test.format} v4 with credentials`, async() => {
        expect.assertions(1);
        const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG);
        const file = {
          format: FORMAT_KDBX,
          resources_ids: [uuidv4()],
          folders_ids: [foldersDto[0].id],
          option: {credentials: {password: "secret"}}
        };
        const resourceCollectionV4 = await resourceCollectionV4ToExport({
          resourceType: resourceType,
          folder_parent_id: foldersDto[0].id,
          totp: defaultTotpDto({secret_key: "THISISASECRET"})
        });

        const exportResourcesFileEntity = new ExportResourcesFileEntity(file);
        jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionV4);
        await getKDBXContent(exportResourcesFileEntity, new ResourcesCollection(resourceCollectionV4));

        const result = await controller.exec(file);

        expect(result.file).toEqual(exportResourcesFileEntity.file);
      });
    });

    each([
      {scenario: "xls", format: "xls"},
      {scenario: "xlsx", format: "xlsx"},
      {scenario: "tsv", format: "tsv"},
      {scenario: "pdf", format: "pdf"},
      {scenario: "JSON", format: "json"},
      {scenario: "XML", format: "xml"},
      {scenario: "yaml", format: "yaml"},
    ]).describe("Should reject other format.", test => {
      it(`Should reject ${test.scenario} format`, async() => {
        expect.assertions(2);

        const file = {
          format: test.format
        };
        try {
          await controller.exec(file);
        } catch (error) {
          expect(error).toBeInstanceOf(EntityValidationError);
          expect(error.hasError('format', 'enum')).toBeTruthy();
        }
      });
    });

    it("Should reject if format is missing", async() => {
      expect.assertions(2);

      const file = {};
      try {
        await controller.exec(file);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError('format', 'required')).toBeTruthy();
      }
    });
    it("should request passphrase and decrypt the private key", async() => {
      expect.assertions(1);

      const file = {
        format: FORMAT_CSV_LASTPASS,
        resources_ids: [uuidv4()],
        folders_ids: [uuidv4()],
      };

      await controller.exec(file);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
    });

    it(`should init progressService and provide it to the service`, async() => {
      expect.assertions(1);

      expect(controller.exportResourcesService.progressService).toEqual(controller.progressService);
    });

    it("should close progressService in case of error", async() => {
      expect.assertions(1);

      jest.spyOn(controller.progressService, "close");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => { throw new Error("API error"); });
      const file = {
        format: FORMAT_CSV_LASTPASS,
        resources_ids: [uuidv4()],
        folders_ids: [uuidv4()],
      };
      try {
        await controller.exec(file);
      } catch {
        expect(controller.progressService.close).toHaveBeenCalledTimes(1);
      }
    });
  });
});
