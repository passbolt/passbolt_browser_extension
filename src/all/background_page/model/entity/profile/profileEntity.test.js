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
 * @since         2.13.0
 */
import {ProfileEntity} from "./ProfileEntity";
import {EntitySchema} from "../abstract/entitySchema";
import {EntityValidationError} from '../abstract/entityValidationError';
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Profile entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ProfileEntity.ENTITY_NAME, ProfileEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "2766ff6b-87f1-53a9-98fd-72cd32a3df69",
      "user_id": "54c6278e-f824-5fda-91ff-3e946b18d994",
      "first_name": "Dame Steve",
      "last_name": "Shirley"
    };
    const entity = new ProfileEntity(dto);
    expect(entity.toApiData()).toEqual(dto);
    expect(entity.firstName).toEqual('Dame Steve');
    expect(entity.lastName).toEqual('Shirley');
    expect(entity.created).toBe(null);
    expect(entity.modified).toBe(null);
    expect(entity.avatar).toBe(null);
  });

  it("constructor works if valid  DTO with avatar is provided", () => {
    const dto = {
      "id": "2766ff6b-87f1-53a9-98fd-72cd32a3df69",
      "user_id": "54c6278e-f824-5fda-91ff-3e946b18d994",
      "first_name": "Dame Steve",
      "last_name": "Shirley",
      "created": "2020-04-20T11:32:17+00:00",
      "modified": "2020-04-20T11:32:17+00:00",
      "avatar": {
        "id": "421f7955-74d0-42d4-838f-8b30d056bcc7",
        "user_id": "54c6278e-f824-5fda-91ff-3e946b18d994",
        "foreign_key": "2766ff6b-87f1-53a9-98fd-72cd32a3df69",
        "model": "Avatar",
        "filename": "dame steve.png",
        "filesize": 20676,
        "mime_type": "image\/png",
        "extension": "png",
        "hash": "f2695972b9009970ac85aae95f907693268cd249",
        "path": "Avatar\/d1\/f8\/f4\/421f795574d042d4838f8b30d056bcc7\/421f795574d042d4838f8b30d056bcc7.png",
        "adapter": "Local",
        "created": "2020-04-20T11:32:17+00:00",
        "modified": "2020-04-20T11:32:17+00:00",
        "url": {
          "medium": "img\/public\/Avatar\/d1\/f8\/f4\/421f795574d042d4838f8b30d056bcc7\/421f795574d042d4838f8b30d056bcc7.a99472d5.png",
          "small": "img\/public\/Avatar\/d1\/f8\/f4\/421f795574d042d4838f8b30d056bcc7\/421f795574d042d4838f8b30d056bcc7.65a0ba70.png"
        }
      }
    };
    const filtered = {
      "id": "2766ff6b-87f1-53a9-98fd-72cd32a3df69",
      "user_id": "54c6278e-f824-5fda-91ff-3e946b18d994",
      "first_name": "Dame Steve",
      "last_name": "Shirley",
      "created": "2020-04-20T11:32:17+00:00",
      "modified": "2020-04-20T11:32:17+00:00",
      "avatar": {
        "id": "421f7955-74d0-42d4-838f-8b30d056bcc7",
        "user_id": "54c6278e-f824-5fda-91ff-3e946b18d994",
        "created": "2020-04-20T11:32:17+00:00",
        "modified": "2020-04-20T11:32:17+00:00",
        "url": {
          "medium": "img\/public\/Avatar\/d1\/f8\/f4\/421f795574d042d4838f8b30d056bcc7\/421f795574d042d4838f8b30d056bcc7.a99472d5.png",
          "small": "img\/public\/Avatar\/d1\/f8\/f4\/421f795574d042d4838f8b30d056bcc7\/421f795574d042d4838f8b30d056bcc7.65a0ba70.png"
        }
      }
    };
    const filtered2 = {
      "id": "2766ff6b-87f1-53a9-98fd-72cd32a3df69",
      "user_id": "54c6278e-f824-5fda-91ff-3e946b18d994",
      "first_name": "Dame Steve",
      "last_name": "Shirley",
      "created": "2020-04-20T11:32:17+00:00",
      "modified": "2020-04-20T11:32:17+00:00"
    };

    const entity = new ProfileEntity(dto);
    expect(entity.toApiData({avatar:true})).toEqual(filtered);
    expect(entity.firstName).toEqual('Dame Steve');
    expect(entity.lastName).toEqual('Shirley');
    expect(entity.created).not.toBe(null);
    expect(entity.modified).not.toBe(null);
    expect(entity.avatar).not.toBe(null);

    expect(entity.toApiData()).toEqual(filtered2);
    expect(entity.avatar._hasProp('model')).toBe(false);
    expect(entity.avatar.urlMedium).toBe('img\/public\/Avatar\/d1\/f8\/f4\/421f795574d042d4838f8b30d056bcc7\/421f795574d042d4838f8b30d056bcc7.a99472d5.png');
    expect(entity.avatar.urlSmall).toBe('img\/public\/Avatar\/d1\/f8\/f4\/421f795574d042d4838f8b30d056bcc7\/421f795574d042d4838f8b30d056bcc7.65a0ba70.png');
  });

  it("constructor throws an exception if DTO is missing required field", () => {
    try {
      new ProfileEntity({"created": "2020-04-20T11:32:17+00:00"});
      expect(false).toBe(true);
    } catch(error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'required')).toBe(true);
      expect(error.hasError('user_id', 'required')).toBe(true);
      expect(error.hasError('first_name', 'required')).toBe(true);
      expect(error.hasError('last_name', 'required')).toBe(true);
    }
  });

  it("constructor throws an exception if DTO contains invalid field", () => {
    try {
      new ProfileEntity({
        "id": "🤷",
        "user_id": -0,
        "first_name": ["(ノಠ益ಠ)ノ"],
        "last_name": Array(257).join("¯\_(ツ)_/¯")
      });
      expect(false).toBe(true);
    } catch(error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
      expect(error.hasError('user_id', 'type')).toBe(true);
      expect(error.hasError('first_name', 'type')).toBe(true);
      expect(error.hasError('last_name', 'maxLength')).toBe(true);
    }
  });

});
