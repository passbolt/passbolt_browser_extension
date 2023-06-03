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
import AccountRecoveryRequestEntity from "./accountRecoveryRequestEntity";
import {pendingAccountRecoveryRequestDto} from "./accountRecoveryRequestEntity.test.data";

describe("AccountRecoveryRequest entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AccountRecoveryRequestEntity.ENTITY_NAME, AccountRecoveryRequestEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "status": "pending",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    };
    const entity = new AccountRecoveryRequestEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO with associated entity data is provided", () => {
    const dto = pendingAccountRecoveryRequestDto();
    const entity = new AccountRecoveryRequestEntity(dto);

    expect.assertions(8);
    const resultDto = entity.toDto();
    const keys = Object.keys(resultDto);
    const expectedKeys = ['id', 'user_id', 'armored_key', 'fingerprint', 'status', 'created', 'modified', 'created_by',
      'modified_by'];
    expect(Object.keys(resultDto).length).toBe(9);
    expect(keys).toEqual(expectedKeys);
    expect(entity.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).toBeTruthy();
    expect(entity.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.length).toEqual(1);

    const resultDtoWithContain = entity.toDto({account_recovery_private_key: true});
    const keysWithContain = Object.keys(resultDtoWithContain);
    const expectedKeysWithContain = ['id', 'user_id', 'armored_key', 'fingerprint', 'status', 'created', 'modified', 'created_by',
      'modified_by', 'account_recovery_private_key'];
    expect(Object.keys(keysWithContain).length).toBe(10);
    expect(keysWithContain).toEqual(expectedKeysWithContain);
    expect(resultDtoWithContain.account_recovery_private_key.account_recovery_private_key_passwords.length).toBe(1);
    expect(resultDtoWithContain.account_recovery_private_key.account_recovery_private_key_passwords[0].recipient_foreign_key)
      .toEqual(dto.account_recovery_private_key.account_recovery_private_key_passwords[0].recipient_foreign_key);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new AccountRecoveryRequestEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {required: 'The id is required.'},
        status: {required: 'The status is required.'},
      });
    }
  });

  it("constructor returns validation error if fields do not validate", () => {
    expect.assertions(10);
    try {
      new AccountRecoveryRequestEntity({
        "id": "not-a-uuid",
        "user_id": "not-a-uuid",
        "armored_key": true,
        "fingerprint": "0C1",
        "status": "not-a-status",
        "created": "not-a-date",
        "modified": "not-a-date",
        "created_by": "not-a-uuid",
        "modified_by": "not-a-uuid",
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
      expect(error.hasError('user_id', 'format')).toBe(true);
      expect(error.hasError('armored_key', 'type')).toBe(true);
      expect(error.hasError('fingerprint', 'type')).toBe(true);
      expect(error.hasError('status', 'enum')).toBe(true);
      expect(error.hasError('created', 'format')).toBe(true);
      expect(error.hasError('modified', 'format')).toBe(true);
      expect(error.hasError('created_by', 'format')).toBe(true);
      expect(error.hasError('modified_by', 'format')).toBe(true);
    }
  });
});
