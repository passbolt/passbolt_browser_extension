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
import browser from "../../sdk/polyfill/browserPolyfill";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import WorkersSessionStorage from "./workersSessionStorage";

describe("WorkersSessionStorage", () => {
  beforeEach(async() => {
    await browser.storage.session.clear();
  });

  describe("WorkersSessionStorage::addWorker", () => {
    it("Should add worker in storage session", async() => {
      expect.assertions(4);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({name: "worker2", frameId: 2}));
      const workerEntity3 = new WorkerEntity(readWorker({tabId: 2}));
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      await WorkersSessionStorage.addWorker(workerEntity2);
      await WorkersSessionStorage.addWorker(workerEntity3);
      // expectations
      expect(await WorkersSessionStorage.getWorkersByTabId(workerEntity.tabId)).toEqual([workerEntity.toDto(), workerEntity2.toDto()]);
      expect(await WorkersSessionStorage.getWorkerOnMainFrame(workerEntity.tabId)).toEqual(workerEntity.toDto());
      expect(await WorkersSessionStorage.getWorkerById(workerEntity3.id)).toEqual(workerEntity3.toDto());
      expect(await WorkersSessionStorage.getWorkersByNameAndTabId(workerEntity2.name, workerEntity2.tabId)).toEqual([workerEntity2.toDto()]);
    });

    it("Should not add worker in storage session if the limit by tab is exceeded", async() => {
      expect.assertions(2);
      // data mocked
      try {
        for (let i = 0; i < 101; i++) {
          const workerEntity = new WorkerEntity(readWorker());
          await WorkersSessionStorage.addWorker(workerEntity);
        }
      } catch (error) {
        // expectations
        const workers = await WorkersSessionStorage.getWorkers();
        expect(workers.length).toStrictEqual(100);
        expect(error.message).toStrictEqual("The extension port limit is exceeded on tab 1");
      }
    });
  });

  describe("WorkersSessionStorage::updateWorker", () => {
    it("Should update a worker if present", async() => {
      expect.assertions(2);
      // data mocked
      const worker = readWorker();
      const workerEntity = new WorkerEntity(worker);
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      worker.frameId = 9;
      await WorkersSessionStorage.updateWorker(new WorkerEntity(worker));
      // expectations
      expect(await WorkersSessionStorage.getWorkerById(worker.id)).toEqual(worker);
      expect(worker.frameId).toBe(9);
    });

    it("Should do nothing if the worker doesn't exist", async() => {
      expect.assertions(3);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({frameId: 2}));
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      try {
        await WorkersSessionStorage.updateWorker(workerEntity2);
      } catch (error) {
        // expectations
        expect(await WorkersSessionStorage.getWorkerById(workerEntity.id)).toEqual(workerEntity.toDto());
        expect(workerEntity.frameId).toBe(0);
        expect(error.message).toBe("The worker could not be found in the session storage");
      }
    });
  });

  describe("WorkersSessionStorage::delete", () => {
    it("Should keep workers if there is no worker in tab id", async() => {
      expect.assertions(1);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      await WorkersSessionStorage.deleteByTabId(2);
      // expectations
      expect(await WorkersSessionStorage.getWorkerById(workerEntity.id)).toEqual(workerEntity.toDto());
    });

    it("Should remove workers in same tab id", async() => {
      expect.assertions(3);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({frameId: 2}));
      const workerEntity3 = new WorkerEntity(readWorker({tabId: 2}));
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      await WorkersSessionStorage.addWorker(workerEntity2);
      await WorkersSessionStorage.addWorker(workerEntity3);
      await WorkersSessionStorage.deleteByTabId(1);
      // expectations
      expect(await WorkersSessionStorage.getWorkersByTabId(workerEntity.tabId)).toEqual([]);
      expect(await WorkersSessionStorage.getWorkerOnMainFrame(workerEntity.tabId)).toEqual(undefined);
      expect(await WorkersSessionStorage.getWorkerById(workerEntity3.id)).toEqual(workerEntity3.toDto());
    });

    it("Should remove worker with an id", async() => {
      expect.assertions(4);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({frameId: 2}));
      const workerEntity3 = new WorkerEntity(readWorker({tabId: 2}));
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      await WorkersSessionStorage.addWorker(workerEntity2);
      await WorkersSessionStorage.addWorker(workerEntity3);
      await WorkersSessionStorage.deleteById(workerEntity.id);
      // expectations
      expect((await WorkersSessionStorage.getWorkers()).length).toEqual(2);
      expect(await WorkersSessionStorage.getWorkerById(workerEntity.id)).toEqual(undefined);
      expect(await WorkersSessionStorage.getWorkerById(workerEntity2.id)).toEqual(workerEntity2.toDto());
      expect(await WorkersSessionStorage.getWorkerById(workerEntity3.id)).toEqual(workerEntity3.toDto());
    });
  });
});
