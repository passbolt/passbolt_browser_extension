/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.7.0
 */
import InFormIntegrationSettingsEntity from "./inFormIntegrationSettingsEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("InFormIntegrationSettingsEntity", () => {
  describe("InFormIntegrationSettingsEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(
        InFormIntegrationSettingsEntity.ENTITY_NAME,
        InFormIntegrationSettingsEntity.getSchema(),
      );
    });
  });

  describe("InFormIntegrationSettingsEntity::constructor", () => {
    it("should accept a valid dto", () => {
      expect.assertions(1);
      const entity = new InFormIntegrationSettingsEntity({ isInFormMenuEnabled: false });
      expect(entity.isInFormMenuEnabled).toBe(false);
    });

    it("should throw if isInFormMenuEnabled is missing", () => {
      expect.assertions(1);
      expect(() => new InFormIntegrationSettingsEntity({})).toThrow();
    });

    it("should throw if isInFormMenuEnabled is not a boolean", () => {
      expect.assertions(1);
      expect(() => new InFormIntegrationSettingsEntity({ isInFormMenuEnabled: "yes" })).toThrow();
    });
  });

  describe("InFormIntegrationSettingsEntity::createDefault", () => {
    it("should default to the in-form menu being enabled", () => {
      expect.assertions(1);
      expect(InFormIntegrationSettingsEntity.createDefault().isInFormMenuEnabled).toBe(true);
    });
  });
});
