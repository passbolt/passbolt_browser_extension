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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ImportResourcesFileEntity from "./importResourcesFileEntity";

describe("ImportResourcesFileEntity entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ImportResourcesFileEntity.ENTITY_NAME, ImportResourcesFileEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const csv = "Title,Username,URL,Password,Notes,Group\n" +
      "Password 1,Username 1,https://url1.com,Password 1,Description 1,\n";
    const importDto = {
      "ref": "import-ref",
      "file_type": "csv",
      "file": btoa(csv)
    };
    const entity = new ImportResourcesFileEntity(importDto);
    expect(entity.ref).toEqual("import-ref");
    expect(entity.fileType).toEqual("csv");
    expect(entity.file).toEqual(btoa(csv));
    expect(entity.options).toEqual({});
    expect(entity.mustImportFolders).toEqual(false);
    expect(entity.mustTag).toEqual(false);
    expect(entity.credentials).toEqual({});
    expect(entity.password).toBeUndefined();
    expect(entity.keyfile).toBeUndefined();
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new ImportResourcesFileEntity({});
      expect(true).toBeFalsy();
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('file', 'required')).toBe(true);
      expect(error.hasError('file_type', 'required')).toBe(true);
      expect(error.hasError('ref', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    try {
      new ImportResourcesFileEntity({
        "ref": true,
        "file_type": 145,
        "file": "not a base64 string",
        "options": {
          "folders": "oui",
          "tags": "non",
          "credentials": {
            "password": {},
            "keyfile": "not a base64 string",
          }
        }
      });
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(error.hasError('file')).toBe(true);
      expect(error.hasError('file_type')).toBe(true);
      expect(error.hasError('ref')).toBe(true);
      /*
       * expect(error.hasError('tags')).toBe(true);
       * expect(error.hasError('folders')).toBe(true);
       * expect(error.hasError('password')).toBe(true);
       * expect(error.hasError('keyfile')).toBe(true);
       */
    }
  });
});
