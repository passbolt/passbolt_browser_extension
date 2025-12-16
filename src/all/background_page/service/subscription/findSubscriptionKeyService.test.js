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
 * @since         5.9.0
 */
import {enableFetchMocks} from 'jest-fetch-mock';
import PassboltApiFetchError from 'passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError';
import FindSubscriptionKeyService from './findSubscriptionKeyService';
import PassboltSubscriptionError from '../../error/passboltSubscriptionError';
import SubscriptionEntity from '../../model/entity/subscription/subscriptionEntity';
import {API_CLIENT_OPTIONS, KEY, KEY_DTO} from './findSubscriptionKeyService.test.data';

beforeEach(() => {
  enableFetchMocks();
});

describe('FindSubscriptionKeyService', () => {
  let service;

  beforeEach(() => {
    service = new FindSubscriptionKeyService(API_CLIENT_OPTIONS);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('::find', () => {
    it('should return the subscription key', async() => {
      expect.assertions(2);

      jest.spyOn(service.subscriptionService, 'find').mockResolvedValue(KEY_DTO);

      const subscriptionKey = await service.find();

      expect(subscriptionKey).toBeInstanceOf(SubscriptionEntity);
      expect(subscriptionKey._props.data).toEqual(KEY);
    });

    describe('Payment required error', () => {
      it('should throw a PassboltSubscriptionError', async() => {
        expect.assertions(2);

        const errorMessage = 'an error occurred';
        const error = new PassboltApiFetchError(errorMessage, {
          code: 402,
          body: KEY_DTO
        });

        jest.spyOn(service.subscriptionService, 'find').mockRejectedValue(error);

        try {
          await service.find();
        } catch (error) {
          expect(error).toBeInstanceOf(PassboltSubscriptionError);
          expect(error.message).toEqual(errorMessage);
        }
      });

      it('should throw a TypeError if the returned entity is missing required properties', async() => {
        expect.assertions(2);

        const errorMessage = 'an error occurred';
        const error = new PassboltApiFetchError(errorMessage, {
          code: 402,
        });

        jest.spyOn(service.subscriptionService, 'find').mockRejectedValue(error);

        try {
          await service.find();
        } catch (error) {
          expect(error).toBeInstanceOf(TypeError);
          expect(error.message).toEqual('Could not validate entity Subscription. No data provided.');
        }
      });
    });

    it('should throw parent\'s error when payment is not required', async() => {
      expect.assertions(1);

      const error = new Error();

      jest.spyOn(service.subscriptionService, 'find').mockRejectedValue(error);

      await expect(service.find()).rejects.toEqual(error);
    });
  });
});
