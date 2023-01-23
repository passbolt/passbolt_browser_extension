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
 * @since         3.10.0
 */

import PostponedUserSettingInvitationService from "../../service/api/invitation/postponedUserSettingInvitationService";
import HasUserPostponedUserSettingInvitationController from "./hasUserPostponedUserSettingInvitationController";

describe("hasUserPostponedUserSettingInvitationController", () => {
  it("can get the mfa enrollment invitation status", () => {
    expect.assertions(2);
    const controller = new HasUserPostponedUserSettingInvitationController();
    const defaultValue = controller.exec();

    expect(defaultValue).toBe(false);

    PostponedUserSettingInvitationService.postponeMFAPolicy();

    const setValue = controller.exec();
    expect(setValue).toBe(true);
  });
});

