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

import PasskeyProviderStoreService from "./passkeyProviderStoreService";

const PASSKEY_TYPE_ID = "11111111-1111-1111-1111-111111111111";

const buildStore = (overrides = {}) => {
  const resourceCreateService = {
    create: jest.fn(async (resourceDto) => ({ id: "created", ...resourceDto })),
    ...overrides.resourceCreateService,
  };
  const resourceTypeModel = {
    getOrFindAll: jest.fn(async () => ({
      getFirstBySlug: (slug) => (slug === "v5-passkey" ? { id: PASSKEY_TYPE_ID } : null),
    })),
    ...overrides.resourceTypeModel,
  };
  const service = new PasskeyProviderStoreService({
    resourceCreateService,
    resourceTypeModel,
    passkeyFinder: overrides.passkeyFinder,
  });
  return { service, resourceCreateService, resourceTypeModel };
};

const samplePasskey = (data = {}) => ({
  credential_id: "AQIDBA",
  rp_id: "example.com",
  user_handle: "dXNlcg",
  user_name: "burak@example.com",
  user_display_name: "Burak",
  private_key: "cGsxMg",
  public_key: "cHViMTI",
  algorithm: -7,
  counter: 0,
  discoverable: true,
  ...data,
});

describe("PasskeyProviderStoreService", () => {
  describe("::buildResourceDto", () => {
    it("maps the relying party into v5 metadata", () => {
      const { service } = buildStore();
      const dto = service.buildResourceDto(samplePasskey(), PASSKEY_TYPE_ID);
      expect(dto.resource_type_id).toStrictEqual(PASSKEY_TYPE_ID);
      expect(dto.metadata.object_type).toStrictEqual("PASSBOLT_RESOURCE_METADATA");
      expect(dto.metadata.resource_type_id).toStrictEqual(PASSKEY_TYPE_ID);
      expect(dto.metadata.name).toStrictEqual("example.com");
      expect(dto.metadata.username).toStrictEqual("burak@example.com");
      expect(dto.metadata.uris).toStrictEqual(["https://example.com"]);
    });
  });

  describe("::buildSecretDto", () => {
    it("wraps the credential material in a PASSBOLT_SECRET_DATA envelope", () => {
      const { service } = buildStore();
      const secret = service.buildSecretDto(samplePasskey());
      expect(secret.object_type).toStrictEqual("PASSBOLT_SECRET_DATA");
      expect(secret.passkey.credential_id).toStrictEqual("AQIDBA");
      expect(secret.passkey.private_key).toStrictEqual("cGsxMg");
      expect(secret.passkey.algorithm).toStrictEqual(-7);
      expect(secret.passkey.counter).toStrictEqual(0);
      expect(secret.passkey.discoverable).toStrictEqual(true);
    });

    it("defaults optional fields", () => {
      const { service } = buildStore();
      const secret = service.buildSecretDto({
        credential_id: "a",
        rp_id: "example.com",
        private_key: "b",
        algorithm: -7,
      });
      expect(secret.passkey.counter).toStrictEqual(0);
      expect(secret.passkey.discoverable).toStrictEqual(true);
      expect(secret.passkey.user_handle).toBeNull();
    });
  });

  describe("::save", () => {
    it("creates a v5-passkey resource with the built dtos and passphrase", async () => {
      const { service, resourceCreateService } = buildStore();
      await service.save(samplePasskey(), "passphrase-123");

      expect(resourceCreateService.create).toHaveBeenCalledTimes(1);
      const [resourceDto, secretDto, passphrase] = resourceCreateService.create.mock.calls[0];
      expect(resourceDto.resource_type_id).toStrictEqual(PASSKEY_TYPE_ID);
      expect(resourceDto.metadata.name).toStrictEqual("example.com");
      expect(secretDto.passkey.credential_id).toStrictEqual("AQIDBA");
      expect(passphrase).toStrictEqual("passphrase-123");
    });

    it("throws when the passkey resource type is unavailable", async () => {
      const { service } = buildStore({
        resourceTypeModel: { getOrFindAll: jest.fn(async () => ({ getFirstBySlug: () => null })) },
      });
      await expect(service.save(samplePasskey(), "pp")).rejects.toThrow();
    });
  });

  describe("::findByRpId", () => {
    it("returns an empty list when no finder is wired", async () => {
      const { service } = buildStore();
      expect(await service.findByRpId("example.com")).toStrictEqual([]);
    });

    it("delegates to the injected finder", async () => {
      const passkeyFinder = { findByRpId: jest.fn(async () => [{ credential_id: "x" }]) };
      const { service } = buildStore({ passkeyFinder });
      const result = await service.findByRpId("example.com");
      expect(passkeyFinder.findByRpId).toHaveBeenCalledWith("example.com");
      expect(result).toStrictEqual([{ credential_id: "x" }]);
    });
  });
});
