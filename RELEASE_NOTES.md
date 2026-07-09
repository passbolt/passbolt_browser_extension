# v5.14.0

### Added
- PB-45405 - Sort suggested resources by relevance instead of URI lengths
- PB-51236 - OFM - WP2.3 Create SiteSettingsLocalStorage
- PB-51476 - Add support for ADFS and OIDC on the account recovery with SSO workflow
- PB-51810 - PCD 2.29 - Create GroupPermissionItem
- PB-51811 - PCD 2.30 - Remove SharePermissionItem
- PB-51813 - PCD 2.32 - Update CreateResource to call the workflow handler
- PB-51814 - PCD 2.33 - Create PermissionServiceWorkerService
- PB-51826 - PCD 3.01 - Update EditResource to call the workflow handler
- PB-51828 - PCD 3.03 - Add edition handling in HandlePermissionWorkflow
- PB-51829 - PCD 3.04 - Update resourceUpdateService to get permissions list from the styleguide
- PB-51830 - PCD 3.05 - Update EditResource to display dialog
- PB-51831 - PCD 3.06 - Update DisplayResourcesListContextualMenu to trigger HandlePermissionWorkflow
- PB-51832 - PCD 3.07 - Update DisplayResourcesWorkspaceMenu to trigger HandlePermissionWorkflow
- PB-51833 - PCD 3.08 - Handle read-only mode in permission dialog
- PB-51835 - PCD 4.01 - Add share handling in HandlePermissionWorkflow
- PB-51836 - PCD 4.02 - Adapt PermissionServiceWorkerService (savePermissions)
- PB-51838 - PCD 4.04 - Update DisplayResourcesListContextualMenu to trigger HandlePermissionWorkflow from sharing
- PB-51839 - PCD 4.05 - Update DisplayResourcesWorkspaceMenu to trigger HandlePermissionWorkflow from sharing
- PB-52205 - OFM - WP1.4 Create SiteSettingsEntity
- PB-52213 - OFM - WP3.4 Create SiteSettingsApiService
- PB-52215 - OFM - WP4.18 Create GetOrFindSiteSettingsService
- PB-52216 - OFM - WP4.19 Create FindSiteSettingsService
- PB-52217 - OFM - WP4.20 findAndUpdateSiteSettingsLocalStorageService
- PB-52350 - LS - WP1.1 Create local storage online session entity
- PB-52352 - LS - WP1.2 Create local storage metadata entity
- PB-52354 - LS - WP2.1 Create online session local storage
- PB-52363 - LS - WP2.2 Create abstract local storage
- PB-52374 - LS - WP2.3 Migrate Rbac local storage
- PB-52375 - LS - WP2.4 Migrate Resource types local storage
- PB-52411 - LS - WP2.5 Migrate UserMe local storage
- PB-52412 - LS - WP2.6 Remove AuthStatus local storage to use ActiveSession local storage
- PB-52447 - LS - WP3.1 Update GetOrFindRbacService
- PB-52451 - LS - WP3.2 Create GetOrFindMeService and remove userModel getOrFindMe
- PB-52460 - LS - WP 3.3 Create GetOrFindResourceTypes and remove resourceTypeModel getOrFindAll
- PB-52713 - SORTURL - WP 1.1 - Implement url sorting algorithm in sortUtils
- PB-52714 - SORTURL - WP 1.2 - Use sortUtils in HomePage
- PB-52715 - SORTURL - WP 1.3 - Use sortUtils in InformMenuController
- PB-52965 - HLL - WP 4.1 Hide the last logged in column for non admins
- PB-52977 - PCD 6.26 - Fix group member count display on newly added group
- PB-53028 - PCD 6.27 - Adapt Permission confirmation dialog title based on the ran process
- PB-52536 - Display passbolt edition in right sidebar footer

### Fixed
- PB-50607 - Inject In-form menu CTA container inside Dialog element
- PB-50876 - Secret history doesn't take in consideration RBAC cfg
- PB-51920 - Multiple autofill issues
- PB-52683 - Fix missing translation in healthcheck page
- PB-52799 - In-Form menu CTA not visible anymore
- PB-52357 - Mark "OpenId Configuration Path" as a required field in SSO
- PB-52938 - Fix the subscriptionKey button not appearing when API is below than  5.13

### Maintenance
- PB-50075 - Remove DisplayUserDetailsActivity
- PB-51917 - Remove getOrFindAll from UserModel
- PB-52199 - Remove `formatOrderOptions` reference in API services as it is not in use
- PB-52298 - Cover admin edition management journeys with end to end tests
- PB-52467 - Pin js dependencies in lockfile
- PB-52606 - Assert Subscription Details
- PB-52607 - Assert Current Subscription Edition
- PB-52609 - Upgrade to Pro
- PB-52612 - Downgrade to CE
- PB-52613 - Edit the organization subscription key in adminer
- PB-52614 - Notify user of successful downgrade, Expire User's Session and Re-authenticate the user
- PB-52615 - Assert Subscription Panel
- PB-52691 - Retry In-form menu CTA injection when DOM changes are detected
- PB-52711 - Create new subscription key using rsa public/private keys to avoid exposing production valid subscription key
- PB-52542 - Update subscription page design
- PB-52584 - Downgrade to CE design

### Security
- PB-49150 - Aikido#915877 Potential Cross Site Scripting (XSS) via window.location.href - passbolt-styleguide (info)
- PB-51261 - Major upgrade for i18next (High)
- PB-52333 - Improper Access Control in portManager (Info)
- PB-52334 - Improper Input Validation in resourcesKdbxExporter (Medium)
- PB-52485 - Fix esbuild GHSA-gv7w-rqvm-qjhr - HIGH CVSS3.1
- PB-52538 - Major upgrade for js-yaml (Medium)
- PB-52554 - Fix ws GHSA-96hv-2xvq-fx4p - HIGH CVSS 3.1
- PB-52555 - Fix launch-editor GHSA-v6wh-96g9-6wx3 - MEDIUM CVSS4.0
- PB-52556 - Fix tmp GHSA-7c78-jf6q-g5cm - HIGH CVSS3.1
- PB-52557 - Fix form-data GHSA-hmw2-7cc7-3qxx - HIGH CVSS4.0
- PB-52558 - Fix @babel/core GHSA-4x5r-pxfx-6jf8 - LOW CVSS3.1
- PB-52601 - Fix undici GHSA-vmh5-mc38-953g - HIGH CVSS3.1
- PB-52602 - Fix http-proxy-middleware GHSA-64mm-vxmg-q3vj - MEDIUM CVSS4.0
- PB-52603 - Fix webpack-dev-server GHSA-mx8g-39q3-5c79 - MEDIUM CVSS3.1
- PB-52611 - Small upgrade for serialize-javascript (High)
- PB-52621 - Fix undici GHSA-g8m3-5g58-fq7m - HIGH CVSS 3.1
- PB-52719 - Potential Cross Site Scripting (XSS) via window.location.href (Medium)