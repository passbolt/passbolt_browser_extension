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

export const defaultPermissionSimulation = (addedUserIds = [], removedUserIds = []) => {
  const data = {
    changes: {
      added: [],
      removed: [],
    }
  };

  if (addedUserIds.length > 0) {
    data.changes.added = addedUserIds.map(userId => ({User: {id: userId}}));
  }

  if (removedUserIds.length > 0) {
    data.changes.removed = removedUserIds.map(userId => ({User: {id: userId}}));
  }

  return data;
};
