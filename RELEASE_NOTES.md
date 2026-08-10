# v5.14.4
Passbolt 5.14.4 is a dedicated Safari extension release and introduces explicit permission confirmation prompts to improve control over shared resources. It also includes scalability and monitoring improvements for larger deployments, security updates, and bug fixes including a Safari specific one.

## Sharing transparency
Users now receive an explicit confirmation dialog before creating items in shared folders or editing shared resources. This provides full permission transparency before changes take effect, preventing accidental privilege exposure.

In addition, when a group appeared in the access list, its individual members were not visible, making it difficult to assess the actual reach of shared access. Group members are now displayed directly within the dialog.

As the first stage of a broader security initiative, future updates will extend these confirmations to folder move operations and offer enhanced permission preview dialogs.

## Scalability and monitoring
Administrators who monitor their instance through the healthcheck status endpoint (/healthcheck/status.json) will get a more complete signal. This endpoint now verifies the availability of the caching system.

For organisations that manage large numbers of credentials, the browser extension now starts paginating resource fetching, which reduces server load. This is part of a continuous effort to improve passbolt scalability, with folder pagination being next in line.

## Maintenance and security
This release fixes a number of bugs, among them an issue that prevented Safari from redirecting to a newly created resource. It also ships third-party dependency upgrades and security advisory fixes. Check the detailed logs below for the full list.

## Resource Suggestions
Suggested resources in the browser extension are now ranked using an improved URL relevance algorithm. Exact URL matches appear first, followed by parent paths and domain matches, allowing users to select the correct credentials faster and with fewer autofill errors.

## Additional Improvements
Passbolt Pro extends email-free account setup and recovery to OIDC and ADFS SSO providers, improving onboarding by integrating directly with enterprise identity management systems.

Finally, this release lays the foundational backend architecture required for upcoming offline functionality.

## Conclusion
Many thanks to everyone who provided feedback for the permission confirmation feature, reported bugs, and contributed to making Passbolt better!

