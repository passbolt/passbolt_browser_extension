Release song - https://www.youtube.com/watch?v=gI6fQ2IXMjE

# v5.16.1
Passbolt 5.16.0 “Enjoy the Silence” introduces Offline Mode enabling users to select passwords and TOTPs for offline access when the Passbolt server cannot be reached, avoiding separate exports that can quickly become outdated.

## Access essential credentials offline
Keep critical credentials available during server outages or connectivity loss with read-only access to credentials prepared in advance. After authenticating locally with their passphrase, users can access and autofill them through QuickAccess and the in-form menu.
This helps maintain access continuity in restricted networks, data centres, and other low-connectivity environments.

## Choose the passwords for offline availability
Users can mark up to 1,000 passwords and TOTPs created in Passbolt version 5 for offline access, keeping storage focused on the credentials that are actually needed. 
Changes to the offline-enabled password or TOTP are automatically reflected in its stored copy while connected. If the user’s access to a password or TOTP is revoked, its cached copy is removed from offline storage.

## Protect and control offline access
Keep offline access protected and under administrator control. Cached metadata, secrets, and the metadata private key remain encrypted in the browser extension’s private storage.
While the plugin is enabled by default, administrators decide whether Offline Mode is available and can use RBAC to control which roles can view, mark, or remove resources for offline access.

Passbolt Pro Edition administrators can also set offline session duration and cached data expiry. Community Edition uses the default limits of a 5-minute offline session and 7-day data expiry.

## Conclusion
Many thanks to everyone who provided feedback, reported bugs, and contributed to making passbolt better.

