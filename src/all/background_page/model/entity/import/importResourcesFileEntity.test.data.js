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
    const line = `Password ${i},Username ${i},https://url${i}.com,Password ${i},Description ${i},Folder ${i},otpauth://totp/Password%20${i}%3AUsername%20${i}?secret=THISISASECRET&issuer=https%253A%252F%252Furl${i}.com&algorithm=SHA1&digits=6&period=30`;
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
export const chromiumCsvFile = [
  '"name","url","username","password"',
  '"Password 1","https://url1.com","Username 1","Password 1"',
].join("\r\n");

export const mozillaCsvFile = [
  '"url","username","password","httpRealm","formActionOrigin","guid","timeCreated","timeLastUsed","timePasswordChanged"',
  '"https://url1.com","Username 1","Password 1","","","","","",""',
].join("\r\n");

/**
 * With description fields
 */

export const dashlaneCsvFile = [
  '"username","username2","username3","title","password","note","url","category","otpSecret"',
  '"Username 1","","","Password 1","Password 1","Description 1","https://url1.com","",""',
].join("\r\n");

export const safariCsvFile = [
  '"Title","URL","Username","Password","Notes","OTPAuth"',
  '"Password 1","https://url1.com","Username 1","Password 1","Description 1",""',
].join("\r\n");

export const nordPassCsvFile = [
  '"name","url","username","password","note","cardholername","cardnumber","cvc","expirydate","zipcode","folder","full_name","phone_number","email","address1","address2","city","country","state","type"',
  '"Password 1","https://url1.com","Username 1","Password 1","Description 1","","","","","","Folder 1","","","","","","","","",""',
].join("\r\n");

/**
 * With folder and description fields
 */
export const onePasswordCsvFile = [
  '"Title","Username","Url","Password","Notes","Type"',
  '"Password 1","Username 1","https://url1.com","Password 1","Description 1","Folder 1"',
].join("\r\n");

export const bitwardenCsvFile = [
  '"name","login_username","login_uri","login_password","notes","folder","login_totp"',
  '"Password 1","Username 1","https://url1.com","Password 1","Description 1","Folder 1","otpauth://totp/Password%201%3AUsername%201?secret=THISISASECRET&issuer=https%253A%252F%252Furl1.com&algorithm=SHA1&digits=6&period=30"',
].join("\r\n");

export const lastpassCsvFile = [
  '"url","username","password","totp","extra","name","grouping","fav"',
  '"https://url1.com","Username 1","Password 1","","Description 1","Password 1","Folder 1",""',
].join("\r\n");

export const logMeOnceCsvFile = [
  '"name","url","note","group","username","password","extra"',
  '"Password 1","https://url1.com","Description 1","Folder 1","Username 1","Password 1",""',
].join("\r\n");

export const KdbxCsvFile = [
  '"Title","Username","URL","Password","Notes","Group","TOTP"',
  '"Password 1","Username 1","https://url1.com","Password 1","Description 1","Folder 1","otpauth://totp/Password%201%3AUsername%201?secret=THISISASECRET&issuer=https%253A%252F%252Furl1.com&algorithm=SHA1&digits=6&period=30"'
].join("\r\n");

export const KdbxCsvFileTotpData = [
  "Title,Username,URL,Password,Notes,Group,TOTP",
  "Password 1,Username 1,https://url1.com,,,,otpauth://totp/Password%201%3AUsername%201?secret=THISISASECRET&issuer=https%253A%252F%252Furl1.com&algorithm=SHA1&digits=6&period=30"
].join("\r\n");
