/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

const {AccountRecoveryOrganizationPolicyEntityBuilder} = require("./accountRecoveryOrganizationPolicyEntityBuilder");
const {AccountRecoveryOrganizationPolicyEntity} = require("./accountRecoveryOrganizationPolicyEntity");
const {AccountRecoveryPrivateKeyPasswordsCollection} = require('./accountRecoveryPrivateKeyPasswordsCollection');
const {data} = require('./accountRecoveryOrganizationPolicyEntityBuilder.test.data');

describe("AccountRecoveryOrganizationPolicyEntity builder", () => {
  it("should build an AccountRecoveryOrganizationPolicyEntity with the minimum information required", async() => {
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.disabled);
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.disabled);
    const builder = new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy);
    const builtEntity = builder.build();

    expect.assertions(1);
    expect(builtEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(newOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS));
  });

  it("should build an AccountRecoveryOrganizationPolicyEntity with a revoked ORK", async() => {
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.disabled);
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);

    const builtEntity = (new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy))
      .withCurrentORKRevoked(data.mockedPublicKey)
      .build();

    expect.assertions(1);
    const expectedResult = {
      ...newOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS),
      account_recovery_organization_revoked_key: {
        armored_key: data.mockedPublicKey
      }
    };
    expect(builtEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(expectedResult);
  });

  it("should build an AccountRecoveryOrganizationPolicyEntity with a signed ORK", async() => {
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.disabled);

    const builtEntity = (new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy))
      .withNewORKSigned(data.mockedPublicKey)
      .build();

    expect.assertions(1);
    const expectedResult = {
      ...newOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS),
      account_recovery_organization_public_key: {
        armored_key: data.mockedPublicKey
      }
    };
    expect(builtEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(expectedResult);
  });

  it("should build an AccountRecoveryOrganizationPolicyEntity with a new signed ORK and a current revoked ORK", async() => {
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithIreneKey);

    const builtEntity = (new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy))
      .withNewORKSigned("----BEGIN PGP PUBLIC KEY BLOCK-----")
      .withCurrentORKRevoked("----BEGIN PGP PUBLIC KEY BLOCK-----")
      .withPrivateKeyPasswordCollection(new AccountRecoveryPrivateKeyPasswordsCollection([]))
      .build();

    expect.assertions(1);
    const expectedResult = {
      ...newOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS),
      account_recovery_organization_public_key: {
        armored_key: data.mockedPublicKey
      },
      account_recovery_organization_revoked_key: {
        armored_key: data.mockedPublicKey
      }
    };

    expect(builtEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(expectedResult);
  });

  it("should not required neither a new signed ORK nor a current revoked ORK if policy didn't change", async() => {
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);

    const builtEntity = (new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy))
      .build();

    expect.assertions(1);
    expect(builtEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(newOrganizationPolicy.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS));
  });

  it("should throw an exception if no signed ORK is provied when it's required", async() => {
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.disabled);
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);

    expect.assertions(1);
    try {
      (new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy)).build();
    } catch (error) {
      expect(error).toEqual(new Error("No signing key provided while it is required to sign the new ORK."));
    }
  });

  it("should throw an exception if no revoked ORK is provied when it's required", async() => {
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.disabled);

    expect.assertions(1);
    try {
      (new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy)).build();
    } catch (error) {
      expect(error).toEqual(new Error("The ORK changed so it is required to provide the revoked version of the current ORK."));
    }
  });

  it("should throw an exception if no private key passwords are provied when they are required", async() => {
    const currentOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithIreneKey);
    const newOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(data.policies.optinWithAdaKey);

    expect.assertions(1);
    try {
      (new AccountRecoveryOrganizationPolicyEntityBuilder(newOrganizationPolicy, currentOrganizationPolicy))
        .withNewORKSigned("----BEGIN PGP PUBLIC KEY BLOCK-----")
        .withCurrentORKRevoked("----BEGIN PGP PUBLIC KEY BLOCK-----")
        .build();
    } catch (error) {
      expect(error).toEqual(new Error("The ORK changed so it is required to process for a private key passwords collection rekeying, no colletion provided."));
    }
  });
});
