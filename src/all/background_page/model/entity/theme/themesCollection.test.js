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
 * @since         5.7.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ThemeEntity from "./themeEntity";
import ThemesCollection from "./themesCollection";
import {defaultThemeDto, midgarThemeDto} from "./themeEntity.test.data";
import {defaultThemeCollectionDtos} from "./themesCollection.test.data";

describe("ThemesCollection", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ThemesCollection.name, ThemesCollection.getSchema());
    });
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);

      const collection = new ThemesCollection([]);

      expect(collection).toHaveLength(0);
    });

    it("works if valid minimal DTO is provided", () => {
      expect.assertions(3);

      const dto1 = defaultThemeDto();
      const dto2 = midgarThemeDto();
      const collection = new ThemesCollection([dto1, dto2]);

      expect(collection).toHaveLength(2);
      expect(collection.items[0].toDto()).toEqual(dto1);
      expect(collection.items[1].toDto()).toEqual(dto2);
    });

    it("works if valid complete entities are provided", () => {
      expect.assertions(5);

      const dtos = defaultThemeCollectionDtos();
      const entityDefault = new ThemeEntity(dtos[0]);
      const entityMidgar = new ThemeEntity(dtos[1]);
      const entitySolarised = new ThemeEntity(dtos[2]);
      const entitySolarisedDark = new ThemeEntity(dtos[3]);

      const collection = new ThemesCollection([entityDefault, entityMidgar, entitySolarised, entitySolarisedDark]);

      expect(collection).toHaveLength(4);
      expect(collection.items[0].name).toEqual(entityDefault.name);
      expect(collection.items[1].name).toEqual(entityMidgar.name);
      expect(collection.items[2].name).toEqual(entitySolarised.name);
      expect(collection.items[3].name).toEqual(entitySolarisedDark.name);
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);

      expect(() => new ThemesCollection({}))
        .toThrowEntityValidationError("items");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      expect.assertions(1);

      const dtos = [defaultThemeDto(), defaultThemeDto()];
      delete dtos[0].id;

      const collection = new ThemesCollection(dtos, {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(1);
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      expect.assertions(1);

      const dto1 = defaultThemeDto();
      const dto2 = midgarThemeDto({id: dto1.id});

      expect(() => new ThemesCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.id.unique");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      expect.assertions(1);

      const dto1 = defaultThemeDto();
      const dto2 = defaultThemeDto();

      expect(() => new ThemesCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.name.unique");
    });
  });
});
