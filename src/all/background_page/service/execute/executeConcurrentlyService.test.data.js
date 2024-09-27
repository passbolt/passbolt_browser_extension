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
 * @since         4.9.4
 */

export const successPromise = value => () => new Promise(resolve => setTimeout(() => resolve(value), Math.floor(Math.random() * 50) + 1));
export const rejectPromise = value => () => new Promise((resolve, reject) => setTimeout(() => reject(new Error(value)), Math.floor(Math.random() * 50) + 1));

export const defaultSuccessfulAllPromises = count => {
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(successPromise(`TEST ${i + 1}`));
  }
  return promises;
};

export const defaultRejectAllPromises = count => {
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(rejectPromise(`TEST ${i + 1}`));
  }
  return promises;
};
