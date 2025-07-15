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
 * @since         5.3.2
 */

import {v4 as uuidv4} from 'uuid';
import CopyTemporarilyToClipboardController from './copyTemporarilyToClipboardController';

describe('CopyTemporarilyToClipboardController', () => {
  describe('constructor', () => {
    it('should set the worker and requestId properties', () => {
      expect.assertions(2);

      const worker = {port: {}};
      const requestId = uuidv4();
      const controller = new CopyTemporarilyToClipboardController(worker, requestId);

      expect(controller.worker).toBe(worker);
      expect(controller.requestId).toBe(requestId);
    });
  });

  describe('exec', () => {
    it('should call copyTemporarily of the right service', async() => {
      expect.assertions(2);

      const toCopy = "text";
      const controller = new CopyTemporarilyToClipboardController();

      jest.spyOn(controller.copyToClipboardService, "copyTemporarily").mockImplementation(() => {});

      await controller.exec(toCopy);

      expect(controller.copyToClipboardService.copyTemporarily).toHaveBeenCalledTimes(1);
      expect(controller.copyToClipboardService.copyTemporarily).toHaveBeenCalledWith(toCopy);
    });
  });
});
