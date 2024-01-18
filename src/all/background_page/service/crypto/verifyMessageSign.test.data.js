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

import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import SignMessageService from "./signMessageService";
import * as openpgp from 'openpgp';


export const defaultData = (data = {}) => Object.assign({
  message: 'text to sign',
  privateKey: pgpKeys.admin.private_decrypted
}, data);

export const signedMessage = async(data = {}) => {
  const {message, privateKey} = defaultData(data);
  const messageToSign = await openpgp.createMessage({text: message});
  const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(privateKey);

  const signedMessage = await SignMessageService.signMessage(messageToSign, [adminDecryptedKey]);

  return signedMessage;
};

export const signedClearMessage = async(data = {}) => {
  const {message, privateKey} = defaultData(data);
  const messageToSign = await openpgp.createCleartextMessage({text: message});
  const adminDecryptedKey = await OpenpgpAssertion.readKeyOrFail(privateKey);

  const signedClearMessage = await SignMessageService.signClearMessage(messageToSign, [adminDecryptedKey]);

  return signedClearMessage;
};
