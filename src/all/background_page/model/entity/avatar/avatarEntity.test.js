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
import {AvatarEntity} from "./avatarEntity";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Role entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AvatarEntity.ENTITY_NAME, AvatarEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    let dto = {
      "id":"ae1cd004-d1f6-4e7b-a3c7-3b28da81e9e8",
      "user_id":"597f24ea-a4cc-4d21-a24e-2181ac1f17ef",
      "foreign_key":"597f24ea-de28-4b96-9073-2181ac1f17ef",
      "model":"Avatar",
      "filename":"avatar.png",
      "filesize":102968,
      "mime_type":"image\/png",
      "extension":"png",
      "hash":"bc1cd004d1f64e7ba3c67b28da81e9e8",
      "path":"Avatar\/39\/71\/4b\/ae1cd004fff64e7ba3c73b384481e9e8\/bc1cd004d1f64e7ba3c67b28da81e9e8.png",
      "adapter":"Local",
      "created":"2020-03-26T11:14:02+00:00",
      "modified":"2020-03-26T11:14:02+00:00",
      "url": {
        "medium":"img\/public\/Avatar\/39\/71\/4b\/ae1cd004fff64e7ba3c73b384481e9e8\/bc1cd004d1f64e7ba3c67b28da81e9e8.a99472d5.png",
        "small":"img\/public\/Avatar\/39\/71\/4b\/ae1cd004fff64e7ba3c73b384481e9e8\/bc1cd004d1f64e7ba3c67b28da81e9e8.65a0ba70.png"
      },
    };
    let entity = new AvatarEntity(dto);
    expect(entity.id).toEqual('ae1cd004-d1f6-4e7b-a3c7-3b28da81e9e8');
    expect(entity.userId).toEqual('597f24ea-a4cc-4d21-a24e-2181ac1f17ef');
    expect(entity.urlMedium).toEqual('img/public/Avatar/39/71/4b/ae1cd004fff64e7ba3c73b384481e9e8/bc1cd004d1f64e7ba3c67b28da81e9e8.a99472d5.png');
    expect(entity.urlSmall).toEqual('img/public/Avatar/39/71/4b/ae1cd004fff64e7ba3c73b384481e9e8/bc1cd004d1f64e7ba3c67b28da81e9e8.65a0ba70.png');
    expect(entity.created).toEqual('2020-03-26T11:14:02+00:00');
    expect(entity.modified).toEqual('2020-03-26T11:14:02+00:00');
    expect(entity._hasProp('filesize')).toBe(false);
    expect(entity._hasProp('model')).toBe(false);
    expect(entity._hasProp('mime_type')).toBe(false);
    expect(entity._hasProp('hash')).toBe(false);
    expect(entity._hasProp('filesize')).toBe(false);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {

  });

  it("constructor returns validation error if dto required fields are missing", () => {

  });

  it("constructor returns validation error if dto fields are invalid", () => {

  });
});
