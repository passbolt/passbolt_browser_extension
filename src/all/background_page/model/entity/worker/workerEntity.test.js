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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("Worker entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(WorkerEntity.ENTITY_NAME, WorkerEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "tabId": 1,
      "name": "pagemod"
    };
    const entity = new WorkerEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new WorkerEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {required: 'The id is required.'},
        tabId: {required: 'The tabId is required.'},
        name: {required: 'The name is required.'}
      });
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new WorkerEntity({
        "id": "🧟‍️",
        "tabId": "🧟‍",
        "name": [],
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {format: 'The id is not a valid uuid.'},
        tabId: {type: 'The tabId is not a valid integer.'},
        name: {type: 'The name is not a valid string.'}
      });
    }
  });
});

