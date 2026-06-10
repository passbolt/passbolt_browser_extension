Passbolt 5.13.0 makes in-app version upgrades and downgrades generally available, ending the need to run manual migrations. This release also introduces a new pagination system for resources, along with a new healthcheck entry for cache availability and the usual round of security and dependency updates.

## Edition management from the product
Passbolt 5.13 introduces a seamless, in-app system for transitioning between application versions, entirely eliminating the need for administrators to run manual database migrations.

Unlike traditional updates that require executing external scripts or command-line operations, switching versions is now handled natively within the interface. Upgrading to the PRO edition is as simple as entering your subscription key; once saved, a quick logout and login immediately activates all PRO features for your organization.
The system is designed to handle subscription lifecycles gracefully. Should your license key expire, Passbolt allows for a smooth downgrade process, reverting the instance safely without breaking existing data configurations or requiring complex rollbacks.

This release significantly lowers the maintenance overhead for administrators, ensuring that scaling your organization's password management capabilities is completely friction-free.

## Resource pagination 

Unlike the previous approach, which retrieved an entire password collection in one request and placed significant load on the server for organizations managing thousands of resources, resources are now fetched page by page, in batches of 500 to 1000 records. Pages are loaded sequentially and assembled in memory, then the complete collection is filtered and decrypted before being written to the local storage.

This first implementation is fully transparent to end users: the interface, workflows, and stored data remain unchanged. This release lays the groundwork for faster resource loading in future versions, including parallel page fetching, concurrent metadata decryption, and an automatic retry mechanism for rate-limited requests.

### Added
PB-51594 Move findAllForActionLogController and test to the correct location
PB-48516 Build process improvement - Webpack
PB-51534 Update group edit call in groupApiService to contain "my_group_user" as urlOptions
PB-51580 PCD 1.1 - Migrate SearchUsersAndGroupsController off ShareModel
PB-51585 PCD 1.2 - Migrate resourceCreateService ShareModel usage to ShareResourceService
PB-51586 PCD 1.3 - Move passbolt.share.get-folders to controller pattern
PB-51587 PCD 1.4 - Clear ShareModel
PB-51588 PCD 1.5 - Migrate MoveFolderController off FolderModel
PB-51589 PCD 1.6 - Migrate MoveOneFolderService off FolderModel
PB-51590 PCD 1.7 - Migrate MoveResourcesService off FolderModel + ResourceModel
PB-51782 PCD 2.01 - Create SynchroniseKeyringController and binding
PB-51783 PCD 2.02 - Create KeyringServiceWorkerService
PB-51785 PCD 2.04 - Create GetOrFindGroupService
PB-51786 PCD 2.05 - Create GetOrFindGroupController and binding
PB-51787 PCD 2.06 - Create GetOrFindGroupsUsersService
PB-51788 PCD 2.07 - Create GetOrFindGroupsUsersController and binding
PB-51789 PCD 2.08 - Create GetOrFindUsersService
PB-51790 PCD 2.09 - Create GetOrFindUsersController and binding
PB-51791 PCD 2.10 - Add new methods getByIds, getGroupsUsersByGropuId on GroupServiceWorkerService
PB-51999 PCD 2.10.B - Consolidate UserEntity between browser extension and styleguide
PB-52000 PCD 2.10.C - Move GroupEntity + GroupsCollection to the styleguide
PB-51792 PCD 2.11 - Create UserServiceWorkerService
PB-51793 PCD 2.12 - Create PermissionServiceWorkerService
PB-51794 PCD 2.13 - Create SearchUsersAndGroupsService
PB-51795 PCD 2.14 - Refactor ShareService into ShareApiService
PB-51796 PCD 2.15 - Update GroupApiService to support the new filter
PB-51798 PCD 2.17 - Update FindAndUpdateGroupsLocalStorageService to add a method findForLocalStorageByIds
PB-51799 PCD 2.18 - Align UserLocalStorage to add memory cache
PB-51800 PCD 2.19 - Rename UserService to UserApiService
PB-52047 CE/PRO upgrade
PB-49605 Grid columns min-width
PB-51808 PCD 2.27 - Create UserPermissionItem
PB-51809 PCD 2.28 - Create GroupUserPermissionItem
PB-47929 PAG - WP1.1 Add pagination support to ResourceService
PB-47930 PAG - WP1.2 Paginate resource fetch for updating local storage in FindResourceService
PB-52056 Add create method to SubscriptionKeyServiceWorkerService
PB-52057 Add delete method to SubscriptionKeyServiceWorkerService
PB-52058 Adapt EditSubscriptionKey to be customizable
PB-52061 Adapt DisplaySubscriptionKeyTeasing to handle upgrade from app
PB-52064 Create ConfirmDowngradeSubscriptionDialog
PB-52062 Adapt DisplaySubscriptionKey to handle downgrading
PB-52128 DisplaySubscriptionKey new layout

### Security
PB-51937 Fix ws GHSA-58qx-3vcg-4xpx - MEDIUM CVSS3.1
PB-51938 Fix brace-expansion GHSA-jxxr-4gwj-5jf2 - MEDIUM CVSS3.1
PB-52029 Fix tmp GHSA-ph9p-34f9-6g65 - HIGH CVSS4.0
PB-51532 Include GitLab file from ci-definitions repo
PB-51642 Fix fast-uri GHSA-q3j6-qgpj-74h6 - HIGH CVSS3.1
PB-51643 Fix @babel/plugin-transform-modules-systemjs GHSA-fv7c-fp4j-7gwp - HIGH CVSS3.1
PB-51940 Fix qs GHSA-q8mj-m7cp-5q26 - MEDIUM CVSS4.0
PB-52030 Fix webpack-dev-server GHSA-79cf-xcqc-c78w - MEDIUM CVSS3.1
PB-51698 Use correct passbolt repo names in safe-chain whitelist

### Fixed
PB-52148 CSP is blocking upload to TOTP QRCode on Firefox
PB-50949 Fix MetadataKeysSettingsLocalStorageContext and MetadataTypesSettingsLocalStorageContext entity issue on storage changes
PB-52047 Fix Passbolt Pro Edition wording
PB-52156 Fix password preview button min-width

### Maintenance
PB-48560 Use NODE_ENV for webpack mode config
PB-48564 Remove grunt-header
PB-48528 Transpile LESS from webpack
PB-48558 Extract translations directly from webpack
PB-48559 Remove rimraf
PB-49064 Remove Grunt
PB-48516 Replace eval sourcemap by inline
PB-48516 Prevent br tags to be added in translations.
PB-48516 Remove duplicated translations
PB-51793: Add PermissionServiceWorkerService and transfer Permission entity and collection on styleguide
PB-51160 Update Firefox manifest to avoid Mozilla warnings
PB-52155 Update github issue template