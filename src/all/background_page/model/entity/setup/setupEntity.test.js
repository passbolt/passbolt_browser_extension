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
 */
import {EntitySchema} from "../abstract/entitySchema";
import {EntityValidationError} from "../abstract/entityValidationError";
import Validator from 'validator';
import {SetupEntity} from "./setupEntity";

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Setup entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SetupEntity.ENTITY_NAME, SetupEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "token": "10801423-4151-42a4-99d1-86e66145a08c",
      "domain": "https://cloud.passbolt.local/acme",
    };

    const entity = new SetupEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new SetupEntity({});
      expect(true).toBeFalsy();
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('user_id', 'required')).toBe(true);
      expect(error.hasError('token', 'required')).toBe(true);
      expect(error.hasError('domain', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new SetupEntity({
        "user_id": "🏆‍️",
        "token": "🏆‍️",
        "domain": true
      });
      expect(false).toBe(true);
    } catch(error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        user_id: { format: 'The user_id is not a valid uuid.' },
        token: { format: 'The token is not a valid uuid.' },
        domain: { type: 'The domain is not a valid string.' }
      });
    }
  });

  it("createFromUrl parse an url and create a setup entity", () => {
    const url = "https://cloud.passbolt.local/acme/setup/install/d57c10f5-639d-5160-9c81-8a0c6c4ec856/10801423-4151-42a4-99d1-86e66145a08c";
    const setupEntity = SetupEntity.createFromUrl(url);
    expect(setupEntity.domain).toEqual("https://cloud.passbolt.local/acme");
    expect(setupEntity.userId).toEqual("d57c10f5-639d-5160-9c81-8a0c6c4ec856");
    expect(setupEntity.token).toEqual("10801423-4151-42a4-99d1-86e66145a08c");
  });

  it("createFromUrl throws an error if it cannot parse the url", () => {
    const url = "https://cloud.passbolt.local/acme/d57c10f5-639d-5160-9c81-8a0c6c4ec856/10801423-4151-42a4-99d1-86e66145a08c";
    try {
      const setupEntity = SetupEntity.createFromUrl(url);
      expect(true).toBeFalsy();
    } catch(error) {
      expect(false).toBeFalsy();
    }
  });
});
