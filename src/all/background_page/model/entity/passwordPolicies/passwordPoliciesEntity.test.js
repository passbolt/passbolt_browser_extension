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

import EntitySchema from "../abstract/entitySchema";
import PasswordPoliciesEntity from './passwordPoliciesEntity';
import {defaultPasswordPolicies} from './passwordPoliciesEntity.test.data';
import EntityValidationError from '../abstract/entityValidationError';

describe("Password policies settings entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PasswordPoliciesEntity.ENTITY_NAME, PasswordPoliciesEntity.getSchema());
  });

  it("constructor works if valid DTO is provided", () => {
    const dto = defaultPasswordPolicies();
    const entity = new PasswordPoliciesEntity(dto);

    expect(entity.policyPassphraseEntropy).toEqual(dto.policy_passphrase_entropy);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new PasswordPoliciesEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('policy_passphrase_entropy', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if policy_passphrase_entropy is not part of the accepted value", () => {
    try {
      const dto = defaultPasswordPolicies({policy_passphrase_entropy: 3});
      console.log(dto);
      new PasswordPoliciesEntity(dto);
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('policy_passphrase_entropy', 'enum')).toBe(true);
    }
  });
});
