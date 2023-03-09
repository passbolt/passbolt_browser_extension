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
import ResourcesCsvExporter from "./resourcesCsvExporter";
import Csv1PasswordRowComposer from "./csvRowComposer/csv1passwordRowComposer";
import CsvKdbxRowComposer from "./csvRowComposer/csvKdbxRowComposer";
import CsvLastPassRowComposer from "./csvRowComposer/csvLastPassRowComposer";
import ExportResourcesFileEntity from "../../entity/export/exportResourcesFileEntity";
import CsvChromiumRowComposer from "./csvRowComposer/csvChromiumRowComposer";
import CsvBitWardenRowComposer from "./csvRowComposer/csvBitWardenRowComposer";
import CsvMozillaPlatformRowComposer from "./csvRowComposer/csvMozillaPlatformRowComposer";
import CsvSafariRowComposer from "./csvRowComposer/csvSafariRowComposer";
import CsvDashlaneRowComposer from "./csvRowComposer/csvDashlaneRowComposer";
import CsvNordpassRowComposer from "./csvRowComposer/csvNordpassRowComposer";
import CsvLogMeOnceRowComposer from "./csvRowComposer/csvLogMeOnceRowComposer";

describe("ResourcesCsvExporter", () => {
  it("should be aware of the supported row parsers", () => {
    expect(ResourcesCsvExporter.register).toHaveLength(10);
    const supportedRowComposers = [
      Csv1PasswordRowComposer,
      CsvKdbxRowComposer,
      CsvLastPassRowComposer,
      CsvChromiumRowComposer,
      CsvBitWardenRowComposer,
      CsvMozillaPlatformRowComposer,
      CsvSafariRowComposer,
      CsvDashlaneRowComposer,
      CsvNordpassRowComposer,
      CsvLogMeOnceRowComposer
    ];
    expect(ResourcesCsvExporter.register).toEqual(expect.arrayContaining(supportedRowComposers));
  });

  it("should export with no content", async() => {
    const exportDto = {
      "format": "csv-kdbx",
      "export_resources": [],
      "export_folders": []
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesCsvExporter(exportEntity);
    await exporter.export();

    // headers
    expect(exportEntity.file).toContain(buildCsvHeader(CsvKdbxRowComposer));
  });

  function buildImportResourceDto(num, data) {
    return Object.assign({
      id: `7f077753-0835-4054-92ee-556660ea04f${num}`,
      name: `Password ${num}`,
      username: `username${num}`,
      uri: `https://url${num}.com`,
      description: `Description ${num}`,
      secret_clear: `Secret ${num}`,
      folder_parent_path: '',
    }, data);
  }

  function buildCsvHeader(RowComposer) {
    return `"${Object.values(RowComposer.mapping).join('","')}"`;
  }

  function buildCsvRow(RowComposer, externalResourceDto) {
    return `"${Object.keys(RowComposer.mapping).map(fieldName => externalResourceDto[fieldName]).join('","')}"`;
  }

  it("should export resources", async() => {
    const exportResource1 = buildImportResourceDto(1);
    const exportResource2 = buildImportResourceDto(2, {"folder_parent_path": "Folder 1"});
    const exportResource3 = buildImportResourceDto(3, {"folder_parent_path": "Folder 1/Folder2"});
    const exportDto = {
      "format": "csv-kdbx",
      "export_resources": [exportResource1, exportResource2, exportResource3],
      "export_folders": []
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesCsvExporter(exportEntity);
    await exporter.export();

    // headers
    expect(exportEntity.file).toContain(buildCsvHeader(CsvKdbxRowComposer));
    // data
    expect(exportEntity.file).toContain(buildCsvRow(CsvKdbxRowComposer, exportResource1));
    expect(exportEntity.file).toContain(buildCsvRow(CsvKdbxRowComposer, exportResource2));
    expect(exportEntity.file).toContain(buildCsvRow(CsvKdbxRowComposer, exportResource3));
  });
});
