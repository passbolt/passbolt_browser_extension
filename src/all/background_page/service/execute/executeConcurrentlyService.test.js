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

// Reset the modules before each test.
import ExecuteConcurrentlyService from "./executeConcurrentlyService";
import {
  defaultRejectAllPromises,
  defaultSuccessfulAllPromises,
  rejectPromise
} from "./executeConcurrentlyService.test.data";

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("ExecuteConcurrentlyService", () => {
  describe("ExecuteConcurrentlyService::execute", () => {
    it("execute successful promises in parallel and get the results", async() => {
      expect.assertions(51);
      const arrayOfPromises = defaultSuccessfulAllPromises(50);
      const service = new ExecuteConcurrentlyService();
      const results = await service.execute(arrayOfPromises, 5);
      expect(results).toHaveLength(50);
      for (let i = 0; i < results.length; i++) {
        expect(results[i]).toEqual(`TEST ${i + 1}`);
      }
    });

    it("execute reject promises in parallel and get the results", async() => {
      expect.assertions(51);
      const arrayOfPromises = defaultRejectAllPromises(50);
      const service = new ExecuteConcurrentlyService();
      const results = await service.execute(arrayOfPromises, 5, {ignoreError: true});
      expect(results).toHaveLength(50);
      for (let i = 0; i < results.length; i++) {
        expect(results[i]).toEqual(new Error(`TEST ${i + 1}`));
      }
    });

    it("execute reject and success promises in parallel and get the results", async() => {
      expect.assertions(51);
      const arrayOfSuccessPromises = defaultSuccessfulAllPromises(25);
      const arrayOfRejectPromises = defaultRejectAllPromises(25);
      const service = new ExecuteConcurrentlyService();
      const results = await service.execute([...arrayOfSuccessPromises, ...arrayOfRejectPromises], 5, {ignoreError: true});
      expect(results).toHaveLength(50);
      for (let i = 0; i < results.length / 2; i++) {
        expect(results[i]).toEqual(`TEST ${i + 1}`);
      }
      for (let i =  results.length / 2; i < results.length; i++) {
        expect(results[i]).toEqual(new Error(`TEST ${i + 1 -  results.length / 2}`));
      }
    });

    it("execute reject promises in parallel and throw error", async() => {
      expect.assertions(1);
      const arrayOfPromises = defaultRejectAllPromises(10);
      const service = new ExecuteConcurrentlyService();
      const promise = service.execute(arrayOfPromises, 5);
      await expect(promise).rejects.toThrowError();
    });

    it("execute reject and success promises in parallel and throw error", async() => {
      expect.assertions(1);
      const arrayOfPromises = defaultSuccessfulAllPromises(10);
      arrayOfPromises.splice(5, 0, rejectPromise("ERROR"));
      const service = new ExecuteConcurrentlyService();
      const promise = service.execute(arrayOfPromises, 5);
      await expect(promise).rejects.toThrowError(new Error("ERROR"));
    });

    it("should trhow an error if execute twice", async() => {
      expect.assertions(2);
      const arrayOfPromises = defaultSuccessfulAllPromises(10);
      arrayOfPromises.splice(5, 0, rejectPromise("ERROR"));
      const service = new ExecuteConcurrentlyService();
      const promise = service.execute(arrayOfPromises, 5);
      const promise2 = service.execute(arrayOfPromises, 5);
      await expect(promise2).rejects.toThrowError(new Error("ExecuteConcurrentlyService should be executed only once"));
      await expect(promise).rejects.toThrowError(new Error("ERROR"));
    });
  });
});
