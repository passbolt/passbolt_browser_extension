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
 * @since         5.13.0
 */

const PASSKEY_RESOURCE_TYPE_SLUG = "v5-passkey";
const METADATA_OBJECT_TYPE = "PASSBOLT_RESOURCE_METADATA";
const SECRET_OBJECT_TYPE = "PASSBOLT_SECRET_DATA";

/**
 * Persists provider passkeys as `v5-passkey` resources in the Passbolt vault.
 *
 * The relying party id and user name are stored (encrypted) in the resource metadata so the
 * vault shows "example.com — burak@example.com" and the extension can locate credentials by rpId;
 * the credential material lives in the encrypted secret.
 *
 * Collaborators are injected so the DTO construction is unit testable; the service worker wires the
 * real ResourceCreateService / ResourceTypeModel / passkey finder built from the active account.
 */
class PasskeyProviderStoreService {
  /**
   * @param {object} dependencies
   * @param {object} dependencies.resourceCreateService ResourceCreateService instance ({create(resourceDto, secretDto, passphrase)})
   * @param {object} dependencies.resourceTypeModel ResourceTypeModel instance ({getOrFindAll()})
   * @param {object} [dependencies.passkeyFinder] resolves stored passkeys by rpId ({findByRpId(rpId): Promise<Array>})
   */
  constructor({ resourceCreateService, resourceTypeModel, passkeyFinder = null }) {
    this.resourceCreateService = resourceCreateService;
    this.resourceTypeModel = resourceTypeModel;
    this.passkeyFinder = passkeyFinder;
  }

  /**
   * Persist a new passkey credential.
   * @param {object} passkey the credential fields (credential_id, rp_id, user_name, private_key, ...)
   * @param {string} passphrase the user passphrase (to encrypt the secret + metadata)
   * @returns {Promise<object>} the created resource entity
   */
  async save(passkey, passphrase) {
    const resourceTypeId = await this._resolvePasskeyResourceTypeId();
    const resourceDto = this.buildResourceDto(passkey, resourceTypeId);
    const secretDto = this.buildSecretDto(passkey);
    return this.resourceCreateService.create(resourceDto, secretDto, passphrase);
  }

  /**
   * Find the stored passkeys matching a relying party id (for excludeCredentials / assertions).
   * @param {string} rpId
   * @returns {Promise<Array>}
   */
  async findByRpId(rpId) {
    if (!this.passkeyFinder) {
      return [];
    }
    return this.passkeyFinder.findByRpId(rpId);
  }

  /**
   * Build the v5 resource DTO (metadata) for a passkey.
   * @param {object} passkey
   * @param {string} resourceTypeId
   * @returns {object}
   */
  buildResourceDto(passkey, resourceTypeId) {
    return {
      resource_type_id: resourceTypeId,
      metadata: {
        object_type: METADATA_OBJECT_TYPE,
        resource_type_id: resourceTypeId,
        name: passkey.rp_id,
        username: passkey.user_name ?? null,
        uris: [`https://${passkey.rp_id}`],
      },
    };
  }

  /**
   * Build the (plaintext) secret DTO for a passkey.
   * @param {object} passkey
   * @returns {object}
   */
  buildSecretDto(passkey) {
    return {
      object_type: SECRET_OBJECT_TYPE,
      passkey: {
        credential_id: passkey.credential_id,
        rp_id: passkey.rp_id,
        user_handle: passkey.user_handle ?? null,
        user_name: passkey.user_name ?? null,
        user_display_name: passkey.user_display_name ?? null,
        private_key: passkey.private_key,
        public_key: passkey.public_key ?? null,
        algorithm: passkey.algorithm,
        counter: passkey.counter ?? 0,
        discoverable: passkey.discoverable ?? true,
        created: passkey.created ?? null,
      },
    };
  }

  /**
   * Resolve the `v5-passkey` resource type id, or throw if the instance does not expose it.
   * @returns {Promise<string>}
   * @private
   */
  async _resolvePasskeyResourceTypeId() {
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    const resourceType = resourceTypes.getFirstBySlug(PASSKEY_RESOURCE_TYPE_SLUG);
    if (!resourceType) {
      throw new Error("The passkey resource type is not available on this Passbolt instance.");
    }
    return resourceType.id;
  }
}

export default PasskeyProviderStoreService;
