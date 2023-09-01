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

import PostponeUserSettingInvitationService from './postponeUserSettingInvitationService';

describe("PostponedUserSettingInvitation service", () => {
  it("Retrieve the right information for account recovery", async() => {
    expect.assertions(2);
    //Check that the default value is false
    expect(PostponeUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(false);

    PostponeUserSettingInvitationService.postponeAccountRecovery();
    expect(PostponeUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(true);
  });

  it("Retrieve the right information for mfa", async() => {
    expect.assertions(2);
    //Check that the default value is false
    expect(PostponeUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(false);

    PostponeUserSettingInvitationService.postponeMFAPolicy();
    expect(PostponeUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(true);
  });


  it("Should listen the event passbolt.auth.after-logout and reset the postpone the right information", async() => {
    expect.assertions(6);
    PostponeUserSettingInvitationService.reset();
    expect(PostponeUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(false);
    expect(PostponeUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(false);

    PostponeUserSettingInvitationService.postponeAccountRecovery();
    PostponeUserSettingInvitationService.postponeMFAPolicy();
    expect(PostponeUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(true);
    expect(PostponeUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(true);

    PostponeUserSettingInvitationService.reset();
    expect(PostponeUserSettingInvitationService.hasPostponedAccountRecovery()).toBe(false);
    expect(PostponeUserSettingInvitationService.hasPostponedMFAPolicy()).toBe(false);
  });
});
