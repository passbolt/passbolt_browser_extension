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

import each from "jest-each";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import AccountRecoveryOrganizationPublicKeyEntity from "./accountRecoveryOrganizationPublicKeyEntity";
import {
  alternativeAccountRecoveryOrganizationPublicKeyDto,
  createAccountRecoveryOrganizationPublicKeyDto,
  createAlternativeAccountRecoveryOrganizationPublicKeyDto,
  createRevokedAccountRecoveryOrganizationPublicKeyDto,
  defaultAccountRecoveryOrganizationPublicKeyDto,
  revokedAccountRecoveryOrganizationPublicKeyDto
} from "./accountRecoveryOrganizationPublicKeyEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("AccountRecoveryOrganizationPublicKey entity", () => {
  describe("AccountRecoveryOrganizationPublicKeyEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AccountRecoveryOrganizationPublicKeyEntity.ENTITY_NAME, AccountRecoveryOrganizationPublicKeyEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(AccountRecoveryOrganizationPublicKeyEntity, "id");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPublicKeyEntity, "id");
    });

    it("validates armored_key property", () => {
      assertEntityProperty.string(AccountRecoveryOrganizationPublicKeyEntity, "armored_key");
      assertEntityProperty.required(AccountRecoveryOrganizationPublicKeyEntity, "armored_key");
      assertEntityProperty.notNullable(AccountRecoveryOrganizationPublicKeyEntity, "armored_key");
    });

    it("validates fingerprint property", () => {
      const successScenarios = [
        {scenario: "with a valid fingerprint string", value: "ABCD".repeat(10)},
        {scenario: "with a null value", value: null},
      ];
      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
      ];
      assertEntityProperty.assert(AccountRecoveryOrganizationPublicKeyEntity, "fingerprint", successScenarios, failingScenarios, "type");
      assertEntityProperty.nullable(AccountRecoveryOrganizationPublicKeyEntity, "fingerprint");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPublicKeyEntity, "fingerprint");
    });

    it("validates created property", () => {
      assertEntityProperty.string(AccountRecoveryOrganizationPublicKeyEntity, "created");
      assertEntityProperty.dateTime(AccountRecoveryOrganizationPublicKeyEntity, "created");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPublicKeyEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(AccountRecoveryOrganizationPublicKeyEntity, "modified");
      assertEntityProperty.dateTime(AccountRecoveryOrganizationPublicKeyEntity, "modified");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPublicKeyEntity, "modified");
    });

    it("validates created_by property", () => {
      assertEntityProperty.uuid(AccountRecoveryOrganizationPublicKeyEntity, "created_by");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPublicKeyEntity, "created_by");
    });

    it("validates modified_by property", () => {
      assertEntityProperty.uuid(AccountRecoveryOrganizationPublicKeyEntity, "modified_by");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPublicKeyEntity, "modified_by");
    });

    it("validates deleted property", () => {
      assertEntityProperty.string(AccountRecoveryOrganizationPublicKeyEntity, "deleted");
      assertEntityProperty.dateTime(AccountRecoveryOrganizationPublicKeyEntity, "deleted");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPublicKeyEntity, "deleted");
    });
  });

  each([
    {scenario: "Create", dto: createAccountRecoveryOrganizationPublicKeyDto()},
    {scenario: "Read", dto: defaultAccountRecoveryOrganizationPublicKeyDto()},
    {scenario: "Create revoked", dto: createRevokedAccountRecoveryOrganizationPublicKeyDto()},
    {scenario: "Read revoked", dto: revokedAccountRecoveryOrganizationPublicKeyDto()},
    {scenario: "Create alternative", dto: createAlternativeAccountRecoveryOrganizationPublicKeyDto()},
    {scenario: "Read alternative", dto: alternativeAccountRecoveryOrganizationPublicKeyDto()},
  ]).describe("constructor works with data", _props => {
    it(`it supports scenario ${_props.scenario}`, () => {
      const entity = new AccountRecoveryOrganizationPublicKeyEntity(_props.dto);
      expect(entity.toJSON()).toEqual(_props.dto);
    });
  });
});