## Changelogs
### Added
PB-51594 - Move findAllForActionLogController and test to the correct location
PB-48516 - Build process improvement - Webpack
PB-51534 - Update group edit call in groupApiService to contain "my_group_user" as urlOptions
PB-51580 - PCD 1.1 - Migrate SearchUsersAndGroupsController off ShareModel
PB-51585 - PCD 1.2 - Migrate resourceCreateService ShareModel usage to ShareResourceService
PB-51586 - PCD 1.3 - Move passbolt.share.get-folders to controller pattern
PB-51587 - PCD 1.4 - Clear ShareModel
PB-51588 - PCD 1.5 - Migrate MoveFolderController off FolderModel
PB-51589 - PCD 1.6 - Migrate MoveOneFolderService off FolderModel
PB-51590 - PCD 1.7 - Migrate MoveResourcesService off FolderModel + ResourceModel
PB-51782 - PCD 2.01 - Create SynchroniseKeyringController and binding
PB-51783 - PCD 2.02 - Create KeyringServiceWorkerService
PB-51785 - PCD 2.04 - Create GetOrFindGroupService
PB-51786 - PCD 2.05 - Create GetOrFindGroupController and binding
PB-51787 - PCD 2.06 - Create GetOrFindGroupsUsersService
PB-51788 - PCD 2.07 - Create GetOrFindGroupsUsersController and binding
PB-51789 - PCD 2.08 - Create GetOrFindUsersService
PB-51790 - PCD 2.09 - Create GetOrFindUsersController and binding
PB-51791 - PCD 2.10 - Add new methods getByIds, getGroupsUsersByGropuId on GroupServiceWorkerService
PB-51999 - PCD 2.10.B - Consolidate UserEntity between browser extension and styleguide
PB-52000 - PCD 2.10.C - Move GroupEntity + GroupsCollection to the styleguide
PB-51792 - PCD 2.11 - Create UserServiceWorkerService
PB-51793 - PCD 2.12 - Create PermissionServiceWorkerService
PB-51794 - PCD 2.13 - Create SearchUsersAndGroupsService
PB-51795 - PCD 2.14 - Refactor ShareService into ShareApiService
PB-51796 - PCD 2.15 - Update GroupApiService to support the new filter
PB-51798 - PCD 2.17 - Update FindAndUpdateGroupsLocalStorageService to add a method findForLocalStorageByIds
PB-51799 - PCD 2.18 - Align UserLocalStorage to add memory cache
PB-51800 - PCD 2.19 - Rename UserService to UserApiService
PB-52047 - CE/PRO upgrade
PB-49605 - Grid columns min-width
PB-51808 - PCD 2.27 - Create UserPermissionItem
PB-51809 - PCD 2.28 - Create GroupUserPermissionItem
PB-47929 - PAG - WP1.1 Add pagination support to ResourceService
PB-47930 - PAG - WP1.2 Paginate resource fetch for updating local storage in FindResourceService
PB-52056 - Add create method to SubscriptionKeyServiceWorkerService
PB-52057 - Add delete method to SubscriptionKeyServiceWorkerService
PB-52058 - Adapt EditSubscriptionKey to be customizable
PB-52061 - Adapt DisplaySubscriptionKeyTeasing to handle upgrade from app
PB-52064 - Create ConfirmDowngradeSubscriptionDialog
PB-52062 - Adapt DisplaySubscriptionKey to handle downgrading
PB-52128 - DisplaySubscriptionKey new layout
PB-45405 - Sort suggested resources by relevance instead of URI lengths
PB-51236 - OFM - WP2.3 Create SiteSettingsLocalStorage
PB-51476 - Add support for ADFS and OIDC on the account recovery with SSO workflow
PB-51810 - PCD 2.29 - Create GroupPermissionItem
PB-51811 - PCD 2.30 - Remove SharePermissionItem
PB-51813 - PCD 2.32 - Update CreateResource to call the workflow handler
PB-51814 - PCD 2.33 - Create PermissionServiceWorkerService
PB-51826 - PCD 3.01 - Update EditResource to call the workflow handler
PB-51828 - PCD 3.03 - Add edition handling in HandlePermissionWorkflow
PB-51829 - PCD 3.04 - Update resourceUpdateService to get permissions list from the styleguide
PB-51830 - PCD 3.05 - Update EditResource to display dialog
PB-51831 - PCD 3.06 - Update DisplayResourcesListContextualMenu to trigger HandlePermissionWorkflow
PB-51832 - PCD 3.07 - Update DisplayResourcesWorkspaceMenu to trigger HandlePermissionWorkflow
PB-51833 - PCD 3.08 - Handle read-only mode in permission dialog
PB-51835 - PCD 4.01 - Add share handling in HandlePermissionWorkflow
PB-51836 - PCD 4.02 - Adapt PermissionServiceWorkerService (savePermissions)
PB-51838 - PCD 4.04 - Update DisplayResourcesListContextualMenu to trigger HandlePermissionWorkflow from sharing
PB-51839 - PCD 4.05 - Update DisplayResourcesWorkspaceMenu to trigger HandlePermissionWorkflow from sharing
PB-52205 - OFM - WP1.4 Create SiteSettingsEntity
PB-52213 - OFM - WP3.4 Create SiteSettingsApiService
PB-52215 - OFM - WP4.18 Create GetOrFindSiteSettingsService
PB-52216 - OFM - WP4.19 Create FindSiteSettingsService
PB-52217 - OFM - WP4.20 findAndUpdateSiteSettingsLocalStorageService
PB-52350 - LS - WP1.1 Create local storage online session entity
PB-52352 - LS - WP1.2 Create local storage metadata entity
PB-52354 - LS - WP2.1 Create online session local storage
PB-52363 - LS - WP2.2 Create abstract local storage
PB-52374 - LS - WP2.3 Migrate Rbac local storage
PB-52375 - LS - WP2.4 Migrate Resource types local storage
PB-52411 - LS - WP2.5 Migrate UserMe local storage
PB-52412 - LS - WP2.6 Remove AuthStatus local storage to use ActiveSession local storage
PB-52447 - LS - WP3.1 Update GetOrFindRbacService
PB-52451 - LS - WP3.2 Create GetOrFindMeService and remove userModel getOrFindMe
PB-52460 - LS - WP 3.3 Create GetOrFindResourceTypes and remove resourceTypeModel getOrFindAll
PB-52713 - SORTURL - WP 1.1 - Implement url sorting algorithm in sortUtils
PB-52714 - SORTURL - WP 1.2 - Use sortUtils in HomePage
PB-52715 - SORTURL - WP 1.3 - Use sortUtils in InformMenuController
PB-52965 - HLL - WP 4.1 Hide the last logged in column for non admins
PB-52977 - PCD 6.26 - Fix group member count display on newly added group
PB-53028 - PCD 6.27 - Adapt Permission confirmation dialog title based on the ran process
PB-52536 - Display passbolt edition in right sidebar footer

### Fixed
PB-50607 - Inject In-form menu CTA container inside Dialog element
PB-50876 - Secret history doesn't take in consideration RBAC cfg
PB-51920 - Multiple autofill issues
PB-52683 - Fix missing translation in healthcheck page
PB-52799 - In-Form menu CTA not visible anymore
PB-52357 - Mark "OpenId Configuration Path" as a required field in SSO
PB-52938 - Fix the subscriptionKey button not appearing when API is below than 5.13
PB-53406 - PCD: do not display when editing a shared resource metadata only
PB-53417 - PCD: creation of a shared resource in a non owned folder should display the PCD in read-only
PB-53546 - SiteSettings: Fix passbolt.plugins.inFormIntegration.enabled type from string to boolean
PB-52148 - CSP is blocking upload to TOTP QRCode on Firefox
PB-50949 - Fix MetadataKeysSettingsLocalStorageContext and MetadataTypesSettingsLocalStorageContext entity issue on storage changes
PB-52047 - Fix Passbolt Pro Edition wording
PB-52156 - Fix password preview button min-width
PB-52478 - Hide subscription CTA when edition plugin is not present
PB-51699 - Fix adding a user to a large group
PB-53681 - Safari applies URLs redirection on created resource too early

