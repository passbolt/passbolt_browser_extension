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
import WorkerEntity from "./workerEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {readWorker} from "./workerEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("Worker entity", () => {
  jest.useFakeTimers();

  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe("WorkerEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(WorkerEntity.ENTITY_NAME, WorkerEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(WorkerEntity, "id");
      assertEntityProperty.required(WorkerEntity, "id");
    });

    it("validates tabId property", () => {
      assertEntityProperty.integer(WorkerEntity, "tabId");
      assertEntityProperty.required(WorkerEntity, "tabId");
    });

    it("validates frameId property", () => {
      assertEntityProperty.integer(WorkerEntity, "frameId");
      assertEntityProperty.nullable(WorkerEntity, "frameId");
      assertEntityProperty.notRequired(WorkerEntity, "frameId");
    });

    it("validates name property", () => {
      assertEntityProperty.string(WorkerEntity, "name");
      assertEntityProperty.required(WorkerEntity, "name");
    });

    it("validates status property", () => {
      const successValues = ['waiting_connection', 'connected', 'reconnecting'];
      const failValues = ["string"];

      assertEntityProperty.enumeration(WorkerEntity, "status", successValues, failValues);
      assertEntityProperty.required(WorkerEntity, "status");
    });
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "tabId": 1,
      "name": "pagemod",
      "status": WorkerEntity.STATUS_WAITING_CONNECTION
    };
    const entity = new WorkerEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("workerEntity:isConnected", () => {
    expect.assertions(3);
    const dto = readWorker({status: WorkerEntity.STATUS_CONNECTED});
    const entity = new WorkerEntity(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(entity.isConnected).toBeTruthy();
    expect(entity.isWaitingConnection).toBeFalsy();
  });

  it("workerEntity:isWaitingConnection", () => {
    expect.assertions(3);
    const dto = readWorker({status: WorkerEntity.STATUS_WAITING_CONNECTION});
    const entity = new WorkerEntity(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(entity.isWaitingConnection).toBeTruthy();
    expect(entity.isConnected).toBeFalsy();
  });
});

