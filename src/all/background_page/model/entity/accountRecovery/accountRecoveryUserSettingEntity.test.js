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
import EntitySchema from "../abstract/entitySchema";
import EntityValidationError from "../abstract/entityValidationError";
import AccountRecoveryUserSettingEntity from "./accountRecoveryUserSettingEntity";

describe("AccountRecoveryUserSetting entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AccountRecoveryUserSettingEntity.ENTITY_NAME, AccountRecoveryUserSettingEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "status": "approved"
    };
    const entity = new AccountRecoveryUserSettingEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO is provided with optional fields", () => {
    const dto = {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "user_id": "d4c0e643-3967-443b-93b3-102d902c4511",
      "status": "approved",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    };
    const entity = new AccountRecoveryUserSettingEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works with associated 'account recovery private key'", () => {
    const dto = {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "user_id": "d4c0e643-3967-443b-93b3-102d902c4511",
      "status": "approved",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "account_recovery_private_key": {
        "data": "-----BEGIN PGP MESSAGE-----\n\n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\nAWR9kkU+WRDefv4aQLc9vKpZFjhSpCFqwK0Y\n=GVs3\n-----END PGP MESSAGE-----\n"
      }
    };
    const entity = new AccountRecoveryUserSettingEntity(dto);
    expect(entity.toDto().account_recovery_private_key).toBeUndefined();
    const contain = {account_recovery_private_key: true};
    expect(entity.toDto(contain)).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new AccountRecoveryUserSettingEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('status', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    try {
      new AccountRecoveryUserSettingEntity({'id': 'not-valid-uuid'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryUserSettingEntity({'user_id': 'not-valid-uuid'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('user_id', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryUserSettingEntity({'status': 'not-valid-status'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('status', 'enum')).toBe(true);
    }
    try {
      new AccountRecoveryUserSettingEntity({'created': 'not-valid-date'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('created', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryUserSettingEntity({'modified': 'not-valid-date'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('modified', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryUserSettingEntity({'created_by': 'not-valid-uuid'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('created_by', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryUserSettingEntity({'modified_by': 'not-valid-uuid'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('modified_by', 'format')).toBe(true);
    }
  });
});

