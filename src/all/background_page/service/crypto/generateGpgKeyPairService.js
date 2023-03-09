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

import ExternalGpgKeyPairEntity from "../../model/entity/gpgkey/external/externalGpgKeyPairEntity";
import * as openpgp from 'openpgp';
import AppEmailValidatorService from "../validator/appEmailValidatorService";
import IsEmailValidator from "passbolt-styleguide/src/shared/lib/Validator/IsEmailValidator";

class GenerateGpgKeyPairService {
  /**
   * Generate a gpg key pair.
   *
   * @param {GenerateGpgKeyPairOptionsEntity} generateGpgKeyPairOptionsEntity The gpg generation parameter
   * @return {Promise<ExternalGpgKeyPairEntity>}
   */
  static async generateKeyPair(generateGpgKeyPairOptionsEntity) {
    const openpgpGenerateKeyDto = Object.assign(generateGpgKeyPairOptionsEntity.toGenerateOpenpgpKeyDto(), {format: 'armored'});
    const shouldOverrideOpenPgpEmailValidation = GenerateGpgKeyPairService.shouldOverrideOpenPgpEmailValidation(generateGpgKeyPairOptionsEntity);

    if (shouldOverrideOpenPgpEmailValidation) {
      GenerateGpgKeyPairService.overrideOpenPgpEmailValidation();
    }

    const openpgpKeyPair = await openpgp.generateKey(openpgpGenerateKeyDto);

    return new ExternalGpgKeyPairEntity({
      public_key: {armored_key: openpgpKeyPair.publicKey},
      private_key: {armored_key: openpgpKeyPair.privateKey}
    });
  }

  /**
   * Check if the openpgp js email validation mechanism should be overridden.
   *
   * Why? In some rare cases, administrator want to use usernames which don't validate the email standard, and openpgpjs
   * doesn't allow the generation of new key which doesn't validate email standard.
   *
   * @param {GenerateGpgKeyPairOptionsEntity} generateGpgKeyPairOptionsEntity The gpg generation parameter
   * @returns {Promise<boolean>}
   */
  static async shouldOverrideOpenPgpEmailValidation(generateGpgKeyPairOptionsEntity) {
    const hasCustomEmailValidation = AppEmailValidatorService.hasCustomValidator();
    if (!hasCustomEmailValidation) {
      return false;
    }

    return !IsEmailValidator.validate(generateGpgKeyPairOptionsEntity.email);
  }

  /**
   * Override the openpgp email validation.
   * @return {void}
   */
  static overrideOpenPgpEmailValidation() {
    openpgp.UserIDPacket.fromObject = userID => {
      if ((typeof userID === 'string' || userID instanceof String) ||
        (userID.name && !(typeof userID.name === 'string' || userID.name instanceof String)) ||
        (userID.email && !AppEmailValidatorService.validate(userID.email)) ||
        (userID.comment && !(typeof userID.comment === 'string' || userID.comment instanceof String))) {
        throw new Error('Invalid user ID format');
      }
      const packet = new openpgp.UserIDPacket();
      Object.assign(packet, userID);
      const components = [];
      if (packet.name) { components.push(packet.name); }
      if (packet.comment) { components.push(`(${packet.comment})`); }
      if (packet.email) { components.push(`<${packet.email}>`); }
      packet.userID = components.join(' ');
      return packet;
    };
  }
}

export default GenerateGpgKeyPairService;
