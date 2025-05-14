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
 * @since         5.1.1
 */

import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";

class ShareMetadataPrivateKeysCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return MetadataPrivateKeyEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection use the same user ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection have a different metadata key ID.
   */
  constructor(dtos = [], options = {}) {
    super(dtos, options);
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */

  /**
   * Get metadata private keys collection schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": MetadataPrivateKeyEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @throws {EntityValidationError} If a metadata private key already exists with the same metdata_key_id.
   * @throws {EntityValidationError} If a metadata private key does not use the same user_id as the others.
   */
  validateBuildRules(item) {
    this.assertNotExist("metadata_key_id", item._props.metadata_key_id);
    this.assertSameUserId(item);
  }

  /**
   * Assert the collection is about the same user id.
   * @param {MetadataPrivateKeyEntity} item
   * @throws {EntityValidationError} if the given metadata private key use a different user_id.
   * @private
   */
  assertSameUserId(item) {
    if (this._items.length === 0) {
      return;
    }
    //Search for a different userId
    const hasDifferentUserId = this._items[0].userId !== item.userId;

    if (!hasDifferentUserId) {
      return;
    }

    const error = new EntityValidationError();
    error.addError("user_id", "same_user_id", "The collection should not contain different user ID.");
    throw error;
  }

  /**
   * Returns true if the collection has at least 1 decrypted metadata private key.
   * @returns {boolean}
   */
  hasDecryptedPrivateKeys() {
    return this._items.some(item => item.isDecrypted);
  }

  /**
   * Returns true if the collection has at least 1 encrypted metadata private key.
   * @returns {boolean}
   */
  hasEncryptedPrivateKeys() {
    return this._items.some(item => !item.isDecrypted);
  }
}

export default ShareMetadataPrivateKeysCollection;
