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
 * @since         5.14.0
 */
import PasskeyKitService from "./passkeyKitService";
import PasskeyKitClientPartEntity from "../../model/entity/passkey/passkeyKitClientPartEntity";

describe("PasskeyKitService", () => {
  it("round-trips the passphrase through both halves of the kit", async () => {
    expect.assertions(5);
    const passphrase = "this is a secret passphrase";
    const credentialId = "abc-credential-id";

    const { clientPart, serverKitKey } = await PasskeyKitService.generateKit(passphrase, credentialId);

    expect(clientPart).toBeInstanceOf(PasskeyKitClientPartEntity);
    expect(clientPart.credentialId).toBe(credentialId);
    expect(typeof serverKitKey).toBe("string");
    expect(serverKitKey.length).toBeGreaterThan(0);

    // Recovering with BOTH halves yields the original passphrase.
    const recovered = await PasskeyKitService.recoverPassphrase(clientPart, serverKitKey);
    expect(recovered).toBe(passphrase);
  });

  it("fails to recover with a mismatched server half", async () => {
    expect.assertions(1);
    const { clientPart } = await PasskeyKitService.generateKit("passphrase-A", "cred-1");
    const { serverKitKey: otherServerKey } = await PasskeyKitService.generateKit("passphrase-B", "cred-2");

    // The server half from another kit must not decrypt this client half.
    await expect(PasskeyKitService.recoverPassphrase(clientPart, otherServerKey)).rejects.toThrow();
  });

  it("keeps the client half non-extractable and refuses plain-text serialization", async () => {
    expect.assertions(2);
    const { clientPart } = await PasskeyKitService.generateKit("passphrase", "cred");

    expect(clientPart.nek.extractable).toBe(false);
    expect(() => clientPart.toDto()).toThrow();
  });
});
