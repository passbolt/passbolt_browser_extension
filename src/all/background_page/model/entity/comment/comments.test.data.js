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
 * @since         3.8.0
 */

import {v4 as uuidv4} from "uuid";

const foreingModel = "Resource";

export const commentsMockDto = () => {
  const foreignKey = uuidv4();
  const comment1 = {
    "id": uuidv4(),
    "user_id": uuidv4(),
    "foreign_key": foreignKey,
    "foreign_model": foreingModel,
    "content": "comment1"
  };
  const comment2 = {
    "id": uuidv4(),
    "user_id": uuidv4(),
    "foreign_key": foreignKey,
    "foreign_model": foreingModel,
    "content": "comment2"
  };
  return [comment1, comment2];
};

export const commentCreationMock = () => ({
  "user_id": uuidv4(),
  "foreign_key": uuidv4(),
  "foreign_model": foreingModel,
  "content": "comment3"
});

export const commentResponseMock = creationMock => Object.assign({id: uuidv4()}, creationMock);
