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
 * @since         6.0.0
 */
import { defaultTagDto, minimalTagDto } from "./tagEntity.test.data";

export const minimalTagsCollectionDto = () => {
  const dto1 = minimalTagDto({ slug: "tag1" });
  const dto2 = minimalTagDto({ slug: "tag2" });
  const dto3 = minimalTagDto({ slug: "tag3" });

  return [dto1, dto2, dto3];
};

export const defaultTagsCollectionDto = () => {
  const dto1 = defaultTagDto({ slug: "tag1" });
  const dto2 = defaultTagDto({ slug: "tag2" });
  const dto3 = defaultTagDto({ slug: "tag3" });

  return [dto1, dto2, dto3];
};

export const defaultTagsDtos = (count = 10, data = {}) => {
  const dtos = [];

  for (let i = 0; i < count; i++) {
    const dto = defaultTagDto({ slug: `tag ${i}`, ...data });
    dtos.push(dto);
  }

  return dtos;
};
