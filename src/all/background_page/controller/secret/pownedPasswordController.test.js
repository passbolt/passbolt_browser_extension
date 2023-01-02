/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */

import PownedPasswordController from './pownedPasswordController';
import PownedPasswordService from '../../service/secret/pownedService';

describe('PownedPasswordController', () => {
  let controller, worker;

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    controller = new PownedPasswordController(worker, 'request-id');
  });

  describe('constructor', () => {
    it('should set the worker and requestId properties', () => {
      expect(controller.worker).toBe(worker);
      expect(controller.requestId).toEqual('request-id');
    });
  });

  describe('_exec', () => {
    it('should emit a "SUCCESS" message with the result on the worker port if the password check is successful', async() => {
      // Mock the exec function to return a successful result
      jest.spyOn(controller, 'exec').mockResolvedValue(10);
      await controller._exec('password');
      expect(worker.port.emit).toHaveBeenCalledWith('request-id', 'SUCCESS', 10);
    });

    it('should emit an "ERROR" message with the error on the worker port if the password check fails', async() => {
      // Mock the exec function to throw an error
      jest.spyOn(controller, 'exec').mockRejectedValue(new Error('Something went wrong'));
      await controller._exec('password');
      expect(worker.port.emit).toHaveBeenCalledWith('request-id', 'ERROR', new Error('Something went wrong'));
    });
  });

  describe('exec', () => {
    it('should return the result of the PownedPasswordService.checkIfPasswordIsPowned function', async() => {
      // Mock the PownedPasswordService.checkIfPasswordIsPowned function to return a successful result
      jest.spyOn(PownedPasswordService, 'checkIfPasswordIsPowned').mockResolvedValue(10);
      const result = await controller.exec('password');
      expect(result).toEqual(10);
    });
  });
});
