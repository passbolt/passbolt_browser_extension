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

import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import ExternalGpgKeyEntity from "../../model/entity/gpgkey/external/externalGpgKeyEntity";
import CheckPassphraseController from "./checkPassphraseController";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import Keyring from "../../model/keyring";

const mockFindPrivate = jest.spyOn(Keyring.prototype, "findPrivate");

describe("CheckPassphraseController", () => {
  it(`Should decrypt current user's key with the right passphrase`, () => {
    expect.assertions(1);
    mockFindPrivate.mockImplementation(() => new ExternalGpgKeyEntity({armored_key: pgpKeys.ada.private}));
    const controller = new CheckPassphraseController();
    const promise = controller.exec(pgpKeys.ada.passphrase);
    return expect(promise).resolves.not.toThrow();
  });

  it(`Should throw an exception if the given passphrase doesn't match the key`, async() => {
    expect.assertions(1);
    mockFindPrivate.mockImplementation(() => new ExternalGpgKeyEntity({armored_key: pgpKeys.ada.private}));
    const controller = new CheckPassphraseController();
    const promise = controller.exec("wrong passphrase");
    return expect(promise).rejects.toThrowError(new InvalidMasterPasswordError());
  });

  it(`Should throw an exception if no private key is found`, async() => {
    expect.assertions(1);
    mockFindPrivate.mockImplementation(() => null);
    const controller = new CheckPassphraseController();
    const promise = controller.exec("wrong passphrase");
    return expect(promise).rejects.toThrowError(new Error("Private key not found."));
  });
});
