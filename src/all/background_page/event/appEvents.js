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
 */

import GetOrganizationPolicyController from "../controller/accountRecovery/getOrganizationPolicyController";
import AccountRecoverySaveOrganizationPolicyController from "../controller/accountRecovery/accountRecoverySaveOrganizationPolicyController";
import AccountRecoveryValidatePublicKeyController from "../controller/accountRecovery/accountRecoveryValidatePublicKeyController";
import AccountRecoveryValidateOrganizationPrivateKeyController from "../controller/accountRecovery/accountRecoveryValidateOrganizationPrivateKeyController";
import AccountRecoveryGetUserRequestsController from "../controller/accountRecovery/accountRecoveryGetUserRequestsController";
import AccountRecoveryGetRequestController from "../controller/accountRecovery/accountRecoveryGetRequestController";
import ReviewRequestController from "../controller/accountRecovery/reviewRequestController";
import AccountRecoveryGenerateOrganizationKeyController from "../controller/accountRecovery/accountRecoveryGenerateOrganizationKeyController";
import AccountRecoverySaveUserSettingsController from "../controller/accountRecovery/accountRecoverySaveUserSettingController";
import HasUserPostponedUserSettingInvitationController from "../controller/accountRecovery/hasUserPostponedUserSettingInvitationController";
import PostponeUserSettingInvitationController from "../controller/accountRecovery/postponeUserSettingInvitationController";
import WorkerService from "../service/worker/workerService";
import TestSsoAuthenticationController from "../controller/sso/testSsoAuthenticationController";
import GetCurrentSsoSettingsController from "../controller/sso/getCurrentSsoSettingsController";
import SaveSsoSettingsAsDraftController from "../controller/sso/saveSsoSettingsAsDraftController";
import ActivateSsoSettingsController from "../controller/sso/activateSsoSettingsController";
import DeleteSsoSettingsController from "../controller/sso/deleteSsoSettingsController";
import GenerateSsoKitController from "../controller/auth/generateSsoKitController";
import FindRbacMeController from "../controller/rbac/findRbacMeController";
import GetOrFindPasswordPoliciesController from "../controller/passwordPolicies/getOrFindPasswordPoliciesController";
import SavePasswordPoliciesController from "../controller/passwordPolicies/savePasswordPoliciesController";
import FindPasswordPoliciesController from "../controller/passwordPolicies/findPasswordPoliciesController";
import ExportDesktopAccountController from "../controller/exportAccount/exportDesktopAccountController";
import FindUserPassphrasePoliciesController from "../controller/userPassphrasePolicies/findUserPassphrasePoliciesController";
import SaveUserPassphrasePoliciesController from "../controller/userPassphrasePolicies/saveUserPassphrasePoliciesController";
import SavePasswordExpirySettingsController from "../controller/passwordExpiry/savePasswordExpirySettingsController";
import DeletePasswordExpirySettingsController from "../controller/passwordExpiry/deletePasswordExpirySettingsController";
import GetOrFindPasswordExpirySettingsController from "../controller/passwordExpiry/getOrFindPasswordExpirySettingsController";
import GetOrFindMetadataTypesController from "../controller/metadata/getMetadataTypesSettingsController";
import SaveMetadataTypesSettingsController from "../controller/metadata/saveMetadataTypesSettingsController";
import FindAllNonDeletedMetadataKeysController from "../controller/metadata/findAllNonDeletedMetadataKeysController";
import FindMetadataKeysSettingsController from "../controller/metadata/findMetadataKeysSettingsController";
import FindMetadataTypesSettingsController from "../controller/metadata/findMetadataTypesSettingsController";
import GenerateMetadataPrivateKeyController from "../controller/metadata/generateMetadataPrivateKeyController";
import SaveMetadataKeysSettingsController from "../controller/metadata/saveMetadataKeysSettingsController";
import CreateMetadataKeyController from "../controller/metadata/createMetadataKeyController";
import GetCsrfTokenController from "../controller/auth/getCsrfTokenController";
import FindMetadataMigrateResourcesController from "../controller/migrateMetadata/findMetadataMigrateResourcesController";
import MigrateMetadataResourcesController from "../controller/migrateMetadata/migrateMetadataResourcesController";
import DownloadOrganizationGeneratedKey from "../controller/accountRecovery/downloadOrganizationGenerateKeyController";
import ShareMetadataKeyPrivateController from "../controller/metadata/shareMetadataKeyPrivateController";
import GetOrFindMetadataKeysSettingsController from "../controller/metadata/getOrFindMetadataKeysSettingsController";
import CopyToClipboardController from "../controller/clipboard/copyToClipboardController";
import CopyTemporarilyToClipboardController from "../controller/clipboard/copyTemporarilyToClipboardController";
import FindMetadataGettingStartedSettingsController from "../controller/metadata/findMetadataGettingStartedSettingsController";
import EnableEncryptedMetadataForExistingInstanceController from "../controller/metadata/enableEncryptedMetadataForExistingInstanceController";
import KeepCleartextMetadataForExistingInstanceController from "../controller/metadata/keepCleartextMetadataForExistingInstanceController";
import FindScimSettingsController from "../controller/scimSettings/findScimSettingsController";
import CreateScimSettingsController from "../controller/scimSettings/createScimSettingsController";
import UpdateScimSettingsController from "../controller/scimSettings/updateScimSettingsController";
import DisableScimSettingsController from "../controller/scimSettings/disableScimSettingsController";
import RotateMetadataKeyController from "../controller/rotateMetadata/rotateMetadataKeyController";
import ResumeRotateMetadataKeyController from "../controller/rotateMetadata/resumeRotateMetadataKeyController";
import FavoriteResourceController from "../controller/favorite/favoriteResourceController";
import UnfavoriteResourceController from "../controller/favorite/unfavoriteResourceController";
import FindSecretRevisionsSettingsController from "../controller/secretRevision/findSecretRevisionsSettingsController";
import FindResourceSecretRevisionsForDisplayController from "../controller/secretRevision/findResourceSecretRevisionsForDisplayController";
import DeleteSecretRevisionsSettingsController from "../controller/secretRevision/deleteSecretRevisionsSettingsController";
import SaveSecretRevisionsSettingsController from "../controller/secretRevision/saveSecretRevisionsSettingsController";
import FindExportPoliciesSettingsController from "../controller/exportPolicies/findExportPoliciesSettingsController";
import CreateSubscriptionKeyController from "../controller/subscription/createSubscriptionKeyController";
import DeleteSubscriptionKeyController from "../controller/subscription/deleteSubscriptionKeyController";
import FindSubscriptionKeyController from "../controller/subscription/findSubscriptionKeyController";
import UpdateSubscriptionKeyController from "../controller/subscription/updateSubscriptionKeyController";
import FindTagsController from "../controller/tag/findTagsController";
import UpdateTagController from "../controller/tag/updateTagController";
import DeleteTagController from "../controller/tag/deleteTagController";
import UpdateResourceTagsController from "../controller/tag/updateResourceTagsController";
import AddTagsToResourcesController from "../controller/tag/addTagsToResourcesController";
import OpenAdministrationPageController from "../controller/tab/openAdministrationPageController";
import OpenTrustedDomainTabController from "../controller/tab/openTrustedDomainTabController";
import OpenWebsiteGettingStartedPageController from "../controller/tab/openWebsiteGettingStartedPageController";
import OpenResourceUriTabController from "../controller/tab/openResourceUriTabController";
import FindOfflineSettingsController from "../controller/offline/findOfflineSettingsController";
import GetOrFindOfflineSettingsController from "../controller/offline/getOrFindOfflineSettingsController";
import SaveOfflineSettingsController from "../controller/offline/saveOfflineSettingsController";
import DeleteOfflineSettingsController from "../controller/offline/deleteOfflineSettingsController";
import MarkResourceOfflineAvailableController from "../controller/offlineResourceController/markResourceOfflineAvailableController";
import UnmarkItemOfflineAvailableController from "../controller/offline/unmarkItemOfflineAvailableController";

