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
 * @since         4.0.0
 */

import MessageService from "../service/messageService";

/**
 * Message event handler.
 */
class MessageEventHandler {
  /**
   * Message Event Handler constructor
   */
  constructor(messageService) {
    if (!(messageService instanceof MessageService)) {
      throw new Error('The messageService should be a valid MessageService instance.');
    }
    this.messageService = messageService;
  }

  /**
   * Listen to the event.
   * @param {string} message The message to listen to.
   * @param {Class} ControllerClass The controller class that aims to treat the message.
   * @param {any} controllerArgs The controller additional parameters.
   */
  listen(message, ControllerClass, ...controllerArgs) {
    if (typeof message !== 'string') {
      throw new Error('The message should be a valid string.');
    }
    if (!message.length) {
      throw new Error('The message should not be empty.');
    }
    if (typeof ControllerClass !== 'function') {
      throw new Error('The ControllerClass should be a valid class.');
    }

    const callback = async(...callbackArgs) => {
      callbackArgs = callbackArgs || {};
      try {
        const controllersArgs = controllerArgs || {};
        const controller = new ControllerClass(...controllersArgs);
        const result = await controller.exec(...callbackArgs);
        await this.messageService.success(result);
      } catch (error) {
        await this.messageService.error(error);
      }
    };
    this.messageService.addListener(message, callback);
  }
}

export default MessageEventHandler;
