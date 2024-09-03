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
 * @since         4.7.0
 */

export const fetchOptionsHeaders = () => ({
  "X-CSRF-Token": crypto.randomUUID()
});

export const fetchOptionWithBodyData = () => ({
  credentials: "include",
  headers: fetchOptionsHeaders(),
  body: {
    prop1: "value 1",
    prop2: "value 2"
  }
});

export const fetchOptionsWithBodyFormData = () => {
  const formDataBody = (new FormData());
  formDataBody.append("prop1", "value 1");
  formDataBody.append("prop1", "value 2");
  return {
    method: "POST",
    credentials: "include",
    headers: fetchOptionsHeaders(),
    body: formDataBody
  };
};
