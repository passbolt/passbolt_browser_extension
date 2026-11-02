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
import WorkerEntity from "../../model/entity/worker/workerEntity";
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import WorkersSessionStorage from "./workersSessionStorage";

describe("WorkersSessionStorage", () => {
  beforeEach(async () => {
    await browser.storage.session.clear();
  });

  describe("WorkersSessionStorage::addWorker", () => {
    it("Should add worker in storage session", async () => {
      expect.assertions(5);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({ name: "worker2", frameId: 2 }));
      const workerEntity3 = new WorkerEntity(readWorker({ name: "worker3", tabId: 2 }));
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      await WorkersSessionStorage.addWorker(workerEntity2);
      await WorkersSessionStorage.addWorker(workerEntity3);
      // expectations
      expect(await WorkersSessionStorage.getWorkersByTabId(workerEntity.tabId)).toEqual([
        workerEntity.toDto(),
        workerEntity2.toDto(),
      ]);
      expect(await WorkersSessionStorage.getWorkerOnMainFrame(workerEntity.tabId)).toEqual(workerEntity.toDto());
      expect(await WorkersSessionStorage.getWorkerById(workerEntity3.id)).toEqual(workerEntity3.toDto());
      expect(await WorkersSessionStorage.getWorkersByNames([workerEntity2.name, workerEntity.name])).toEqual([
        workerEntity.toDto(),
        workerEntity2.toDto(),
      ]);
      expect(await WorkersSessionStorage.getWorkersByNameAndTabId(workerEntity2.name, workerEntity2.tabId)).toEqual([
        workerEntity2.toDto(),
      ]);
    });

    it("Should not add worker in storage session if the limit by tab is exceeded", async () => {
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

  describe("WorkersSessionStorage::addWorkerAndEvictSameFrame", () => {
    it("Should evict a previous worker of the same name/tab/frame before adding the new one", async () => {
      expect.assertions(2);
      // data mocked
      const previousWorker = new WorkerEntity(readWorker());
      const newWorker = new WorkerEntity(
        readWorker({ name: previousWorker.name, tabId: previousWorker.tabId, frameId: previousWorker.frameId }),
      );
      // process
      await WorkersSessionStorage.addWorker(previousWorker);
      await WorkersSessionStorage.addWorkerAndEvictSameFrame(newWorker);
      // expectations: only the new worker remains on the frame.
      expect(await WorkersSessionStorage.getWorkersByTabId(newWorker.tabId)).toEqual([newWorker.toDto()]);
      expect(await WorkersSessionStorage.getWorkerById(previousWorker.id)).toBeUndefined();
    });

    it("Should keep workers of a different name/tab/frame untouched", async () => {
      expect.assertions(1);
      // data mocked
      const otherFrame = new WorkerEntity(readWorker({ name: "worker", frameId: 2 }));
      const otherName = new WorkerEntity(readWorker({ name: "worker2", frameId: 0 }));
      const otherTab = new WorkerEntity(readWorker({ name: "worker", tabId: 2, frameId: 0 }));
      const newWorker = new WorkerEntity(readWorker({ name: "worker", tabId: 1, frameId: 0 }));
      // process
      await WorkersSessionStorage.addWorker(otherFrame);
      await WorkersSessionStorage.addWorker(otherName);
      await WorkersSessionStorage.addWorker(otherTab);
      await WorkersSessionStorage.addWorkerAndEvictSameFrame(newWorker);
      // expectations: none of the non-matching workers were evicted.
      expect(await WorkersSessionStorage.getWorkers()).toEqual([
        otherFrame.toDto(),
        otherName.toDto(),
        otherTab.toDto(),
        newWorker.toDto(),
      ]);
    });

    it("Should throw and not add the worker when the tab limit is exceeded", async () => {
      expect.assertions(2);
      // data mocked: fill the tab to the limit with same-frame workers so the evict frees exactly one slot.
      for (let i = 0; i < 100; i++) {
        await WorkersSessionStorage.addWorker(new WorkerEntity(readWorker({ name: `worker${i}`, frameId: i })));
      }
      const newWorker = new WorkerEntity(readWorker({ name: "workerNew", frameId: 500 }));
      // process
      try {
        await WorkersSessionStorage.addWorkerAndEvictSameFrame(newWorker);
      } catch (error) {
        // expectations
        expect(error.message).toStrictEqual("The extension port limit is exceeded on tab 1");
        expect(await WorkersSessionStorage.getWorkerById(newWorker.id)).toBeUndefined();
      }
    });
  });

  describe("WorkersSessionStorage::updateWorker", () => {
    it("Should update a worker if present", async () => {
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

    it("Should do nothing if the worker doesn't exist", async () => {
      expect.assertions(3);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({ frameId: 2 }));
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
    it("Should keep workers if there is no worker in tab id", async () => {
      expect.assertions(1);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      // process
      await WorkersSessionStorage.addWorker(workerEntity);
      await WorkersSessionStorage.deleteByTabId(2);
      // expectations
      expect(await WorkersSessionStorage.getWorkerById(workerEntity.id)).toEqual(workerEntity.toDto());
    });

    it("Should remove workers in same tab id", async () => {
      expect.assertions(3);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({ frameId: 2 }));
      const workerEntity3 = new WorkerEntity(readWorker({ tabId: 2 }));
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

    it("Should remove worker with an id", async () => {
      expect.assertions(4);
      // data mocked
      const workerEntity = new WorkerEntity(readWorker());
      const workerEntity2 = new WorkerEntity(readWorker({ frameId: 2 }));
      const workerEntity3 = new WorkerEntity(readWorker({ tabId: 2 }));
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