const listen = function (worker, apiClientOptions, account) {
  /*
   * Whenever the (React) app changes his route
   * @listens passbolt.app.route-changed
   * @param path The relative navigated-to path
   */
  worker.port.on("passbolt.app.route-changed", async (path) => {
    if (/^\/[A-Z/-9\-]*$/i.test(path)) {
      const appBoostrapWorker = await WorkerService.get("AppBootstrap", worker.tab.id);
      appBoostrapWorker.port.emit("passbolt.app-bootstrap.change-route", path);
    }
  });

  /*
   * ==================================================================================
   *  Account recovery events
   * ==================================================================================
   */

  worker.port.on("passbolt.account-recovery.get-organization-policy", async (requestId) => {
    const controller = new GetOrganizationPolicyController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on(
    "passbolt.account-recovery.save-organization-policy",
    async (requestId, accountRecoveryOrganizationPolicyDto, privateGpgKeyDto) => {
      const controller = new AccountRecoverySaveOrganizationPolicyController(
        worker,
        requestId,
        apiClientOptions,
        account,
      );
      await controller._exec(accountRecoveryOrganizationPolicyDto, privateGpgKeyDto);
    },
  );

  worker.port.on(
    "passbolt.account-recovery.validate-organization-key",
    async (requestId, newAccountRecoveryOrganizationPublicKey) => {
      const controller = new AccountRecoveryValidatePublicKeyController(worker, requestId, apiClientOptions);
      await controller._exec(newAccountRecoveryOrganizationPublicKey);
    },
  );

  worker.port.on("passbolt.account-recovery.generate-organization-key", async (requestId, generateGpgKeyDto) => {
    const controller = new AccountRecoveryGenerateOrganizationKeyController(
      worker,
      requestId,
      apiClientOptions,
      account,
    );
    await controller._exec(generateGpgKeyDto);
  });

  worker.port.on("passbolt.account-recovery.download-organization-generated-key", async (requestId, privateKey) => {
    const controller = new DownloadOrganizationGeneratedKey(worker, requestId, apiClientOptions);
    await controller._exec(privateKey);
  });

  worker.port.on(
    "passbolt.account-recovery.validate-organization-private-key",
    async (requestId, accountRecoveryOrganizationPrivateKeyDto) => {
      const controller = new AccountRecoveryValidateOrganizationPrivateKeyController(
        worker,
        requestId,
        apiClientOptions,
      );
      return await controller._exec(accountRecoveryOrganizationPrivateKeyDto);
    },
  );

  worker.port.on("passbolt.account-recovery.get-user-requests", async (requestId, userId) => {
    const controller = new AccountRecoveryGetUserRequestsController(worker, requestId, apiClientOptions);
    await controller._exec(userId);
  });

  worker.port.on("passbolt.account-recovery.get-request", async (requestId, accountRecoveryRequestId) => {
    const controller = new AccountRecoveryGetRequestController(worker, requestId, apiClientOptions);
    await controller._exec(accountRecoveryRequestId);
  });

  worker.port.on("passbolt.account-recovery.save-user-settings", async (requestId, accountRecoveryUserSettingDto) => {
    const controller = new AccountRecoverySaveUserSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec(accountRecoveryUserSettingDto);
  });

  worker.port.on(
    "passbolt.account-recovery.review-request",
    async (requestId, accountRecoveryRequestId, responseStatus, privateKeyDto) => {
      const controller = new ReviewRequestController(worker, requestId, apiClientOptions, account);
      await controller._exec(accountRecoveryRequestId, responseStatus, privateKeyDto);
    },
  );

  worker.port.on("passbolt.account-recovery.has-user-postponed-user-setting-invitation", async (requestId) => {
    const controller = new HasUserPostponedUserSettingInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on("passbolt.account-recovery.postpone-user-setting-invitation", async (requestId) => {
    const controller = new PostponeUserSettingInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on("passbolt.sso.get-current", async (requestId) => {
    const controller = new GetCurrentSsoSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.sso.save-draft", async (requestId, draftSsoSettings) => {
    const controller = new SaveSsoSettingsAsDraftController(worker, requestId, apiClientOptions);
    await controller._exec(draftSsoSettings);
  });

  worker.port.on("passbolt.sso.dry-run", async (requestId, draftId) => {
    const controller = new TestSsoAuthenticationController(worker, requestId, apiClientOptions, account);
    await controller._exec(draftId);
  });

  worker.port.on("passbolt.sso.activate-settings", async (requestId, draftId, ssoToken) => {
    const controller = new ActivateSsoSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(draftId, ssoToken);
  });

  worker.port.on("passbolt.sso.delete-settings", async (requestId, settingsId) => {
    const controller = new DeleteSsoSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(settingsId);
  });

  worker.port.on("passbolt.sso.generate-sso-kit", async (requestId, provider) => {
    const controller = new GenerateSsoKitController(worker, requestId, apiClientOptions, account);
    await controller._exec(provider);
  });

  /*
   * ==================================================================================
   *  Role based control action
   * ==================================================================================
   */

  worker.port.on("passbolt.rbacs.find-me", async (requestId, name) => {
    const controller = new FindRbacMeController(worker, requestId, apiClientOptions, account);
    await controller._exec(name);
  });

  /*
   * ==================================================================================
   *  Password policies events.
   * ==================================================================================
   */

  worker.port.on("passbolt.password-policies.get", async (requestId) => {
    const controller = new GetOrFindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.password-policies.save", async (requestId, passwordSettingsDto) => {
    const controller = new SavePasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec(passwordSettingsDto);
  });

  worker.port.on("passbolt.password-policies.get-admin-settings", async (requestId) => {
    const controller = new FindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  /*
   * ==================================================================================
   *  User Passphrase Policies events.
   * ==================================================================================
   */

  worker.port.on("passbolt.user-passphrase-policies.find", async (requestId) => {
    const controller = new FindUserPassphrasePoliciesController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.user-passphrase-policies.save", async (requestId, userPassphrasePoliciesDto) => {
    const controller = new SaveUserPassphrasePoliciesController(worker, requestId, apiClientOptions);
    await controller._exec(userPassphrasePoliciesDto);
  });

  /*
   * ==================================================================================
   *  Password expiry settings events.
   * ==================================================================================
   */

  worker.port.on("passbolt.password-expiry.get-or-find", async (requestId, refreshCache = false) => {
    const controller = new GetOrFindPasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec(refreshCache);
  });

  worker.port.on("passbolt.password-expiry.save", async (requestId, passwordExpirySettingsDto) => {
    const controller = new SavePasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec(passwordExpirySettingsDto);
  });

  worker.port.on("passbolt.password-expiry.delete", async (requestId, passwordExpiryId) => {
    const controller = new DeletePasswordExpirySettingsController(worker, requestId, account, apiClientOptions);
    await controller._exec(passwordExpiryId);
  });

  /*
   * ==================================================================================
   *  Desktop app events.
   * ==================================================================================
   */

  /*
   * export account for desktop application
   *
   * @listens passbolt.desktop.export-account
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.desktop.export-account", async (requestId) => {
    const controller = new ExportDesktopAccountController(worker, requestId, account);
    await controller._exec();
  });

  /*
   * ==================================================================================
   *  Metadata events.
   * ==================================================================================
   */

  /*
   * Find all non deleted metadata keys.
   *
   * @listens passbolt.metadata.find-all-non-deleted-metadata-keys
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.find-all-non-deleted-metadata-keys", async (requestId) => {
    const controller = new FindAllNonDeletedMetadataKeysController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /*
   * Get or find metadata keys settings.
   *
   * @listens passbolt.metadata.find-metadata-keys-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.find-metadata-keys-settings", async (requestId) => {
    const controller = new FindMetadataKeysSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Get or find metadata keys settings.
   *
   * @listens passbolt.metadata.get-or-find-metadata-keys-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.get-or-find-metadata-keys-settings", async (requestId) => {
    const controller = new GetOrFindMetadataKeysSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Generate metadata key.
   *
   * @listens passbolt.metadata.generate-metadata-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.generate-metadata-key", async (requestId) => {
    const controller = new GenerateMetadataPrivateKeyController(worker, requestId, account);
    await controller._exec();
  });

  /*
   * Get or find metadata types settings.
   *
   * @listens passbolt.metadata.find-metadata-types-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.find-metadata-types-settings", async (requestId) => {
    const controller = new FindMetadataTypesSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Get or find metadata types settings.
   *
   * @listens passbolt.metadata.get-or-find-metadata-types-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.get-or-find-metadata-types-settings", async (requestId) => {
    const controller = new GetOrFindMetadataTypesController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Save metadata keys settings.
   *
   * @listens passbolt.metadata.save-metadata-keys-settings
   * @param requestId {uuid} The request identifier
   * @param dto {object} The metadata keys settings dto
   */
  worker.port.on("passbolt.metadata.save-metadata-keys-settings", async (requestId, dto) => {
    const controller = new SaveMetadataKeysSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec(dto);
  });

  /*
   * Save metadata types settings.
   *
   * @listens passbolt.metadata.save-metadata-types-settings
   * @param requestId {uuid} The request identifier
   * @param dto {object} The metadata types settings dto
   */
  worker.port.on("passbolt.metadata.save-metadata-types-settings", async (requestId, dto) => {
    const controller = new SaveMetadataTypesSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec(dto);
  });

  /*
   * Create metadata key.
   *
   * @listens passbolt.metadata.create-key
   * @param requestId {uuid} The request identifier
   * @param dto {object} The metadata key pair dto.
   */
  worker.port.on("passbolt.metadata.create-key", async (requestId, dto) => {
    const controller = new CreateMetadataKeyController(worker, requestId, account, apiClientOptions);
    await controller._exec(dto);
  });

  /*
   * ==================================================================================
   *  Auth events.
   * ==================================================================================
   */

  /*
   * Get the CSRF token from
   */
  worker.port.on("passbolt.auth.get-csrf-token", async (requestId) => {
    const controller = new GetCsrfTokenController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /*
   * Find metadata migration details.
   *
   * @listens passbolt.metadata.find-metadata-migrate-resources-details
   * @param requestId {uuid} The request identifier
   */
  worker.port.on(
    "passbolt.metadata.find-metadata-migrate-resources-details",
    async (requestId, sharedContentOnly = false) => {
      const controller = new FindMetadataMigrateResourcesController(worker, requestId, apiClientOptions);
      await controller._exec(sharedContentOnly);
    },
  );

  /*
   * Migrate metadata.
   *
   * @listens passbolt.metadata.migrate-resources-metadata
   * @param requestId {uuid} The request identifier
   * @param migrateMetdataDto {object} the migration metadata dto.
   * @param paginationDetails {object} the pagination details dto.
   */
  worker.port.on(
    "passbolt.metadata.migrate-resources-metadata",
    async (requestId, migrateMetdataDto, paginationDetails) => {
      const controller = new MigrateMetadataResourcesController(worker, requestId, apiClientOptions, account);
      await controller._exec(migrateMetdataDto, paginationDetails);
    },
  );

  /*
   * Rotate metadata.
   *
   * @listens passbolt.metadata.rotate-resources-metadata-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.rotate-metadata-key", async (requestId, metadataKeyPairDto, metadataKeyId) => {
    const controller = new RotateMetadataKeyController(worker, requestId, apiClientOptions, account);
    await controller._exec(metadataKeyPairDto, metadataKeyId);
  });

  /*
   * Resume rotation metadata.
   *
   * @listens passbolt.metadata.resume-rotate-resources-metadata-key
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.resume-rotate-metadata-key", async (requestId, metadataKey) => {
    const controller = new ResumeRotateMetadataKeyController(worker, requestId, apiClientOptions, account);
    await controller._exec(metadataKey);
  });

  /*
   * Share missing metadata private key with a user.
   *
   * @listens passbolt.metadata.share-missing-metadata-private-keys-with-user
   * @param requestId {uuid} The request identifier
   * @param userId {uuid} the user id which missed some metadata private key.
   */
  worker.port.on("passbolt.metadata.share-missing-metadata-private-keys-with-user", async (requestId, userId) => {
    const controller = new ShareMetadataKeyPrivateController(worker, requestId, apiClientOptions, account);
    await controller._exec(userId);
  });

  /*
   * Find metadata getting started settings.
   *
   * @listens passbolt.metadata.find-getting-started-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.find-getting-started-settings", async (requestId) => {
    const controller = new FindMetadataGettingStartedSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /*
   * Configure metadata to enable encrypted metadata for existing instances.
   *
   * @listens passbolt.metadata.enable-encrypted-metadata-for-existing-instance
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.enable-encrypted-metadata-for-existing-instance", async (requestId) => {
    const controller = new EnableEncryptedMetadataForExistingInstanceController(
      worker,
      requestId,
      apiClientOptions,
      account,
    );
    await controller._exec();
  });

  /*
   * Configure metadata to keep legacy cleartext metadata for existing instances
   *
   * @listens passbolt.metadata.keep-cleartext-metadata-for-existing-instance
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.metadata.keep-cleartext-metadata-for-existing-instance", async (requestId) => {
    const controller = new KeepCleartextMetadataForExistingInstanceController(
      worker,
      requestId,
      apiClientOptions,
      account,
    );
    await controller._exec();
  });

  /*
   * ==================================================================================
   *  Clipboard events.
   * ==================================================================================
   */

  /**
   * Copies the given content into the clipboard and clear any clipboard flush alarms.
   *
   * @listens assbolt.clipboard.copy
   * @param {string} requestId The request identifier
   * @param {string} text the content to copy
   */
  worker.port.on("passbolt.clipboard.copy", async (requestId, text) => {
    const clipboardController = new CopyToClipboardController(worker, requestId);
    await clipboardController._exec(text);
  });

  /**
   * Copies temporarily the given content into the clipboard and set a clipboard flush alarm.
   *
   * @listens assbolt.clipboard.copy-temporarily
   * @param {string} requestId The request identifier
   * @param {string} text the content to copy
   */
  worker.port.on("passbolt.clipboard.copy-temporarily", async (requestId, text) => {
    const clipboardController = new CopyTemporarilyToClipboardController(worker, requestId);
    await clipboardController._exec(text);
  });

  /*
   * ==================================================================================
   *  SCIM events.
   * ==================================================================================
   */
  /**
   * Find SCIM settings
   *
   * @listens passbolt.scim.find-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.scim.find-settings", async (requestId) => {
    const controller = new FindScimSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /**
   * Find SCIM settings
   *
   * @listens passbolt.scim.find-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.scim.find-settings", async (requestId) => {
    const controller = new FindScimSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /**
   * Create SCIM settings
   *
   * @listens passbolt.scim.create-settings
   * @param requestId {uuid} The request identifier
   * @param data {Object} The SCIM settings data
   */
  worker.port.on("passbolt.scim.create-settings", async (requestId, data) => {
    const controller = new CreateScimSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(data);
  });

  /**
   * Update SCIM settings
   *
   * @listens passbolt.scim.update-settings
   * @param requestId {uuid} The request identifier
   * @param id {string} The SCIM settings ID
   * @param data {Object} The SCIM settings data
   */
  worker.port.on("passbolt.scim.update-settings", async (requestId, id, data) => {
    const controller = new UpdateScimSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(id, data);
  });

  /**
   * Disable SCIM settings
   *
   * @listens passbolt.scim.disable-settings
   * @param requestId {uuid} The request identifier
   * @param id {string} The SCIM settings ID
   */
  worker.port.on("passbolt.scim.disable-settings", async (requestId, id) => {
    const controller = new DisableScimSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(id);
  });

  /*
   * ==================================================================================
   *  Favorite events.
   * ==================================================================================
   */
  /**
   * Mark a resource as favorite
   *
   * @listens passbolt.favorite.add
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource id
   */
  worker.port.on("passbolt.favorite.add", async (requestId, resourceId) => {
    const controller = new FavoriteResourceController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourceId);
  });
  /**
   * Unmark a resource as favorite
   *
   * @listens passbolt.favorite.delete
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource id
   */
  worker.port.on("passbolt.favorite.delete", async (requestId, resourceId) => {
    const controller = new UnfavoriteResourceController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourceId);
  });

  /*
   * ==================================================================================
   *  Secret revisions events.
   * ==================================================================================
   */
  /**
   * Finds the secret revisions settings from the API
   *
   * @listens passbolt.secret-revisions.find-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.secret-revisions.find-settings", async (requestId) => {
    const controller = new FindSecretRevisionsSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /**
   * Saves the secret revisions settings to the API
   *
   * @listens passbolt.secret-revisions.save-settings
   * @param requestId {uuid} The request identifier
   * @param secretRevisionSettingsDto {Object} The secret revisions settings dto
   */
  worker.port.on("passbolt.secret-revisions.save-settings", async (requestId, secretRevisionSettingsDto) => {
    const controller = new SaveSecretRevisionsSettingsController(worker, requestId, apiClientOptions);
    await controller._exec(secretRevisionSettingsDto);
  });

  /**
   * Deletes the secret revisions settings from the API
   *
   * @listens passbolt.secret-revisions.delete-settings
   * @param requestId {uuid} The request identifier
   * @param settingsId {uuid} The settings id
   */
  worker.port.on("passbolt.secret-revisions.delete-settings", async (requestId) => {
    const controller = new DeleteSecretRevisionsSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /**
   * Find the secret revisions of a resource given its id
   *
   * @listens passbolt.secret-revisions.find-all-by-resource-id-for-display
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource id
   */
  worker.port.on("passbolt.secret-revisions.find-all-by-resource-id-for-display", async (requestId, resourceId) => {
    const controller = new FindResourceSecretRevisionsForDisplayController(
      worker,
      requestId,
      apiClientOptions,
      account,
    );
    await controller._exec(resourceId);
  });

  /*
   * ==================================================================================
   *  Export Policies Settings events
   * ==================================================================================
   */
  /**
   * Find export policies settings
   *
   * @listens passbolt.export-policies.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.export-policies.get", async (requestId) => {
    const controller = new FindExportPoliciesSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  /**
   * Find the subscription key
   *
   * @listens passbolt.subscription.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.subscription.get", async (requestId) => {
    const subscriptionKeyController = new FindSubscriptionKeyController(worker, requestId, apiClientOptions);
    await subscriptionKeyController._exec();
  });

  /**
   * Update the subscription key
   *
   * @listens passbolt.subscription.update
   * @param requestId {uuid} The request identifier
   * @param subscriptionKeyDto {{ data: string }} The new subscription key
   */
  worker.port.on("passbolt.subscription.update", async (requestId, subscriptionKeyDto) => {
    const subscriptionController = new UpdateSubscriptionKeyController(worker, requestId, apiClientOptions);
    await subscriptionController._exec(subscriptionKeyDto);
  });

  /**
   * Create the subscription key (upgrade CE to PRO).
   *
   * @listens passbolt.subscription.create
   * @param requestId {uuid} The request identifier
   * @param subscriptionKeyDto {{ data: string }} The new subscription key
   */
  worker.port.on("passbolt.subscription.create", async (requestId, subscriptionKeyDto) => {
    const subscriptionController = new CreateSubscriptionKeyController(worker, requestId, apiClientOptions, account);
    await subscriptionController._exec(subscriptionKeyDto);
  });

  /**
   * Delete the subscription (downgrade PRO to CE).
   *
   * @listens passbolt.subscription.downgrade
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.subscription.downgrade", async (requestId) => {
    const subscriptionController = new DeleteSubscriptionKeyController(worker, requestId, apiClientOptions, account);
    await subscriptionController._exec();
  });

  /**
   * Find all the tags
   *
   * @listens passbolt.tags.find-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.tags.find-all", async (requestId) => {
    const findTagsController = new FindTagsController(worker, requestId, apiClientOptions);
    await findTagsController._exec();
  });

  /**
   * Update a tag
   *
   * @listens passbolt.tags.update
   * @param requestId {uuid} The request identifier
   * @param tagDto {object} The tag object
   */
  worker.port.on("passbolt.tags.update", async (requestId, tagDto) => {
    const updateTagController = new UpdateTagController(worker, requestId, apiClientOptions, account);
    await updateTagController._exec(tagDto);
  });

  /**
   * Delete a tag
   *
   * @listens passbolt.tags.delete
   * @param requestId {uuid} The request identifier
   * @param tagId {uuid} The tag identifier
   */
  worker.port.on("passbolt.tags.delete", async (requestId, tagId) => {
    const deleteTagController = new DeleteTagController(worker, requestId, apiClientOptions, account);
    await deleteTagController._exec(tagId);
  });

  /**
   * Update resource tags
   *
   * @listens passbolt.tags.update-resource-tags
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource identifier
   * @param tagsDto {Object} tags dto
   */
  worker.port.on("passbolt.tags.update-resource-tags", async (requestId, resourceId, tagsDto) => {
    const updateResourceTagsController = new UpdateResourceTagsController(worker, requestId, apiClientOptions, account);
    await updateResourceTagsController._exec(resourceId, tagsDto);
  });

  /**
   * Add resources tag
   *
   * @listens passbolt.tags.add-resource-tags
   * @param requestId {uuid} The request identifier
   * @param {object} resourcesTagDto {resources: array of uuids, tag: {object}} the tag to add for the resources
   */
  worker.port.on("passbolt.tags.add-resources-tag", async (requestId, resourcesTagDto) => {
    const addTagsToResourcesController = new AddTagsToResourcesController(worker, requestId, apiClientOptions, account);
    await addTagsToResourcesController._exec(resourcesTagDto.resources, [resourcesTagDto.tag]);
  });

  /**
   * Opens an administration page in the current tab.
   * @param {string} requestId
   * @param {string} pageName The name of the administration page to open
   * @listens passbolt.tabs.open-admin-page
   */
  worker.port.on("passbolt.tabs.open-admin-page", async (requestId, pageName) => {
    const controller = new OpenAdministrationPageController(worker, requestId);
    await controller._exec(pageName);
  });

  /**
   * Opens the trusted domain in a new tab.
   * @param {string} requestId
   * @listens passbolt.tabs.open-trusted-domain
   */
  worker.port.on("passbolt.tabs.open-trusted-domain", async (requestId) => {
    const controller = new OpenTrustedDomainTabController(worker, requestId);
    await controller._exec();
  });

  /**
   * Opens the Passbolt getting started page in a new tab.
   * @param {string} requestId
   * @listens passbolt.tabs.open-website-getting-started-page
   */
  worker.port.on("passbolt.tabs.open-website-getting-started-page", async (requestId) => {
    const controller = new OpenWebsiteGettingStartedPageController(worker, requestId);
    await controller._exec();
  });

  /**
   * Opens the given URI in a new tab.
   * @param {string} requestId
   * @param {string} uri
   * @listens passbolt.tabs.open-resource-uri
   */
  worker.port.on("passbolt.tabs.open-resource-uri", async (requestId, uri) => {
    const controller = new OpenResourceUriTabController(worker, requestId);
    await controller._exec(uri);
  });

  /*
   * ==================================================================================
   *  Offline events
   * ==================================================================================
   */
  /*
   * Find offline settings.
   *
   * @listens passbolt.offline.find-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.offline.find-settings", async (requestId) => {
    const controller = new FindOfflineSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Get or find offline settings.
   *
   * @listens passbolt.offline.get-or-find-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.offline.get-or-find-settings", async (requestId) => {
    const controller = new GetOrFindOfflineSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Save offline settings.
   *
   * @listens passbolt.offline.save-settings
   * @param requestId {uuid} The request identifier
   * @param offlineSettingsDto {Object} The offline settings dto
   */
  worker.port.on("passbolt.offline.save-settings", async (requestId, offlineSettingsDto) => {
    const controller = new SaveOfflineSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec(offlineSettingsDto);
  });

  /*
   * Delete offline settings.
   *
   * @listens passbolt.offline.delete-settings
   * @param requestId {uuid} The request identifier
   * @param id {uuid} The offline settings id
   */
  worker.port.on("passbolt.offline.delete-settings", async (requestId, id) => {
    const controller = new DeleteOfflineSettingsController(worker, requestId, apiClientOptions, account);
    await controller._exec(id);
  });

  /*
   * Mark a resource as offline available.
   *
   * @listens passbolt.offline.mark-offline
   * @param requestId {uuid} The request identifier
   * @param id {uuid} resourceId
   */
  worker.port.on("passbolt.offline.mark-resource-offline", async (requestId, id) => {
    const controller = new MarkResourceOfflineAvailableController(worker, requestId, apiClientOptions, account);
    await controller._exec(id);
  });
  /*
   * Remove a resource's offline availability.
   *
   * @listens passbolt.offline.unmark-offline
   * @param requestId {uuid} The request identifier
   * @param id {uuid} resourceId
   */
  worker.port.on("passbolt.offline.unmark-item-offline", async (requestId, id) => {
    const controller = new UnmarkItemOfflineAvailableController(worker, requestId, apiClientOptions, account);
    await controller._exec(id);
  });
};

export const AppEvents = { listen };
