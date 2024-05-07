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
import AccountRecoveryRequestEntity from "./accountRecoveryRequestEntity";
import {pendingAccountRecoveryRequestDto} from "passbolt-styleguide/src/shared/models/entity/accountRecovery/accountRecoveryRequestEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("AccountRecoveryRequest entity", () => {
  describe("AccountRecoveryRequestEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AccountRecoveryRequestEntity.ENTITY_NAME, AccountRecoveryRequestEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(AccountRecoveryRequestEntity, "id");
      assertEntityProperty.required(AccountRecoveryRequestEntity, "id");
    });

    it("validates user_id property", () => {
      assertEntityProperty.uuid(AccountRecoveryRequestEntity, "user_id");
      assertEntityProperty.notRequired(AccountRecoveryRequestEntity, "user_id");
    });


    it("validates armored_key property", () => {
      assertEntityProperty.string(AccountRecoveryRequestEntity, "armored_key");
      assertEntityProperty.notRequired(AccountRecoveryRequestEntity, "armored_key");
      assertEntityProperty.notNullable(AccountRecoveryRequestEntity, "armored_key");
    });

    it("validates fingerprint property", () => {
      const successScenarios = [
        {scenario: "with a valid fingerprint string", value: "ABCD".repeat(10)},
        {scenario: "with a null value", value: null},
      ];
      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
      ];
      assertEntityProperty.assert(AccountRecoveryRequestEntity, "fingerprint", successScenarios, failingScenarios, "type");
      assertEntityProperty.nullable(AccountRecoveryRequestEntity, "fingerprint");
      assertEntityProperty.notRequired(AccountRecoveryRequestEntity, "fingerprint");
    });

    it("validates status property", () => {
      const expectedValues = [
        "pending",
        "rejected",
        "approved",
        "completed"
      ];
      const unexpectedValues = ["1", "false", "test"];
      assertEntityProperty.enumeration(AccountRecoveryRequestEntity, "status", expectedValues, unexpectedValues);
      assertEntityProperty.required(AccountRecoveryRequestEntity, "status");
    });

    it("validates created property", () => {
      assertEntityProperty.string(AccountRecoveryRequestEntity, "created");
      assertEntityProperty.dateTime(AccountRecoveryRequestEntity, "created");
      assertEntityProperty.notRequired(AccountRecoveryRequestEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(AccountRecoveryRequestEntity, "modified");
      assertEntityProperty.dateTime(AccountRecoveryRequestEntity, "modified");
      assertEntityProperty.notRequired(AccountRecoveryRequestEntity, "modified");
    });

    it("validates created_by property", () => {
      assertEntityProperty.uuid(AccountRecoveryRequestEntity, "created_by");
      assertEntityProperty.notRequired(AccountRecoveryRequestEntity, "created_by");
    });

    it("validates modified_by property", () => {
      assertEntityProperty.uuid(AccountRecoveryRequestEntity, "modified_by");
      assertEntityProperty.notRequired(AccountRecoveryRequestEntity, "modified_by");
    });
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
});