### Maintenance
PB-48560 - Use NODE_ENV for webpack mode config
PB-48564 - Remove grunt-header
PB-48528 - Transpile LESS from webpack
PB-48558 - Extract translations directly from webpack
PB-48559 - Remove rimraf
PB-49064 - Remove Grunt
PB-48516 - Replace eval sourcemap by inline
PB-48516 - Prevent br tags to be added in translations.
PB-48516 - Remove duplicated translations
PB-51793 - Add PermissionServiceWorkerService and transfer Permission entity and collection on styleguide
PB-51160 - Update Firefox manifest to avoid Mozilla warnings
PB-52155 - Update github issue template
PB-50075 - Remove DisplayUserDetailsActivity
PB-51917 - Remove getOrFindAll from UserModel
PB-52199 - Remove formatOrderOptions reference in API services as it is not in use
PB-52298 - Cover admin edition management journeys with end to end tests
PB-52467 - Pin js dependencies in lockfile
PB-52606 - Assert Subscription Details
PB-52607 - Assert Current Subscription Edition
PB-52609 - Upgrade to Pro
PB-52612 - Downgrade to CE
PB-52613 - Edit the organization subscription key in adminer
PB-52614 - Notify user of successful downgrade, Expire User's Session and Re-authenticate the user
PB-52615 - Assert Subscription Panel
PB-52691 - Retry In-form menu CTA injection when DOM changes are detected
PB-52711 - Create new subscription key using rsa public/private keys to avoid exposing production valid subscription key
PB-52542 - Update subscription page design
PB-52584 - Downgrade to CE design
PB-52428 - Add UTM parameters to subscription page links

### Security
PB-49150 - Aikido#915877 Potential Cross Site Scripting (XSS) via window.location.href - passbolt-styleguide (info)
PB-51261 - Major upgrade for i18next (High)
PB-51937 - Fix ws GHSA-58qx-3vcg-4xpx - MEDIUM CVSS3.1
PB-51938 - Fix brace-expansion GHSA-jxxr-4gwj-5jf2 - MEDIUM CVSS3.1
PB-52029 - Fix tmp GHSA-ph9p-34f9-6g65 - HIGH CVSS4.0
PB-51532 - Include GitLab file from ci-definitions repo
PB-51642 - Fix fast-uri GHSA-q3j6-qgpj-74h6 - HIGH CVSS3.1
PB-51643 - Fix @babel/plugin-transform-modules-systemjs GHSA-fv7c-fp4j-7gwp - HIGH CVSS3.1
PB-51940 - Fix qs GHSA-q8mj-m7cp-5q26 - MEDIUM CVSS4.0
PB-52030 - Fix webpack-dev-server GHSA-79cf-xcqc-c78w - MEDIUM CVSS3.1
PB-51698 - Use correct passbolt repo names in safe-chain whitelist
PB-52333 - Improper Access Control in portManager (Info)
PB-52334 - Improper Input Validation in resourcesKdbxExporter (Medium)
PB-52485 - Fix esbuild GHSA-gv7w-rqvm-qjhr - HIGH CVSS3.1
PB-52538 - Major upgrade for js-yaml (Medium)
PB-52554 - Fix ws GHSA-96hv-2xvq-fx4p - HIGH CVSS 3.1
PB-52555 - Fix launch-editor GHSA-v6wh-96g9-6wx3 - MEDIUM CVSS4.0
PB-52556 - Fix tmp GHSA-7c78-jf6q-g5cm - HIGH CVSS3.1
PB-52557 - Fix form-data GHSA-hmw2-7cc7-3qxx - HIGH CVSS4.0
PB-52558 - Fix @babel/core GHSA-4x5r-pxfx-6jf8 - LOW CVSS3.1
PB-52601 - Fix undici GHSA-vmh5-mc38-953g - HIGH CVSS3.1
PB-52602 - Fix http-proxy-middleware GHSA-64mm-vxmg-q3vj - MEDIUM CVSS4.0
PB-52603 - Fix webpack-dev-server GHSA-mx8g-39q3-5c79 - MEDIUM CVSS3.1
PB-52611 - Small upgrade for serialize-javascript (High)
PB-52621 - Fix undici GHSA-g8m3-5g58-fq7m - HIGH CVSS 3.1
