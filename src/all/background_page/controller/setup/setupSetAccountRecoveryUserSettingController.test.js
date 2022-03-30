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

import {enableFetchMocks} from "jest-fetch-mock";
import {SetupSetAccountRecoveryUserSettingController} from "./setupSetAccountRecoveryUserSettingController";
import {SetupEntity} from "../../model/entity/setup/setupEntity";
import {AccountRecoveryUserSettingEntity} from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import {step2SetupUserGpgKeyDto} from "../../model/entity/setup/SetupEntity.test.data";
import {
  createAcceptedAccountRecoveryUserSettingDto,
  createRejectedAccountRecoveryUserSettingDto
} from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity.test.data";

jest.mock("../passphrase/passphraseController.js");

beforeEach(async() => {
  jest.resetModules();
  enableFetchMocks();
  fetch.resetMocks();
});

describe("SetupSetAccountRecoveryUserSettingController", () => {
  describe("SetupSetAccountRecoveryUserSettingController::exec", () => {
    it("Should save a rejected account recovery user setting.", async() => {
      const setupEntity = new SetupEntity(step2SetupUserGpgKeyDto());
      const controller = new SetupSetAccountRecoveryUserSettingController(null, null, setupEntity);
      const accountRecoveryUserSettingDto = createRejectedAccountRecoveryUserSettingDto({user_id: setupEntity.userId});
      await controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(1);
      const savedAccountRecoveryUserSettingDto = setupEntity.accountRecoveryUserSetting.toDto(AccountRecoveryUserSettingEntity.ALL_CONTAIN_OPTIONS);
      await expect(savedAccountRecoveryUserSettingDto).toEqual(accountRecoveryUserSettingDto);
    });

    it("Should save an approved account recovery user setting.", async() => {
      const setupEntity = new SetupEntity(step2SetupUserGpgKeyDto());
      const controller = new SetupSetAccountRecoveryUserSettingController(null, null, setupEntity);
      const accountRecoveryUserSettingDto = createAcceptedAccountRecoveryUserSettingDto({user_id: setupEntity.userId});
      await controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(5);
      expect(setupEntity.accountRecoveryUserSetting).toBeInstanceOf(AccountRecoveryUserSettingEntity);
      expect(setupEntity.accountRecoveryUserSetting.status).toEqual(AccountRecoveryUserSettingEntity.STATUS_APPROVED);
      expect(setupEntity.accountRecoveryUserSetting.accountRecoveryPrivateKey).not.toBeUndefined();
      expect(setupEntity.accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).not.toBeUndefined();
      expect(setupEntity.accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).toHaveLength(1);
    });
  });
});
