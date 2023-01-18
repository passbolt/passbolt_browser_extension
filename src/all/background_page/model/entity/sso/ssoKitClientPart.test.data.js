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
 * @since         3.9.0
 */
import {v4 as uuid} from "uuid";
import GenerateSsoIvService from "../../../service/crypto/generateSsoIvService";

export const clientSsoKit = (data = {}) => {
  const algorithm = {
    name: "AES-GCM",
    length: 256
  };
  const nek = new CryptoKey(algorithm, false, ["encrypt", "decrypt"]);
  return Object.assign({
    id: uuid(),
    secret: Buffer.from(JSON.stringify("Don't tell everybody, this is a secret")).toString('base64'),
    nek: nek,
    iv1: GenerateSsoIvService.generateIv(),
    iv2: GenerateSsoIvService.generateIv(),
    provider: "azure"
  }, data);
};
