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
import Entity from "../abstract/entity";

class EntityCollection extends Entity {
  /**
   * EntityCollection constructor
   * @param {array} props
   * @param {array} [items] optional
   */
  constructor(props, items) {
    super(props);
    if (items) {
      this._props = null;
      this._items = items;
    } else {
      this._items = [];
    }
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   *
   * @returns {*}
   */
  toDto() {
    return JSON.parse(JSON.stringify(this._items));
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters and setters
   * ==================================================
   */
  /**
   * Get all items references
   * @returns {Array} items
   */
  get items() {
    return this._items;
  }

  /**
   * Get items size
   * @returns {number}
   */
  get length() {
    return this._items.length;
  }

  /**
   * Make collections iterable
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
   *
   * @returns {Object} conforming to the iterator protocol.
   */
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => {
        if (i < this._items.length) {
          return {value: this._items[i++], done: false};
        } else {
          return {done: true};
        }
      }
    };
  }

  /**
   * Find all the items matching search string for a given prop
   *
   * @param {string} propName
   * @param {string} search
   * @throws TypeError if parameters are invalid
   * @returns {array} all the items matching search
   */
  getAll(propName, search) {
    if (typeof propName !== 'string' || typeof search !== 'string') {
      throw new TypeError('EntityCollection find by expect propName and search to be strings');
    }
    return this._items.filter(item => (Object.prototype.hasOwnProperty.call(item._props, propName) && item._props[propName] === search));
  }

  /**
   * Get all items matching a given id
   *
   * @param {string} propName
   * @param {string} search
   * @returns {Entity} first item matching search
   */
  getFirst(propName, search) {
    if (typeof propName !== 'string' || typeof search !== 'string') {
      throw new TypeError('EntityCollection getFirst by expect propName and search to be strings');
    }
    const found = this.getAll(propName, search);
    if (!found || !found.length) {
      return undefined;
    }
    return found[0];
  }

  /**
   * Push an item in the list
   * @param {*} item
   * @returns {int} new length of collection
   */
  push(item) {
    this._items.push(item);
    return this._items.length;
  }

  /**
   * Add an item at the beggining of the list
   * @param {*} item
   * @returns {int} new length of collection
   */
  unshift(item) {
    this._items.unshift(item);
    return this._items.length;
  }
}

export default EntityCollection;
