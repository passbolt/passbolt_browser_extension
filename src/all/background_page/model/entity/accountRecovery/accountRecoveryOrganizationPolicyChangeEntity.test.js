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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import AccountRecoveryOrganizationPolicyChangeEntity from "./accountRecoveryOrganizationPolicyChangeEntity";
import {
  changeToADisabledAccountRecoveryOrganizationPolicyDto,
  changeAnEnabledAccountRecoveryOrganizationPolicyTypeDto,
  changeToAndEnabledAccountRecoveryOrganizationPolicyDto,
  rotateAccountRecoveryOrganizationPolicyKeyDto
} from "./accountRecoveryOrganizationPolicyChangeEntity.test.data";

describe("AccountRecoveryOrganizationPolicyChange entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AccountRecoveryOrganizationPolicyChangeEntity.ENTITY_NAME, AccountRecoveryOrganizationPolicyChangeEntity.getSchema());
  });

  each([
    {scenario: "Change to a disabled policy", dto: changeToADisabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Change to an enabled policy", dto: changeToAndEnabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Change to another enabled policy type", dto: changeAnEnabledAccountRecoveryOrganizationPolicyTypeDto()},
    {scenario: "Rotate key only (without policy change)", dto: rotateAccountRecoveryOrganizationPolicyKeyDto()},
  ]).describe("constructor works with data", _props => {
    it(`it supports scenario: ${_props.scenario}`, () => {
      expect.assertions(1);
      const entity = new AccountRecoveryOrganizationPolicyChangeEntity(_props.dto);
      expect(entity.toJSON()).toEqual(_props.dto);
    });
  });

  it("constructor returns validation error if both policy and account_recovery_organization_public_key fields are missing", () => {
    expect.assertions(1);
    try {
      new AccountRecoveryOrganizationPolicyChangeEntity({});
    } catch (error) {
      expect(error).toStrictEqual(new EntityValidationError("AccountRecoveryOrganizationPolicyChangeEntity expects a policy or an account_recovery_organization_public_key set to be valid."));
    }
  });

  it("constructor returns validation error if policy is disabled and account_recovery_organization_public_key is set", () => {
    expect.assertions(1);
    const wrongDto = changeToAndEnabledAccountRecoveryOrganizationPolicyDto({policy: "disabled"});
    try {
      new AccountRecoveryOrganizationPolicyChangeEntity(wrongDto);
    } catch (error) {
      expect(error).toStrictEqual(new EntityValidationError("AccountRecoveryOrganizationPolicyChangeEntity expects not to have an account recovery organization public key if the policy type is disabled."));
    }
  });
});
