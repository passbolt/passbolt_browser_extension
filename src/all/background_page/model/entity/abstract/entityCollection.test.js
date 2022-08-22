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
import Entity from "./entity";
import EntityCollection from "./entityCollection";
import EntitySchema from "./entitySchema";

/*
 * ===========================================
 *  Fixture classes
 * ===========================================
 */

class TestEntity extends Entity {
  constructor(dto) {
    super(EntitySchema.validate('TestEntity', dto, TestEntity.getSchema()));
  }
  get name() {
    return this._props.name;
  }
  static getSchema() {
    return {
      "type": "object",
      "required": ['name'],
      "properties": {
        "name": {
          "type": "string",
        }
      }
    };
  }
}

/* eslint-disable no-unused-vars */
class TestEntityCollection extends Entity {
  constructor(dto) {
    super(EntitySchema.validate('TestEntityCollection', dto, TestEntityCollection.getSchema()));
  }
  static getSchema() {
    return {
      "type": "array",
      "items": TestEntity.getSchema(),
    };
  }
}
/* eslint-enable no-unused-vars */

/*
 * ===========================================
 *  Tests
 * ===========================================
 */

describe("EntityCollection", () => {
  it("constructor and getters works", () => {
    const dto = [{name: 'first'}, {name: 'second'}, {name: 'first'}];
    const entities = [];
    entities.push(new TestEntity({name: 'first'}));
    entities.push(new TestEntity({name: 'second'}));
    entities.push(new TestEntity({name: 'first'}));

    const collection = new EntityCollection(dto, entities);
    expect(collection.items.length).toBe(3);
    expect(collection.toDto()).toEqual(dto);

    // Push
    collection.push(new TestEntity({name: 'fourth'}));
    expect(collection.items.length).toBe(4);
    expect(collection.items[0].name).toEqual('first');
    expect(collection.items[1].name).toEqual('second');
    expect(collection.items[2].name).toEqual('first');
    expect(collection.items[4]).toEqual(undefined);

    // Iterator tests
    for (const item of collection) {
      expect(item.name).toEqual('first');
      break;
    }

    // find all
    expect(collection.getAll('name', 'first').length).toBe(2);
    expect(collection.getAll('name', 'second').length).toBe(1);
    expect(collection.getAll('name', 'third').length).toBe(0);

    // find first
    expect(collection.getFirst('name', 'first').toDto()).toEqual({name: 'first'});
    expect(collection.getFirst('name', 'third')).toBe(undefined);
  });

  it("constructor and getters works with empty collection", () => {
    const collection = new EntityCollection([]);
    expect(collection.length).toBe(0);
    expect(collection.items).toEqual([]);
  });
});
