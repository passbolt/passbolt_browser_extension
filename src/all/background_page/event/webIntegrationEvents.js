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
import WebIntegrationController from "../controller/webIntegration/webIntegrationController";
import RemovePortController from "../controller/port/removePortController";
import CancelClipboardContentFlushController from "../controller/clipboard/cancelClipboardContentFlushController";

/**
 * Listens the web integration events
 * @param worker
 */
const listen = function(worker) {
  /*
   * Whenever the auto-save is required
   * @listens passbolt.web-integration.autosave
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.web-integration.autosave', async resourceToSave => {
    const webIntegrationController = new WebIntegrationController(worker);
    await webIntegrationController.autosave(resourceToSave);
  });

  /** Whenever the in-form-menu or in-call-to-action are removed */
  worker.port.on('passbolt.port.disconnect', async applicationName => {
    const removePortController = new RemovePortController(worker);
    await removePortController._exec(applicationName);
  });

  /*
   * Whenever a cut or a copy event happens on a web page to ensure the clipboard flush alarm is not triggered
   * @listens passbolt.clipboard.cancel-content-flush
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.clipboard.cancel-content-flush', async requestId => {
    const clipboardController = new CancelClipboardContentFlushController(worker, requestId);
    await clipboardController._exec();
  });
};

export const WebIntegrationEvents = {listen};
