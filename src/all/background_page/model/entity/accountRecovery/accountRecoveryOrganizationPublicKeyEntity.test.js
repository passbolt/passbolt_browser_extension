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
import AccountRecoveryOrganizationPublicKeyEntity from "./accountRecoveryOrganizationPublicKeyEntity";
import {
  alternativeAccountRecoveryOrganizationPublicKeyDto,
  createAccountRecoveryOrganizationPublicKeyDto,
  createAlternativeAccountRecoveryOrganizationPublicKeyDto,
  createRevokedAccountRecoveryOrganizationPublicKeyDto,
  defaultAccountRecoveryOrganizationPublicKeyDto,
  revokedAccountRecoveryOrganizationPublicKeyDto
} from "./accountRecoveryOrganizationPublicKeyEntity.test.data";

describe("AccountRecoveryOrganizationPublicKey entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AccountRecoveryOrganizationPublicKeyEntity.ENTITY_NAME, AccountRecoveryOrganizationPublicKeyEntity.getSchema());
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

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        armored_key: {required: 'The armored_key is required.'},
      });
    }
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'id': 'not-valid-uuid'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'armored_key': 42});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('armored_key', 'type')).toBe(true);
    }
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'fingerprint': 'not-valid-fingerprint'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('fingerprint', 'type')).toBe(true);
    }
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'created': 'not-valid-date'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('created', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'modified': 'not-valid-date'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('modified', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'created_by': 'not-valid-uuid'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('created_by', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'modified_by': 'not-valid-uuid'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('modified_by', 'format')).toBe(true);
    }
    try {
      new AccountRecoveryOrganizationPublicKeyEntity({'deleted': 'not-valid-date'});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('deleted', 'format')).toBe(true);
    }
  });
});

