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

import PownedPasswordService from "./pownedService";
import ExternalServiceUnavailableError from '../../error/externalServiceUnavailableError';
import ExternalServiceError from '../../error/externalServiceError';

describe('PownedPasswordService', () => {
  describe('checkIfPasswordIsPowned', () => {
    it('should return a rejected promise if the input password is not a string', async() => {
      expect.assertions(1);
      try {
        await PownedPasswordService.checkIfPasswordIsPowned(123);
      } catch (error) {
        expect(error.message).toEqual('Input password must be a string.');
      }
    });

    it('should return a rejected promise if the pwnedpasswords API is unavailable', async() => {
      expect.assertions(1);
      try {
        // Mock the fetch function to throw an error
        jest.spyOn(global, 'fetch').mockImplementation(() => {
          throw new Error();
        });
        await PownedPasswordService.checkIfPasswordIsPowned('password');
      } catch (error) {
        expect(error).toBeInstanceOf(ExternalServiceUnavailableError);
      }
    });

    it('should return a rejected promise if the pwnedpasswords API returns a non-200 status code', async() => {
      expect.assertions(1);
      // Mock the fetch function to return a response with a non-200 status code
      jest.spyOn(global, 'fetch').mockImplementation(() => ({
        status: 500,
        text: () => Promise.resolve('')
      }));
      try {
        await PownedPasswordService.checkIfPasswordIsPowned('password');
      } catch (error) {
        expect(error).toBeInstanceOf(ExternalServiceError);
      }
    });

    it('should return the number of times the password has been pwned if it is present in the pwnedpasswords API', async() => {
      // Mock the fetch function to return a response with a 200 status code and a pwned password
      jest.spyOn(global, 'fetch').mockImplementation(() => ({
        status: 200,
        text: () => Promise.resolve('suffix:count')
      }));
      const count = await PownedPasswordService.checkIfPasswordIsPowned('password');
      expect(count).toEqual(count);
    });

    it('should return 0 if the password is not present in the pwnedpasswords API', async() => {
      // Mock the fetch function to return a response with a 200 status code and no pwned password
      jest.spyOn(global, 'fetch').mockImplementation(() => ({
        status: 200,
        text: () => Promise.resolve('')
      }));
      const count = await PownedPasswordService.checkIfPasswordIsPowned('password');
      expect(count).toEqual(0);
    });
  });
});