## Changelogs
### Added
- PB-28188 EPIC - Offline mode
- PB-51230 OFM WP1.3 Add offline item in ResourceEntity
- PB-51233 OFM WP2.1 Create OfflineResourcesOPFSStorage
- PB-51234 OFM WP2.2 Create OfflineSecretsOPFSStorage
- PB-51239 OFM WP2.6 Create OfflineSettingsLocalStorage
- PB-51240 OFM WP3.1 Create OfflineSettingsApiService
- PB-51241 OFM WP3.2 Create MarkOfflineResourceApiService
- PB-51242 OFM WP3.3 Create UnmarkOfflineItemApiService
- PB-51452 OFM WP4.1 Create findOfflineSettingsService
- PB-51453 OFM-WP2.7 Create MetadatakeyOPFSStorage
- PB-51455 OFM WP4.2 Create getOrFindOfflineSettingsService
- PB-51456 OFM WP4.3 Create saveOfflineSettingsService
- PB-51458 OFM WP4.4 Create deleteOfflineSettingsService
- PB-51462 OFM WP4.5 Update findAndUpdateResourcesLocalStorageService
- PB-51467 OFM WP4.6 Update ResourceUpdateService to update offline resource and secret local storage
- PB-51482 OFM WP4.7 Update FavoriteResourceService and deleteResourceService to update offline resource
- PB-51485 OFM WP7.1 Create OfflineModeServiceWorkerService
- PB-51486 OFM WP6.1 Create quickAccessEvents to handle offline login and data read
- PB-51487 OFM WP6.2 Create offlineEvents to handle offline events
- PB-51489 OFM WP5.8 Create AuthLoginOfflineController
- PB-51491 OFM WP4.9 Update PostLogoutService to not flush all storage
- PB-51494 OFM WP4.12 Create FindAndUpdateOfflineSettingsLocalStorageService
- PB-51497 OFM WP4.14 Create MarkOfflineResourceService
- PB-51498 OFM WP4.15 Create UnmarkOfflineItemService
- PB-51500 OFM WP5.6 Create MarkItemOfflineUnavailableController
- PB-51501 OFM WP5.5. Create MarkResourceOfflineAvailableController
- PB-51503 OFM WP4.13 Update OnStartUpService to sign-out and flush data
- PB-51506 OFM WP5.3 Create DeleteOfflineSettingsController
- PB-51507 OFM WP5.2 Create SaveOfflineSettingsController
- PB-51508 OFM WP5.1 Create FindOfflineSettingsController
- PB-52043 OFM WP5.10 Create AuthLocalLogoutController
- PB-51870 OFM WP5.9 Create getOrFindOfflineSettingsController
- PB-52137 OFM WP9.19 Update LoginPage to route to appropriate pages
- PB-52532 OFM WP4.21 Update FindAndUpdateMetadataKeysSessionStorageService to store offline metadata keys
- PB-52567 OFM WP-10.5 Update markOfflineResourceService and unmarkOfflineItemService to update Offline storage of resources and secrets
- PB-52949 OFM WP1.5 Create UserActiveSessionEntity
- PB-52953 OFM WP3.5 Create ServerStatusApiService
- PB-52958 OFM WP4.22 Create findServerStatusService
- PB-52964 OFM WP4.23 Create FindAndUpdateActiveSessionService
- PB-53025 OFM WP10.6 Offline settings API BExt integration fixes
- PB-53029 OFM WP10.7 Mark/Unmark offline resource API BExt integration fixes
- PB-53062 OFM WP4.24 Create GetOrFindActiveSessionService
- PB-53089 OFM WP10.8 RBAC integration with API
- PB-53101 OFM WP10.9 Refactor OfflineSettingsLocalStorage to extend AbstractLocalStorage
- PB-53164 OFM WP4.10 Remove CheckAuthStatusService to use FindAndUpdateActiveSessionService
- PB-53181 OFM WP4.26 Create OfflineSessionExpiryAlarmService
- PB-53203 OFM WP10.11 Offline feature disabled but RBAC enabled behavior inconsistency
- PB-53300 OFM WP4.27 Create postLoginOfflineService
- PB-53337 OFM WP4.28 Update PostLoginService to update user active session last_login date
- PB-53338 OFM WP4.29 Update GetOrFindRbacService to update storage based on last_logged_in date
- PB-53352 OFM WP4.30 Update GetOrFindMeService to update storage based on last_login date
- PB-53354 OFM WP4.31 Update GetOrFindResourceTypesService to update storage based on last_login date
- PB-53355 OFM WP4.32 Update GetOrFindOfflineSettingsService to update storage based on last_login date
- PB-53476 OFM WP4.33 Create OfflineRetentionDataFlushService
- PB-53477 OFM WP4.34 Update StartLoopAuthSessionCheckService to update the last seen online property into the ActiveSessionLocalStorage
- PB-53569 OFM WP9.22 Create Footer to display server status
- PB-53624 OFM WP4.35 Create findAndUpdateMetadataKeysSessionStorageFromOfflineService
- PB-53625 OFM WP4.36 Create findAndUpdateResourcesLocalStorageFromOPFSService
- PB-53626 OFM WP4.37 Create findSecretOPFSService
- PB-53627 OFM WP5.12 Create findAndUpdateResourcesLocalStorageFromOPFSController
- PB-53628 OFM WP5.13 Create FindSecretByResourceIdOPFSController
- PB-53787 OFM WP-4.38 Update FindAndUpdateSiteSettingsLocalStorageService for Offline mode
- PB-53903 OFM WP10.21 Rename event passbolt.auth.find-and-update-active-session
- PB-53910 Update OfflineResourcesOPFSStorage with methods for tags
- PB-53911 Update UpdateTagService to update the OPFS storage
- PB-53912 Update UpdateResourceTagsService to call the OPFS service
- PB-53913 OFM WP4.42 Update DeleteTagsServie for OPFS
- PB-53967 OFM WP-10.28 Toolbar service should not update resources with offline session
- PB-54137 OFM WP12.2 Update AskInformMenuDisplay to get suggested from GetOrFindOfflineResourcesService
- PB-54139 OFM WP12.3 Update DisplayInformMenu to get suggested from GetOrFindOfflineResourcesService
- PB-54140 OFM WP12.4 Update DisplayInformMenu to hide functionalities not part of offline mode
- PB-54155 OFM WP10.30 - Offline Footer re-design
- PB-54249 OFM WP12.5 Update Autofill controller to get secret from FindSecretOPFSService for offline session
- PB-54261 OFM WP10.35 Update processing of Data retention period from seconds to days
- PB-54423 OFM WP13.1 Handle offline settings response validation error
- PB-54464 OFM WP13.3 Flush local storage if user is authenticate offline and sign-in online
- PB-54469 OFM Resource Workspace bugs: column values, unfavorite, filter
- PB-54479 OFM WP13.5 Site settings should be stored only for online authenticated session
- PB-54485 OFM WP13.7 Fix suggested resources counter for inform call to action
- PB-54518 OFM WP13.9 findAndUpdateAllByParentFolderId method should update the offline storage
- PB-54523 OFM WP13.10 findAndUpdateByIsSharedWithGroup shoudl update the offline storage
- PB-54654 OFM 'Unable to reach the server' message when logged in AND MFA is required
- PB-54579 OFM Able to see remove offline availability option even when the action is denied

