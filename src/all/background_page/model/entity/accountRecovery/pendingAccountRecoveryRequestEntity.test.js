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
 * @since         3.12.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import PendingAccountRecoveryRequestEntity from "./pendingAccountRecoveryRequestEntity";

describe("PendingAccountRecoveryRequest entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PendingAccountRecoveryRequestEntity.ENTITY_NAME, PendingAccountRecoveryRequestEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "status": "pending",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    };
    const entity = new PendingAccountRecoveryRequestEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    expect.assertions(2);
    try {
      new PendingAccountRecoveryRequestEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {required: 'The id is required.'},
        status: {required: 'The status is required.'},
      });
    }
  });

  it("constructor returns validation error if fields do not validate", () => {
    expect.assertions(7);
    try {
      new PendingAccountRecoveryRequestEntity({
        "id": "not-a-uuid",
        "status": "not-a-status",
        "created": "not-a-date",
        "modified": "not-a-date",
        "created_by": "not-a-uuid",
        "modified_by": "not-a-uuid",
      });
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
      expect(error.hasError('status', 'enum')).toBe(true);
      expect(error.hasError('created', 'format')).toBe(true);
      expect(error.hasError('modified', 'format')).toBe(true);
      expect(error.hasError('created_by', 'format')).toBe(true);
      expect(error.hasError('modified_by', 'format')).toBe(true);
    }
  });
});
