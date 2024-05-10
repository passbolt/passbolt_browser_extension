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
 * @since         4.8.0
 */

export const formDataString = () => {
  const formDataBody = new FormData();
  formDataBody.append("prop1", "value 1");
  formDataBody.append("prop1", "value 2");
  return formDataBody;
};

export const formDataFile = () => {
  const formDataBody = new FormData();
  const file1 = new File(['test'], "file 1", {type: 'image/png'});
  const file2 = new File(['test'], "file 2", {type: 'image/png'});
  formDataBody.append("file", file1, "file 1");
  formDataBody.append("file", file2, "file 2");
  return formDataBody;
};

export const formDataBlob = () => {
  const formDataBody = new FormData();
  const blob1 = new Blob(['test'], {type: 'text/plain'});
  const blob2 = new Blob(['test'], {type: 'text/plain'});
  formDataBody.append("blob", blob1, "blob 1");
  formDataBody.append("blob", blob2, "blob 2");
  return formDataBody;
};

export const formDataMixed = () => {
  const formDataBody = new FormData();
  formDataBody.append("prop1", "value 1");
  const file = new File(['test'], "file 1", {type: 'image/png'});
  formDataBody.append("file", file, "file 1");
  const blob = new Blob(['test'], {type: 'text/plain'});
  formDataBody.append("blob", blob, "blob 1");
  return formDataBody;
};

