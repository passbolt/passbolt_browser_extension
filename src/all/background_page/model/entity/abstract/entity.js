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
class Entity {
  /**
   * Entity constructor
   * @param {*} props
   */
  constructor(props) {
    this._props = JSON.parse(JSON.stringify(props));
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   * @returns {*}
   */
  toDto() {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this._props;
  }

  /*
   * ==================================================
   * Private
   * ==================================================
   */
  /**
   * Return true if object property is set
   *
   * @param {string} propName
   * @returns {boolean}
   * @private one should not access props directly
   */
  _hasProp(propName) {
    if (!propName.includes('.')) {
      const normalizedPropName = Entity._normalizePropName(propName);
      return Object.prototype.hasOwnProperty.call(this._props, normalizedPropName);
    }
    try {
      this._getPropByPath(propName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Access object props using dot notation
   *
   * @param {string} path
   * @returns {*} sub props
   * @throws {Error} if no props can be found on given path
   * @private one should not access props directly
   */
  _getPropByPath(path) {
    const normalizedPath = Entity._normalizePropName(path);
    return normalizedPath.split('.').reduce((obj, i) => {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        return obj[i];
      }
      throw new Error();
    }, this._props);
  }

  /**
   * Normalize camel cased name to snake case
   *
   * @param {string} name for example foreign_key
   * @returns {string} name for example foreignKey
   * @private
   */
  static _normalizePropName(name) {
    return name
      .replace(/([A-Z])/g,  (x, y) => `_${y.toLowerCase()}`) // add underscore where is a cap
      .replace(/\._/, ".") // remove leading underscore in front of dots
      .replace(/^_/, "") // remove leading underscore
      .replace(/^\./, ""); // remove leading dots
  }
}

export default Entity;
