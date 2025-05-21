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
 */
import * as kdbxweb from "kdbxweb";
import argon2 from "./argon2.test-lib";
import ResourcesKdbxExporter from "./resourcesKdbxExporter";
import ExportResourcesFileEntity from "../../entity/export/exportResourcesFileEntity";
import fs from "fs";
import {defaultTotpDto} from "../../entity/totp/totpDto.test.data";
import {defaultIconDto} from "passbolt-styleguide/src/shared/models/entity/resource/metadata/iconEntity.test.data";

global.kdbxweb = kdbxweb;
kdbxweb.CryptoEngine.argon2 = argon2;

describe("ResourcesKdbxExporter", () => {
  function buildImportResourceDto(num, data) {
    return Object.assign({
      id: `7f077753-0835-4054-92ee-556660ea04a${num}`,
      name: `Password ${num}`,
      username: `username${num}`,
      uri: `https://url${num}.com`,
      description: `Description ${num}`,
      secret_clear: `Secret ${num}`,
      folder_parent_path: '',
      totp: defaultTotpDto(),
      expired: null,
    }, data);
  }

  function buildExternalFolderDto(num, data) {
    return Object.assign({
      id: `7f077753-0835-4054-92ee-556660ea04f${num}`,
      name: `Folder ${num}`,
      folder_parent_path: ""
    }, data);
  }

  it("should export with no content", async() => {
    const exportDto = {
      "format": "kdbx",
      "export_resources": [],
      "export_folders": []
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesKdbxExporter(exportEntity);
    await exporter.export();

    expect(exportEntity.file).toBeInstanceOf(ArrayBuffer);

    const kdbxCredentials = new kdbxweb.Credentials(null, null);
    await kdbxweb.Kdbx.load(exportEntity.file, kdbxCredentials);
  });

  it("should export resources and folders for keepass windows", async() => {
    expect.assertions(20);

    const now = new Date();
    now.setMilliseconds(0);

    const exportFolder1 = buildExternalFolderDto(1);
    const exportFolder2 = buildExternalFolderDto(2, {"folder_parent_path": "Folder 1", "folder_parent_id": exportFolder1.id});
    const exportResource1 = buildImportResourceDto(1);
    const exportResource2 = buildImportResourceDto(2, {"folder_parent_path": "Folder 1", "folder_parent_id": exportFolder1.id, totp: undefined});
    const exportResource3 = buildImportResourceDto(3, {"folder_parent_path": "Folder 1/Folder2", "folder_parent_id": exportFolder2.id, totp: defaultTotpDto({secret_key: "this is a secret"})});
    const exportResource4 = buildImportResourceDto(4, {"expired": now.toISOString()});
    const exportDto = {
      "format": "kdbx",
      "export_resources": [exportResource1, exportResource2, exportResource3, exportResource4],
      "export_folders": [exportFolder1, exportFolder2]
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesKdbxExporter(exportEntity);
    await exporter.export();

    expect(exportEntity.file).toBeInstanceOf(ArrayBuffer);

    const kdbxCredentials = new kdbxweb.Credentials(null, null);
    const kdbxDb = await kdbxweb.Kdbx.load(exportEntity.file, kdbxCredentials);

    const kdbxRoot = kdbxDb.groups[0];
    const password1 = kdbxRoot.entries[0];
    const password4 = kdbxRoot.entries[1];

    const kdbxBin = kdbxRoot.groups[0];

    const folder1 = kdbxRoot.groups[1];
    const password2 = folder1.entries[0];

    const folder2 = folder1.groups[0];
    const password3 = folder2.entries[0];

    expect(kdbxRoot.name).toEqual("passbolt export");
    expect(kdbxBin.name).toEqual("Recycle Bin");
    expect(folder1.name).toEqual("Folder 1");

    expect(password1.fields.get('Title')).toEqual("Password 1");
    expect(password1.times.expires).toStrictEqual(false);
    expect(password1.times.expiryTime).toBeUndefined();

    expect(password1.fields.get('Password').getText()).toEqual("Secret 1");
    const secret_key = password1.fields.get('TimeOtp-Secret-Base32').getText();
    const algorithm = password1.fields.get('TimeOtp-Algorithm');
    const digits = password1.fields.get('TimeOtp-Length');
    const period = password1.fields.get('TimeOtp-Period');
    expect(secret_key).toEqual("DAV3DS4ERAAF5QGH");
    expect(algorithm).toEqual("HMAC-SHA-1");
    expect(digits).toEqual("6");
    expect(period).toEqual("30");

    expect(password4.fields.get('Title')).toEqual("Password 4");
    expect(password4.times.expires).toStrictEqual(true);
    expect(password4.times.expiryTime).toStrictEqual(new Date(now));

    expect(folder2.name).toEqual("Folder 2");
    expect(password2.fields.get('Title')).toEqual("Password 2");
    expect(kdbxDb.groups[0].groups[1].entries[0].fields.get('otp')).toBeUndefined();
    expect(password3.fields.get('Title')).toEqual("Password 3");
    const secret_key2 = password3.fields.get('TimeOtp-Secret-Base32').getText();
    expect(secret_key2).toEqual("THISISASECRET");
  });

  it("should export resources with icons and colors if any", async() => {
    expect.assertions(6);

    const iconDto = defaultIconDto();
    const exportResource1 = buildImportResourceDto(1);
    const exportResource2 = buildImportResourceDto(2, {icon: iconDto});

    const exportDto = {
      "format": "kdbx",
      "export_resources": [exportResource1, exportResource2],
      "export_folders": []
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesKdbxExporter(exportEntity);
    await exporter.export();

    const kdbxCredentials = new kdbxweb.Credentials(null, null);
    const kdbxDb = await kdbxweb.Kdbx.load(exportEntity.file, kdbxCredentials);

    const kdbxRoot = kdbxDb.groups[0];
    const password1 = kdbxRoot.entries[0];
    const password2 = kdbxRoot.entries[1];

    expect(password1.fields.get('Title')).toEqual("Password 1");
    expect(password1.bgColor).toStrictEqual("");
    expect(password1.icon).toStrictEqual(0);

    expect(password2.fields.get('Title')).toEqual("Password 2");
    expect(password2.bgColor).toStrictEqual(iconDto.background_color);
    expect(password2.icon).toStrictEqual(iconDto.value);
  });

  it("should export resources and folders for other keepass", async() => {
    expect.assertions(17);

    const now = new Date();
    now.setMilliseconds(0);

    const exportFolder1 = buildExternalFolderDto(1);
    const exportFolder2 = buildExternalFolderDto(2, {"folder_parent_path": "Folder 1", "folder_parent_id": exportFolder1.id});
    const exportResource1 = buildImportResourceDto(1);
    const exportResource2 = buildImportResourceDto(2, {"folder_parent_path": "Folder 1", "folder_parent_id": exportFolder1.id, totp: undefined});
    const exportResource3 = buildImportResourceDto(3, {"folder_parent_path": "Folder 1/Folder2", "folder_parent_id": exportFolder2.id, totp: defaultTotpDto({secret_key: "this is a secret!_"})});
    const exportResource4 = buildImportResourceDto(4, {"expired": now.toISOString()});
    const exportDto = {
      "format": "kdbx-others",
      "export_resources": [exportResource1, exportResource2, exportResource3, exportResource4],
      "export_folders": [exportFolder1, exportFolder2]
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesKdbxExporter(exportEntity);
    await exporter.export();

    expect(exportEntity.file).toBeInstanceOf(ArrayBuffer);

    const kdbxCredentials = new kdbxweb.Credentials(null, null);
    const kdbxDb = await kdbxweb.Kdbx.load(exportEntity.file, kdbxCredentials);

    const kdbxRoot = kdbxDb.groups[0];
    const password1 = kdbxRoot.entries[0];
    const password4 = kdbxRoot.entries[1];

    const kdbxBin = kdbxRoot.groups[0];

    const folder1 = kdbxRoot.groups[1];
    const password2 = folder1.entries[0];

    const folder2 = folder1.groups[0];
    const password3 = folder2.entries[0];

    expect(kdbxRoot.name).toEqual("passbolt export");
    expect(kdbxBin.name).toEqual("Recycle Bin");
    expect(folder1.name).toEqual("Folder 1");

    expect(password1.fields.get('Title')).toEqual("Password 1");
    expect(password1.times.expires).toStrictEqual(false);
    expect(password1.times.expiryTime).toBeUndefined();

    expect(password1.fields.get('Password').getText()).toEqual("Secret 1");
    const totp = password1.fields.get('otp').getText();
    expect(totp).toEqual("otpauth://totp/Password%201%3Ausername1?secret=DAV3DS4ERAAF5QGH&issuer=https%253A%252F%252Furl1.com&algorithm=SHA1&digits=6&period=30");

    expect(password4.fields.get('Title')).toEqual("Password 4");
    expect(password4.times.expires).toStrictEqual(true);
    expect(password4.times.expiryTime).toStrictEqual(new Date(now));

    expect(folder2.name).toEqual("Folder 2");
    expect(password2.fields.get('Title')).toEqual("Password 2");
    expect(kdbxDb.groups[0].groups[1].entries[0].fields.get('otp')).toBeUndefined();
    expect(password3.fields.get('Title')).toEqual("Password 3");
    const totp2 = password3.fields.get('otp').getText();
    expect(totp2).toEqual("otpauth://totp/Password%203%3Ausername3?secret=THISISASECRET&issuer=https%253A%252F%252Furl3.com&algorithm=SHA1&digits=6&period=30");
  });

  it("should protect an export with a password", async() => {
    const exportResource1 = buildImportResourceDto(1);
    const exportDto = {
      "format": "kdbx",
      "export_resources": [exportResource1],
      "options": {
        "credentials": {
          "password": "passbolt"
        }
      }
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesKdbxExporter(exportEntity);
    await exporter.export();

    expect(exportEntity.password).toEqual(exportDto.options.credentials.password);
    expect(exportEntity.file).toBeInstanceOf(ArrayBuffer);

    const kdbxCredentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(exportEntity.password), null);
    await kdbxweb.Kdbx.load(exportEntity.file, kdbxCredentials);
  });

  it("should protect an export with a keyfile", async() => {
    const keyfile = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-keyfile.key", {encoding: 'base64'});
    const exportResource1 = buildImportResourceDto(1);
    const exportDto = {
      "format": "kdbx",
      "export_resources": [exportResource1],
      "options": {
        "credentials": {
          "keyfile": keyfile
        }
      }
    };

    const exportEntity = new ExportResourcesFileEntity(exportDto);
    const exporter = new ResourcesKdbxExporter(exportEntity);
    await exporter.export();

    expect(exportEntity.password).toBeNull();
    expect(exportEntity.file).toBeInstanceOf(ArrayBuffer);

    const kdbxCredentials = new kdbxweb.Credentials(null, kdbxweb.ByteUtils.base64ToBytes(exportEntity.keyfile));
    await kdbxweb.Kdbx.load(exportEntity.file, kdbxCredentials);
  });
});
