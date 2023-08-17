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

import HasUserPostponedUserSettingInvitationController from "./hasUserPostponedUserSettingInvitationController";
import PostponeUserSettingInvitationService from '../../service/invitation/postponeUserSettingInvitationService';

describe("HasUserPostponedUserSettingInvitationController", () => {
  it("can get the account recovery enrollment invitation status", () => {
    expect.assertions(2);
    const controller = new HasUserPostponedUserSettingInvitationController();
    const defaultValue = controller.exec();

    expect(defaultValue).toBe(false);

    PostponeUserSettingInvitationService.postponeAccountRecovery();

    const setValue = controller.exec();
    expect(setValue).toBe(true);
  });
});

