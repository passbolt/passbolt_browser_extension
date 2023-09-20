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
 * @since         4.3.0
 */

import GetUserPassphrasePoliciesController from "./getUserPassphrasePoliciesController";
import {defaultUserPassphrasePoliciesEntityDto} from "passbolt-styleguide/src/shared/models/userPassphrasePolicies/UserPassphrasePoliciesDto.test.data";
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";

describe("GetUserPassphrasePoliciesController", () => {
  it("Should return the user passphrase policies from the runtime memory", async() => {
    const runtimeMemory = {
      userPassphrasePolicies: new UserPassphrasePoliciesEntity(defaultUserPassphrasePoliciesEntityDto())
    };
    const controller = new GetUserPassphrasePoliciesController(null, null, runtimeMemory);

    expect.assertions(2);
    const accountRecoveryOrganizationPolicy = await controller.exec();
    expect(accountRecoveryOrganizationPolicy).toBeInstanceOf(UserPassphrasePoliciesEntity);
    expect(accountRecoveryOrganizationPolicy).toStrictEqual(runtimeMemory.userPassphrasePolicies);
  });

  it("Should return a default user passphrase policies if not defined on the runtime memory", async() => {
    const runtimeMemory = {};
    const controller = new GetUserPassphrasePoliciesController(null, null, runtimeMemory);

    expect.assertions(1);
    const userPassphrasePolicies = await controller.exec();
    expect(userPassphrasePolicies).toStrictEqual(UserPassphrasePoliciesEntity.createFromDefault());
  });
});
