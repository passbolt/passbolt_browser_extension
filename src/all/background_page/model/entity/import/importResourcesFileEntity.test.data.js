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

import BinaryConvert from "../../../utils/format/binaryConvert";
import fs from "fs";

export const defaultCsvData = [
  "Title,Username,URL,Password,Notes,Group",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1",
  "Password 2,Username 2,https://url1.com,Password 2,Description 2,Folder",
].join("\n");


export const defaultKDBXCSVData = (lineCount = 1) => {
  const header = "Title,Username,URL,Password,Notes,Group,TOTP";

  const lines = [];

  for (let i = 1; i <= lineCount; i++) {
    const line = `Password ${i},Username ${i},https://url${i}.com,Secret ${i},Description ${i},Folder ${i},otpauth://totp/Password%20${i}%3AUsername%20${i}?secret=THISISASECRET&issuer=https%253A%252F%252Furl${i}.com&algorithm=SHA1&digits=6&period=30`;
    lines.push(line);
  }

  return [header, ...lines].join("\n");
};

export const defaultImportResourceFileCSVDto = (data = {}) => ({
  ref: "import-ref",
  file_type: "csv",
  file: btoa(BinaryConvert.toBinary(defaultCsvData)),
  ...data,
});

export const importResourceFileWithAllOptionsDto = (data = {}) => {
  const options = defaultImportResourceFileOptionsDto(data.options);
  delete(data?.options);
  return defaultImportResourceFileCSVDto({
    options,
    ...data,
  });
};

export const defaultImportResourceFileKDBXDto = (data = {}) => {
  const defaultPath = "./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx";
  const file = fs.readFileSync(data.path || defaultPath, {encoding: 'base64'});

  return {
    ref: "import-ref",
    file_type: "kdbx",
    file: file,
    ...data
  };
};

export const defaultImportResourceFileOptionsDto = (data = {}) => ({
  folders: true,
  tags: true,
  credentials: {
    password: "",
    keyfile: "",
  },
  ...data
});

/**
 * Without folder fields / totp / description
 */
export const chromiumCsvFileImport =  [
  "name,username,url,password",
  "Password 1,Username 1,https://url1.com,Password 1",
].join("\n");

export const mozillaCsvFileImport =  [
  "url,username,url,password",
  "Password 1,Username 1,https://url1.com,Password 1",
].join("\n");

/**
 * With description fields
 */

export const dashlaneCsvFileImport =  [
  "username,username1,username2,username3,title,password,note,url,category, otpSecret",
  "Username 1,not supported,not supported,not supported,Password 1,Password 1,Description 1,https://url1.com,Password 1,not supported,not supported",
].join("\n");

export const safariCsvFileImport =  [
  "Title,Username,URL,Password,Notes,OTPAuth",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1,not supported",
].join("\n");
export const nordPassCsvFileImport =  [
  "name,username,url,password,note",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1",
].join("\n");

/**
 * With folder and description fields
 */
export const onePasswordCsvFileImport =  [
  "Title,Username,Url,Password,Notes,Type",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1,Folder 1",
].join("\n");

export const bitwardenCsvFileImport =  [
  "name,login_username,login_uri,login_password,notes,folder",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1,Folder 1",
].join("\n");

export const lastpassCsvFileImport =  [
  "name,username,url,password,extra,grouping",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1,Folder 1",
].join("\n");

export const logMeOnceCsvFileImport =  [
  "name,username,url,password,note,group",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1,Folder 1",
].join("\n");

export const KdbxCsvFileTotpData = [
  "Title,Username,URL,Password,Notes,Group,TOTP",
  "Password 1,Username 1,https://url1.com,,,,otpauth://totp/Password%201%3AUsername%201?secret=THISISASECRET&issuer=https%253A%252F%252Furl1.com&algorithm=SHA1&digits=6&period=30"
].join("\n");
