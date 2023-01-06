/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */

import ClipboardController from '../controller/clipboard/clipboardController';

/**
 * Listens the clipboard events
 * @param worker
 */
const listen = function(worker) {
  worker.port.on('passbolt.clipboard.copy', async(requestId, text) => {
    const clipboardController = new ClipboardController(worker, requestId, text);
    await clipboardController._exec(text);
  });
};

export const ClipboardEvents = {listen};
