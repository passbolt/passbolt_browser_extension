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

describe("Entity", () => {
  it("works with it's own copy of the props and not keep reference", () => {
    const dto = {a: 1, b: {c: 2}};
    const entity = new Entity(dto);
    dto.a = 3;
    dto.b.c = 4;
    expect(entity._props).toEqual({a: 1, b: {c: 2}});
  });

  it("returns a own copy and not reference", () => {
    const dto = {a: 1, b: {c: 2}};
    const entity = new Entity(dto);
    const apiDto = entity.toDto();
    apiDto.b.c = 3;
    expect(entity._props).toEqual({a: 1, b: {c: 2}});
    entity._props.b.c = 4;
    expect(apiDto).toEqual({a: 1, b: {c: 3}});
    expect(entity._props).toEqual({a: 1, b: {c: 4}});
  });

  it("stringify as dto", () => {
    const dto = {a: 1, b: {c: 2}};
    const entity = new Entity(dto);
    expect(JSON.stringify(entity)).toEqual(JSON.stringify(dto));
  });

  it("must retain null values", () => {
    const dto = {a: null};
    const entity = new Entity(dto);
    const apiDto = entity.toDto();
    expect(entity._props).toEqual(dto);
    expect(apiDto).toEqual(dto);
  });

  it("_normalizePropName must convert snake case to camel case", () => {
    expect(Entity._normalizePropName('test')).toBe('test');
    expect(Entity._normalizePropName('Test')).toBe('test');
    expect(Entity._normalizePropName('foreignKey')).toBe('foreign_key');
    expect(Entity._normalizePropName('foreignKeyId')).toBe('foreign_key_id');
    expect(Entity._normalizePropName('foreign_key_id')).toBe('foreign_key_id');
    expect(Entity._normalizePropName('CamelCase.StrikesAgain')).toBe('camel_case.strikes_again');
  });

  it("_hasProp works with dotted notation", () => {
    const entity = new Entity({
      'aco_foreign_key': 'truc',
      'gpgkey': {
        'bidule': 'ouaiouai',
        'users_groups': {
          'test': '1'
        }
      }
    });
    expect(entity._hasProp('aco_foreign')).toBe(false);
    expect(entity._hasProp('aco_foreign_key')).toBe(true);
    expect(entity._hasProp('acoForeignKey')).toBe(true);
    expect(entity._hasProp('gpgkey.bidule')).toBe(true);
    expect(entity._hasProp('gpgkey.truc')).toBe(false);
    expect(entity._hasProp('gpgkey.users_groups.test')).toBe(true);
    expect(entity._hasProp('gpgkey.usersGroups.test')).toBe(true);
    expect(entity._hasProp('gpgkey.nope.no')).toBe(false);
  });
});
