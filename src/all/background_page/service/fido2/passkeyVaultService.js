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

import { v4 as uuidv4 } from "uuid";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourceCreateService from "../resource/create/resourceCreateService";
import ResourceUpdateService from "../resource/update/resourceUpdateService";
import FindSecretService from "../secret/findSecretService";
import DecryptAndParseResourceSecretService from "../secret/decryptAndParseResourceSecretService";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";

const V5_DEFAULT_SLUG = "v5-default";
const METADATA_OBJECT_TYPE = "PASSBOLT_RESOURCE_METADATA";
const SECRET_OBJECT_TYPE = "PASSBOLT_SECRET_DATA";
// A soft-deleted passkey is kept (recoverable) for this long, then purged the next time its resource
// secret is written.
const SOFT_DELETE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Reads and writes passkeys stored inside Passbolt resource secrets (the "attach" model): a resource
 * secret may carry a `passkeys` array alongside its password/totp. Also supports the legacy
 * standalone v5-passkey resource (single `passkey` object) for backward compatibility.
 */
class PasskeyVaultService {
  /**
   * @param {AccountEntity} account
   * @param {ApiClientOptions} apiClientOptions
   * @param {ProgressService} progressService
   */
  constructor(account, apiClientOptions, progressService) {
    this.account = account;
    this.apiClientOptions = apiClientOptions;
    this.progressService = progressService;
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.findSecretService = new FindSecretService(account, apiClientOptions);
  }

  /**
   * Resources (dtos from local storage) whose relying party matches the given rpId.
   * @param {string} rpId
   * @returns {Promise<Array>}
   */
  async findResourcesForRpId(rpId) {
    const resources = (await ResourceLocalStorage.get()) || [];
    return resources.filter((resource) => PasskeyVaultService._resourceMatchesRpId(resource, rpId));
  }

  /**
   * Create a brand new resource holding the passkey (v5-default with an empty password).
   * @param {object} passkey the credential material
   * @param {string} rpId
   * @param {string} passphrase
   * @returns {Promise<object>} created resource
   */
  async createResourceWithPasskey(passkey, rpId, passphrase) {
    const resourceTypeId = await this._resourceTypeIdBySlug(V5_DEFAULT_SLUG);
    const resourceDto = {
      resource_type_id: resourceTypeId,
      metadata: {
        object_type: METADATA_OBJECT_TYPE,
        resource_type_id: resourceTypeId,
        name: rpId,
        username: passkey.user_name ?? null,
        uris: [`https://${rpId}`],
      },
    };
    const secretDto = {
      object_type: SECRET_OBJECT_TYPE,
      password: "",
      passkeys: [PasskeyVaultService._withId(passkey)],
    };
    const service = new ResourceCreateService(this.account, this.apiClientOptions, this.progressService);
    return service.create(resourceDto, secretDto, passphrase);
  }

  /**
   * Attach a passkey to an existing resource (append to its secret's `passkeys` array).
   * @param {string} resourceId
   * @param {object} passkey
   * @param {string} passphrase
   * @returns {Promise<object>} updated resource
   */
  async attachPasskeyToResource(resourceId, passkey, passphrase) {
    const resource = await ResourceLocalStorage.getResourceById(resourceId);
    if (!resource) {
      throw new Error("The selected resource could not be found.");
    }
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const currentSecret = await this._decryptSecret(resource, privateKey);

    const secretDto = { ...currentSecret };
    if (!secretDto.object_type) {
      secretDto.object_type = SECRET_OBJECT_TYPE;
    }
    secretDto.passkeys = [...(currentSecret.passkeys || []), PasskeyVaultService._withId(passkey)];

    const resourceDto = {
      id: resource.id,
      resource_type_id: resource.resource_type_id,
      metadata: resource.metadata,
      folder_parent_id: resource.folder_parent_id ?? null,
    };
    const service = new ResourceUpdateService(this.account, this.apiClientOptions, this.progressService);
    return service.exec(resourceDto, secretDto, passphrase);
  }

  /**
   * Find all passkeys stored for a relying party, decrypting the matching resources.
   * @param {string} rpId
   * @param {string} passphrase
   * @returns {Promise<Array>} [{resource, passkey}]
   */
  async findPasskeysForRpId(rpId, passphrase) {
    const resources = await this.findResourcesForRpId(rpId);
    if (!resources.length) {
      return [];
    }
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const found = [];
    for (const resource of resources) {
      try {
        const secret = await this._decryptSecret(resource, privateKey);
        for (const passkey of PasskeyVaultService._extractPasskeys(secret)) {
          if (!passkey.deleted_at) {
            found.push({ resource, passkey });
          }
        }
      } catch {
        /* skip resources that cannot be decrypted / have no passkey */
      }
    }
    return found;
  }

  /**
   * Persist an updated signature counter for a passkey after an assertion (best effort).
   * @param {object} resource the resource dto the passkey belongs to
   * @param {string} credentialId
   * @param {number} counter
   * @param {string} passphrase
   * @returns {Promise<void>}
   */
  async updatePasskeyCounter(resource, credentialId, counter, passphrase) {
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const secret = await this._decryptSecret(resource, privateKey);
    const passkeys = PasskeyVaultService._extractPasskeys(secret);
    const target = passkeys.find((p) => p.credential_id === credentialId);
    if (!target) {
      return;
    }
    target.counter = counter;
    const secretDto = { ...secret };
    if (secret.passkeys) {
      secretDto.passkeys = passkeys;
    } else if (secret.passkey) {
      secretDto.passkey = passkeys[0];
    }
    const resourceDto = {
      id: resource.id,
      resource_type_id: resource.resource_type_id,
      metadata: resource.metadata,
      folder_parent_id: resource.folder_parent_id ?? null,
    };
    const service = new ResourceUpdateService(this.account, this.apiClientOptions, this.progressService);
    await service.exec(resourceDto, secretDto, passphrase);
  }

