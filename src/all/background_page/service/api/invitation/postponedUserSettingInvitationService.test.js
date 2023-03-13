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

import PostponedUserSettingInvitationService from './postponedUserSettingInvitationService';

describe("PostponedUserSettingInvitation service", () => {
  it("Retrieve the right information for account recovery", async() => {
    expect.assertions(2);
    //Check that the default value is false
    expect(PostponedUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(false);

    PostponedUserSettingInvitationService.postponeAccountRecovery();
    expect(PostponedUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(true);
  });

  it("Retrieve the right information for mfa", async() => {
    expect.assertions(2);
    //Check that the default value is false
    expect(PostponedUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(false);

    PostponedUserSettingInvitationService.postponeMFAPolicy();
    expect(PostponedUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(true);
  });


  it("Should listen the event passbolt.auth.after-logout and reset the postpone the right information", async() => {
    expect.assertions(6);
    PostponedUserSettingInvitationService.reset();
    expect(PostponedUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(false);
    expect(PostponedUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(false);

    PostponedUserSettingInvitationService.postponeAccountRecovery();
    PostponedUserSettingInvitationService.postponeMFAPolicy();
    expect(PostponedUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(true);
    expect(PostponedUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(true);

    PostponedUserSettingInvitationService.reset();
    expect(PostponedUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(false);
    expect(PostponedUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(false);
  });
});