### Fixed
- PB-52720 Folder tree subfolders hoisted to top of tree on collapse of a deep branch
- PB-53724 Reduce footer padding to 8px

### Security
- PB-54532 Small upgrade for js-yaml (High)
- PB-54587 - Fix @xmldom/xmldom GHSA-93r5-fhx6-vmg9 - CVSS4.0 HIGH
- PB-54644 Fix browserslist GHSA-c83g-rgw3-j3cx - CVSS3.1 HIGH
- PB-54645 Fix fast-uri GHSA-5jgf-p345-68v8 - CVSS3.1 HIGH
- PB-54646 Fix svgo GHSA-w27v-7q3p-w38r - CVSS3.1 HIGH
- PB-54647 Fix @humanfs/node  GHSA-p498-v437-472g - CVSS4.0 MEDIUM
- PB-54650 Fix qs GHSA-x5fp-wj9c-mxmx - CVSS4.0 MEDIUM
- PB-54651 Fix joi GHSA-6w3j-5fw6-r9vr - CVSS3.1 LOW
- PB-54653 Fix postcss-selector-parser GHSA-w9m9-85wc-3x92 - CVSS4.0 LOW

### Maintenance
- PB-53396 fix progress bar on resource update
- PB-53720 Apply Title Case to titles across the administration workspace navigation menu, breadcrumb, page title, and section headers
- PB-53763 Replace the react-list fork with upstream 0.8.19
- PB-53765 Migrate the group delete capability from direct port request to GroupServiceWorkerService
- PB-53766 Add unit test coverage for the delete method of GroupApiService
- PB-53767 Migrate the group delete logic from GroupModel to a dedicated DeleteGroupService
- PB-53768 Extract the group delete logic from groupEvents into a dedicated DeleteGroupController
- PB-53769 Migrate the group delete dry run to DeleteGroupService and a dedicated DeleteDryRunGroupController
- PB-53770 Migrate the folder update capability from direct port.request to FolderServiceWorkerService
- PB-53771 Rename FolderService to FolderApiService and add unit test coverage for its update method
- PB-53772 Migrate the folder update logic from FolderModel to a dedicated UpdateFolderService
- PB-53773 Extract the folder update logic from folderEvents into a dedicated UpdateFolderController
- PB-53782 Migrate MfaPolicyEntity to EntityV2 and add unit test coverage
- PB-53783 Migrate PermissionChangeEntity to EntityV2 and add unit test coverage
- PB-54130 Consolidate UUID assertions on the styleguide assertUuid helper
- PB-54175 remove the submit confirmation message on the permission confirmation dialog
- PB-54353 Migrate folder delete capability  to service worker using FolderServiceWorkerService
- PB-54354 Cover the delete method from FolderApiService with unit tests
- PB-54360 Migrate the folder delete logic from FolderModel to DeleteFolderService
- PB-54366 Introduce DeleteFolderController and wire it