  /**
   * List the passkeys stored in a single resource (decrypting it).
   * @param {string} resourceId
   * @param {string} passphrase
   * @returns {Promise<Array>} passkey dtos
   */
  async listPasskeysInResource(resourceId, passphrase) {
    const resource = await ResourceLocalStorage.getResourceById(resourceId);
    if (!resource) {
      return [];
    }
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const secret = await this._decryptSecret(resource, privateKey);
    return PasskeyVaultService._extractPasskeys(secret).filter((passkey) => !passkey.deleted_at);
  }

  /**
   * Remove a single passkey from a resource secret, leaving the rest of the resource intact.
   * @param {string} resourceId
   * @param {string} credentialId
   * @param {string} passphrase
   * @returns {Promise<object>} updated resource
   */
  async removePasskeyFromResource(resourceId, credentialId, passphrase) {
    const resource = await ResourceLocalStorage.getResourceById(resourceId);
    if (!resource) {
      throw new Error("The resource could not be found.");
    }
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const secret = await this._decryptSecret(resource, privateKey);

    // Soft delete: mark the passkey deleted (recoverable) rather than dropping it, and purge any
    // passkeys that were soft-deleted more than the retention window ago.
    const deletedAt = new Date().toISOString();
    const secretDto = { ...secret };
    if (Array.isArray(secret.passkeys)) {
      secretDto.passkeys = secret.passkeys
        .map((passkey) =>
          (passkey.credential_id === credentialId || passkey.id === credentialId) && !passkey.deleted_at
            ? { ...passkey, deleted_at: deletedAt }
            : passkey,
        )
        .filter((passkey) => !PasskeyVaultService._isPurgeable(passkey));
    }
    if (secret.passkey && (secret.passkey.credential_id === credentialId || secret.passkey.id === credentialId)) {
      secretDto.passkey = { ...secret.passkey, deleted_at: deletedAt };
    }

    const resourceDto = {
      id: resource.id,
      resource_type_id: resource.resource_type_id,
      metadata: resource.metadata,
      folder_parent_id: resource.folder_parent_id ?? null,
    };
    const service = new ResourceUpdateService(this.account, this.apiClientOptions, this.progressService);
    return service.exec(resourceDto, secretDto, passphrase);
  }

  /**
   * @param {object} resource
   * @param {openpgp.PrivateKey} privateKey
   * @returns {Promise<object>} the decrypted secret dto
   * @private
   */
  async _decryptSecret(resource, privateKey) {
    const secret = await this.findSecretService.findByResourceId(resource.id);
    const secretSchema = await this.resourceTypeModel.getSecretSchemaById(resource.resource_type_id);
    const plaintext = await DecryptAndParseResourceSecretService.decryptAndParse(secret, secretSchema, privateKey);
    return plaintext.toDto();
  }

  /**
   * @param {string} slug
   * @returns {Promise<string>}
   * @private
   */
  async _resourceTypeIdBySlug(slug) {
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    const resourceType = resourceTypes.getFirstBySlug(slug);
    if (!resourceType) {
      throw new Error(`The ${slug} resource type is not available on this Passbolt instance.`);
    }
    return resourceType.id;
  }

  /**
   * Collect passkeys from a secret dto (attach-model array + legacy single object).
   * @param {object} secret
   * @returns {Array}
   * @private
   */
  static _extractPasskeys(secret) {
    const passkeys = Array.isArray(secret?.passkeys) ? [...secret.passkeys] : [];
    if (secret?.passkey) {
      passkeys.push(secret.passkey);
    }
    return passkeys;
  }

  /**
   * Whether a soft-deleted passkey is old enough to be purged for good.
   * @param {object} passkey
   * @returns {boolean}
   * @private
   */
  static _isPurgeable(passkey) {
    if (!passkey?.deleted_at) {
      return false;
    }
    const deletedAt = Date.parse(passkey.deleted_at);
    return !Number.isNaN(deletedAt) && Date.now() - deletedAt > SOFT_DELETE_RETENTION_MS;
  }

  /**
   * @param {object} resource
   * @param {string} rpId
   * @returns {boolean}
   * @private
   */
  static _resourceMatchesRpId(resource, rpId) {
    const metadata = resource?.metadata || {};
    if (metadata.name === rpId) {
      return true;
    }
    const uris = metadata.uris || [];
    return uris.some((uri) => uri === rpId || uri === `https://${rpId}` || PasskeyVaultService._hostOf(uri) === rpId);
  }

  /**
   * @param {string} uri
   * @returns {string|null}
   * @private
   */
  static _hostOf(uri) {
    try {
      return new URL(uri.includes("://") ? uri : `https://${uri}`).hostname;
    } catch {
      return null;
    }
  }

  /**
   * Ensure a passkey has a stable id for per-passkey management.
   * @param {object} passkey
   * @returns {object}
   * @private
   */
  static _withId(passkey) {
    return { id: passkey.id || uuidv4(), ...passkey };
  }
}

export default PasskeyVaultService;
