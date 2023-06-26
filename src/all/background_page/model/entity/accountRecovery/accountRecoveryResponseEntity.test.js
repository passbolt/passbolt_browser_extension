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
 * @since         3.6.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import AccountRecoveryResponseEntity from "./accountRecoveryResponseEntity";
import {AccountRecoveryRequestEntityTestData} from "./accountRecoveryResponseEntity.test.data";
import {pgpKeys} from "../../../../../../test/fixtures/pgpKeys/keys";

describe("AccountRecoveryResponse entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AccountRecoveryResponseEntity.ENTITY_NAME, AccountRecoveryResponseEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = AccountRecoveryRequestEntityTestData.minimal;
    const entity = new AccountRecoveryResponseEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO with associated entity data is provided", () => {
    const dto = AccountRecoveryRequestEntityTestData.default;
    const filtered = {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
      "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
      "responder_foreign_model": "AccountRecoveryOrganizationKey",
      "data": pgpKeys.ada.public,
      "status": "approved",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    };
    const entity = new AccountRecoveryResponseEntity(dto);
    expect(entity.toDto()).toEqual(filtered);
    expect(entity.accountRecoveryPrivateKeyPasswords).not.toBe(null);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new AccountRecoveryResponseEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        account_recovery_request_id: {required: 'The account_recovery_request_id is required.'},
        responder_foreign_key: {required: 'The responder_foreign_key is required.'},
        responder_foreign_model: {required: 'The responder_foreign_model is required.'},
        status: {required: 'The status is required.'}
      });
    }
  });
});

