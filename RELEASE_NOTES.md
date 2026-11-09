Release song - TBD

# v5.18.0
Passbolt 5.18.0 provide 2 new themes, generic healthcheck message on the organisation settings, improvements on the offline mode and availability for all content type in the quickaccess.
It comes also with security fixes and posture improvements.

## Changelogs
### Added
- PB-54816 - OFM - CE admins need to be informed why their offline-settings forms are disabled
- PB-54834 - OFM - Quickaccess - Notes and custom fields are searchable
- PB-54835 - Quickaccess - Notes and custom fields are viewable quick access resource view page
- PB-54836 - OFM - Notes and custom fields are now available offline
- PB-54910 - GenHC - WP 5.2 - Implement healthcheckCheckEntity and healthcheckChecksCollection, including the grouping by domain_key
- PB-54911 - GenHC - WP 5.3 - Move AdministrationHealthcheckContext onto the checks collection
- PB-54912 - GenHC - WP 5.4 - Delete the legacy healthcheck entity tree, its fixtures and the unused HealthcheckModel
- PB-54916 - GenHC - WP 6.2 - Implements code review
- PB-54917 - GenHC - WP 6.3 - Rebuild the Storybook stories on captured v5 payloads
- PB-54947 - GenHC - WP 7.1 - Restate the sidebar legend to match the status badge markup
- PB-54948 - GenHC - WP 7.2 - Collapsible domains and collapsible help, with aria-expanded controls and state reset on reload
- PB-54949 - GenHC - WP 7.3 - Rework healthcheck.less: generic section class, badge tints, disclosure rules, help-list and long-string wrapping
- PB-55174 - Styleguide: Note row on the v5-default, v5-default-with-totp and PIN code page
- PB-55444 - Styleguide: Custom fields on the v5-default and v5-default-with-totp pages
- PB-55521 - Create ThemesApiService
- PB-55522 - Create FindThemesService
- PB-55523 - Create UpdateThemeService
- PB-55524 - Create FindThemesController
- PB-55525 - Create UpdateThemeController
- PB-55527 - Update allowed-theme list in config and other files
- PB-55528 - Styleguide: Add the two new palettes and less files
- PB-55529 - Styleguide: Update DisplayUserTheme
- PB-55583 - DVS - WP1.1 - Add the duoVerifySubscriber property to MfaModel
- PB-55584 - DVS - WP1.2 - Add the verifySubscriber property to the Duo DTO
- PB-55585 - DVS - WP1.3 - Add setDuoToggle and hasDuoVerifySubscriberLockoutRisk to AdministrationMfaContext
- PB-55586 - DVS - WP1.4 - Add the Verify the Duo subscriber toggle and the lockout warning banner to DisplayMfaAdministration
- PB-55587 - Add Duo setup constants in MFAContext
- PB-55591 - Add DuoSetupError page
- PB-55593 - Fix MFA provider config visible when not enabled + handle DUO errors
- PB-55594 - DVS - WP3.1 - Add the flash error message style
- PB-55651 - GenHC - WP 7.4 - Per-theme status badge glyph colours
- PB-55736 - Add Netwrix CSV import format
- PB-55870 - Create sessionTimestampsEntity
- PB-55871 - Create sessionTimestampsLocalStorage
- PB-55872 - Create getSessionTimestampsService
- PB-55873 - Create updateSessionTimestampsService
- PB-55874 - Create getSessionTimestampsController and event
- PB-55875 - Create sessionTimestampsServiceWorkerService

### Fixed
- PB-52360 - Downgrading from PRO to CE do not remove SSO login
- PB-54070 - User with can update right can't delete a resource when right clicking it
- PB-53271 - refresh user account recovery status for all recovery policy change
- PB-55472 - Offline mode is lost at every sign-out for users with non-standard email addresses allowed by PASSBOLT_EMAIL_VALIDATE_REGEX
- PB-55733 - Autofill - account name should not be consider as username
- PB-55777 - Fix Groups and Tag Rows padding
- PB-55893 - Fix lower tier fields selected before higher one if they come earlier in DOM tree
- PB-55894 - Fix ambiguous labels classification

### Security
- PB-52330 - parseSetupUrl regular expression is reinforced
- PB-52331 - Ensures custom fields cannot be previewed on the right sidebar if the user does not have the permission to
- PB-54930 - enable strict integrity validation in package.json
- PB-54931 - enable package name validation in package-lock.json
- PB-55900 - Fix i18next-http-backend multiple CVEs - CVSS3.1 LOW
- PB-55968 - Align package.json order on the bext

### Maintenance
- PB-50131 - Rename "Account Recovery" Column in Users Table for clarity
- PB-52539 - The left sidebar has been adjusted
- PB-54921 - removed unused filter method
- PB-55095 - Index permissions and changes by recipient
- PB-55131 - Speed up opening the move dialog
- PB-55132 - Cache group members in the share dialog
- PB-55133 - Cache the "resource without owner" check
- PB-55134 - Aggregate the permission rows from the indexes
- PB-55135 - Remove the fake change for new recipients
- PB-55202 - Remove chromium-mv2 (Edge) related build scripts
- PB-55204 - Remove files that were used for Edge MV2 extension
- PB-55259 - Optimize toDto conversion in ShareDialog.buildResourceDto
- PB-55514 - Improve autofill performances and skip disabled inputs
- PB-55543 - Clarify WebAuthn error on the MFA organisation settings page
- PB-55590 - Forward error code from main page URL to iframe URL
- PB-55672 - WinApp passkeys setup should not be visible
- PB-55682 - Fix random points positioning
- PB-55795 - Polish preview and copy button
- PB-55876 - Move the timestamp writes and reads in services to the new timestamp services
- PB-55877 - Remove timestamps from activeSession entity and move activeSession to session storage
- PB-55878 - Handle extension update for active session in session storage
- PB-55965 - OFM - WP0.1 App events should use api client option from parameter
- PB-55966 - OFM - WP0.2 AccountRecoverySaveUserSettingsController should use the user id from account
- PB-56068 - OFM - WP0.3 Use account domain in ParseAuthUrlService
- PB-56070 - OFM - WP0.4 Use account domain in ParseAppUrlService
- PB-56071 - OFM - WP0.5 Use account domain in ParseWebIntegrationUrlService
- PB-56086 - OFM - WP0.6 Use account in toolbar service instead of user get instance
- PB-56147 - OFM - WP0.7 Use account in config events instead of user get instance
