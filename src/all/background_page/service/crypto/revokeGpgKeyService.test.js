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
import RevokeGpgKeyService from "./revokeGpgKeyService";
import {pgpKeys} from '../../../../../test/fixtures/pgpKeys/keys';
import {OpenpgpAssertion} from '../../utils/openpgp/openpgpAssertions';
import GetGpgKeyInfoService from "./getGpgKeyInfoService";

describe("RevokeGpgKey service", () => {
  it("should generate a revoked public key given a decrypted private key", async() => {
    expect.assertions(4);

    const bettyPrivateGpgKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

    const validPublicKey = bettyPrivateGpgKey.toPublic();
    const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(validPublicKey);
    expect(publicKeyInfo.private).toBe(false);
    expect(publicKeyInfo.revoked).toBe(false);

    const revokedPublicKey = await RevokeGpgKeyService.revoke(bettyPrivateGpgKey);
    const revokedKeyInfo =  await GetGpgKeyInfoService.getKeyInfo(revokedPublicKey);
    expect(revokedKeyInfo.private).toBe(false);
    expect(revokedKeyInfo.revoked).toBe(true);
  });
});
