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

import GetKeyInfoController from "./getKeyInfoController";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {adaExternalPrivateGpgKeyEntityDto} from "../../model/entity/gpgkey/external/externalGpgKeyEntity.test.data";

describe("GetKeyInfoController", () => {
  it("Should return the key info.", async() => {
    expect.assertions(1);
    const controller = new GetKeyInfoController();
    const externalGpgKeyEntity = await controller.exec(pgpKeys.ada.private);
    const externalGpgKeyEntityDto = externalGpgKeyEntity.toDto();
    const expectedExternalGpgKeyEntityDto = adaExternalPrivateGpgKeyEntityDto();
    // @note openpgps transforms the armored key, don't compare the armored key.
    delete expectedExternalGpgKeyEntityDto.armored_key;
    delete externalGpgKeyEntityDto.armored_key;

    expect(externalGpgKeyEntityDto).toStrictEqual(expectedExternalGpgKeyEntityDto);
  });

  it("Should throw an error if no key is provided", async() => {
    expect.assertions(1);
    const controller = new GetKeyInfoController();
    const externalGpgKeyEntityPromise = controller.exec();
    await expect(externalGpgKeyEntityPromise).rejects.toThrowError("An armored key must be provided");
  });
});
