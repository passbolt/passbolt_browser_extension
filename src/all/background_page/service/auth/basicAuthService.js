import GetActiveAccountService from "../account/getActiveAccountService";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import GetOrFindResourcesService from "../resource/getOrFindResourcesService";
import GetPassphraseService from "../passphrase/getPassphraseService";
import FindSecretService from "../secret/findSecretService";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import DecryptAndParseResourceSecretService from "../secret/decryptAndParseResourceSecretService";

class BasicAuthService {
  constructor() {
    this.pendingRequestIds = new Set();
  }

  async handle(details) {
    if (this.pendingRequestIds.has(details.requestId) || details.tabId < 0) {
      return {};
    }
    this.pendingRequestIds.add(details.requestId);
    try {
      const account = await GetActiveAccountService.get();
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      const markerUrl = `${details.url.match(/^[^:/?#]+:\/\/[^/?#]+/)[0]}/.htpasswd`;
      const resources = await new GetOrFindResourcesService(account, apiClientOptions).getOrFindSuggested(
        markerUrl,
        "password",
      );
      const resource = resources.items.find((item) => item.metadata?.uris?.includes(markerUrl));
      if (!resource) {
        return {};
      }
      const passphrase = await new GetPassphraseService(account).requestPassphraseFromQuickAccess();
      const secret = await new FindSecretService(account, apiClientOptions).findByResourceId(resource.id);
      const schema = await new ResourceTypeModel(apiClientOptions).getSecretSchemaById(resource.resourceTypeId);
      const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
      const plaintext = await DecryptAndParseResourceSecretService.decryptAndParse(secret, schema, privateKey);
      if (typeof plaintext.password !== "string") {
        return {};
      }
      return { authCredentials: { username: resource.metadata?.username || "", password: plaintext.password } };
    } catch {
      return {};
    }
  }

  clear(details) {
    this.pendingRequestIds.delete(details.requestId);
  }
}

export default new BasicAuthService();
