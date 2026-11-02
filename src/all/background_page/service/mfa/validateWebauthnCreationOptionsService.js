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
 * @since         5.17.0
 */
import WebauthnCeremonyError from "../../error/webauthnCeremonyError";
import WebauthnCredentialCreationOptionsEntity from "../../model/entity/mfa/webauthnCredentialCreationOptionsEntity";

/**
 * Checks the creation options received from the API against the local account before they reach the browser.
 * The shape of the options is guaranteed by WebauthnCredentialCreationOptionsEntity.
 */
class ValidateWebauthnCreationOptionsService {
  /**
   * @param {WebauthnCredentialCreationOptionsEntity} options
   * @param {AccountEntity} account
   * @throws {WebauthnCeremonyError} on the first failing check
   */
  static validate(options, account) {
    const expectedRpId = new URL(account.domain).hostname;
    if (options.rp.id !== expectedRpId) {
      throw new WebauthnCeremonyError(`The relying party id "${options.rp.id}" does not match the account domain.`);
    }
    if (options.user.name !== account.username) {
      throw new WebauthnCeremonyError("The user name does not match the account username.");
    }
    if (WebauthnCredentialCreationOptionsEntity.decodeBase64Url(options.user.id) !== account.userId) {
      throw new WebauthnCeremonyError("The user id does not match the account user id.");
    }
  }
}

export default ValidateWebauthnCreationOptionsService;
