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
 * @since         5.13.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import LocalStorageMetadataEntity from "./localStorageMetadataEntity";
import { defaultLocalStorageMetadataDto } from "./localStorageMetadataEntity.test.data";

describe("LocalStorageMetadata", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(LocalStorageMetadataEntity.name, LocalStorageMetadataEntity.getSchema());
    });

    it("validates last_updated property", () => {
      assertEntityProperty.string(LocalStorageMetadataEntity, "last_updated");
      assertEntityProperty.dateTime(LocalStorageMetadataEntity, "last_updated");
      assertEntityProperty.required(LocalStorageMetadataEntity, "last_updated");
    });
  });

  describe("::constructor", () => {
    it("constructor works if valid DTO is provided", () => {
      expect.assertions(1);
      const dto = defaultLocalStorageMetadataDto();
      const entity = new LocalStorageMetadataEntity(dto);

      expect(entity._props.last_updated).toStrictEqual(dto.last_updated);
    });
  });

  describe("::last_updated", () => {
    it("get last_updated property value", () => {
      expect.assertions(1);
      const last_updated = "2024-10-05T12:10:00+00:00";
      const entity = new LocalStorageMetadataEntity(defaultLocalStorageMetadataDto({ last_updated }));
      expect(entity.lastUpdated).toStrictEqual(last_updated);
    });
  });
});
