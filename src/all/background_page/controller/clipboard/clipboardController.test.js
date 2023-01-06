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

import ClipboardController from './clipboardController';

describe('ClipboardController', () => {
  let controller, workerMock;
  const toCopy = "text";

  beforeEach(() => {
    workerMock = {
      port: {
        emit: jest.fn()
      }
    };
    navigator.clipboard = {
      writeText: jest.fn()
    };
    controller = new ClipboardController(workerMock, 'request-id');
  });

  describe('constructor', () => {
    it('should set the worker and requestId properties', () => {
      expect.assertions(2);
      expect(controller.worker).toBe(workerMock);
      expect(controller.requestId).toBe('request-id');
    });
  });

  describe('_exec', () => {
    it('should call the exec method and emit a success message on the worker port', async() => {
      expect.assertions(2);
      const execSpy = jest.spyOn(controller, 'exec');
      await controller._exec(toCopy);
      expect(execSpy).toHaveBeenCalledWith(toCopy);
      expect(workerMock.port.emit).toHaveBeenCalledWith('request-id', 'SUCCESS');
    });

    it('should emit an error message on the worker port if an error occurs', async() => {
      expect.assertions(1);
      const error = new Error('Some error');
      jest.spyOn(controller, 'exec').mockImplementationOnce(() => {
        throw error;
      });
      await controller._exec(toCopy);
      expect(workerMock.port.emit).toHaveBeenCalledWith('request-id', 'ERROR', error);
    });
  });

  describe('exec', () => {
    it('should call navigator.clipboard method of the QuickAccessService', () => {
      expect.assertions(1);
      controller.exec(toCopy);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('text');
    });
  });
});
