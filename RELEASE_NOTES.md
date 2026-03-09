Passbolt 5.10.0 is the first version of Passbolt that officially supports Safari. Also, this version comes with tags in the grid and security improvements regarding CSV exports.

# Safari is now supported

Passbolt 5.10.0 adds Safari as a supported browser. Safari has its own specificities and limitations, therefore features like avatars are disabled.

# TOTP Autofill

Passbolt 5.10.0 now automatically fills the one-time password directly into login forms, just like it does with usernames and passwords. This seamless integration simplifies your multi-factor authentication by eliminating manual copying.

# Tags are visible in the grid

This version also releases modernization of the tag codebase. This allows us to present these tags in the grid but also paves the way for further improvement of this feature.

# CSV export security update

CSV export has been updated to reinforce Passbolt's security postures. Some spreadsheet software that supports CSV also executes formulas when opening these files. It's a security issue that has been tackled in this version in 2 ways:
the CSV exports are disabled by default (import is still working) and can be reenabled via a server configuration
When CSV exports are enabled, a confirmation checkbox is displayed to ensure the users know what are the risks of this kind of export. Exported values are not modified to keep data integrity

# React 18 migration

The migration to React 18 is a significant step toward modernizing the application's entire codebase. This update improves the code and brings performance optimizations for our users.

# Conclusion
3 long awaited features are finally out: Safari, TOTP autofill and tags in the grid.

### Added
- PB-28063 Activate Safari support in the styleguide
- PB-29275 SAF - WP2.10 Add Safari as supported extension
- PB-29292 SAF - WP2.11 Fix quickaccess opening on Safari
- PB-29605 SAF - WP2.7 Fix detached quickaccess not being closed after "use on this page" click
- PB-36503 Browser extension causes performance degradation on some websites
- PB-36503 Browser extension causes performance degradation on some websites
- PB-43353 SAF - WP2.8 Fix file download on Safari
- PB-43355 SAF - WP2.9 Fix quickaccess animations
- PB-43997 SAF - WP1 Update the Safari browser extension build
- PB-44342 SAF - WP2.1 Provide Safari with its own polyfill
- PB-44343 SAF - WP2.2 Remove unsupported index.js callback
- PB-44345 SAF - WP2.4 fix the CSS injection in styleguide.js
- PB-45869 SAF - WP2.13 Implement file download using the native messaging
- PB-45870 SAF - WP2.14 Implement a custom fetch using the native messaging
- PB-46265 SAF - WP2.15 Fix authentication with MFA in the quickaccess
- PB-46679 SAF - Fix bold font rendering
- PB-47765 Tags modernization
- PB-47777 Migrate tags logic from components to TagServiceWorkerService
- PB-47789 REACT18 - Update ReactDom render to createRoot
- PB-47992 REACT 18 - migration of ResourceWorkspaceContext
- PB-48158 REACT 18 - Implement the migration of Dialog and Progress Contexts
- PB-48240 REACT18 - UserWorkspace migration
- PB-48252 REACT18 - Migrate ExtAppContext
- PB-48253 SAF - Temporarily remove Avatar download to avoid user being signed out
- PB-48258 SAF - Temporarily remove "upload avatar" feature
- PB-48337 REACT18 - Update contexts that should use functional update
- PB-48338 REACT18 - Update shared components that should use functional update
- PB-48339 REACT18 - Update quickaccess components that should use functional update
- PB-48340 REACT18 - Update authentication components that should use functional update
- PB-48342 REACT18 - Update user setting components that should use functional update
- PB-48343 REACT18 - Update administration components that should use functional update
- PB-48360 REACT18 - Update resource components that should use functional update
- PB-48363 REACT18 - Update user components that should use functional update
- PB-48366 REACT18 - Remove await set state in contexts
- PB-48384 REACT18 - Remove await setState in components and apps
- PB-48404 REACT18 - Object.assign should use functional set state for context
- PB-48408 CSV - WP1.2 Add a warning message when user is selecting a CSV format on the button
- PB-48416 CSV - WP2.9 Check if the setting is enabled when displaying the csv format on exportFormats
- PB-48419 REACT18 - Update the components to use functional setState
- PB-48425 REACT18 - Form validation should not check errors in the state for component
- PB-48470 Create ColumnTagsModel component
- PB-48471 TAGRID-1.2 Create CellTags component and make it resizable
- PB-48472 TAGRID-1.3 Add ColumnTagsModel and CellTags to DisplayResourcesList
- PB-48473 TAGRID-1.4 Clicking on a tag should filter the workspace
- PB-48521 Harmonise tags style
- PB-48553 SAF - Use webNavigation instead of tab update to improve navigation performances
- PB-49070 REACT18 - Migrate SSOContext for react-extension
- PB-49085 REACT18 - Migrate tests to remove legacyRoot true
- PB-49092 TAGRID-1.6 Hovering the tag on the resource detail should display tooltip
- PB-49106 CSV - WP2.2 Implement the exportPoliciesSettingsEntity
- PB-49107 CSV - WP2.3 Implement the exportPoliciesSettingsApiService
- PB-49108 CSV - WP2.4 Implement the findExportPoliciesSettingsService
- PB-49109 CSV - WP2.5 Implement findExportPoliciesSettingsController
- PB-49110 CSV - WP2.7 Implement exportPoliciesSettingsServiceWorkerService
- PB-49134 REACT18 - Migrate ApiAppContext
- PB-49137 CSV - WP2.8 Implement the ExportPoliciesContext
- PB-49138 CSV - WP2.6 Add event to find export policies settings
- PB-49172 REACT18 - Rename method in DisplaySelfRegistrationAdminstration
- PB-49248 REACT 18 - Revert functional setstate
- PB-49262 REACT18 - revert functional setstate in contexts and components
- PB-49270 SAF - Fix Safari Users settings for Duo MFA configuration
- PB-49293 TOTP Autofill
- PB-49294 Send TOTP through port to fill from in-form menu or quickaccess

### Fixed
- PB-48468 Fix layout when an announcement is visible
- PB-49330 Alignment issues in 2FA Yubikey login page

### Maintenance
- PB-47191 Review Dependabot alert for useless regular expression escape in browser extension
- PB-47542 Add unit tests to roleApiService
- PB-47713 REACT18- 10.2 Implement migration for QuickAccess
- PB-48088 Remove console errors related to pagemod page detection
- PB-48242 Remove dev phantom dependencies
- PB-48375 Add tests to gpg user id parser
- PB-48467 Add unit test to improve coverage on Allowed Content type page
- PB-49472 Remove unnecessary permissions from entitlements and project
- PB-49631 Optimize getFirst function

### Security
- PB-48025 Major upgrade for pino (Medium) - passbolt-browser-extension
- PB-48039 Small upgrade for validator (Medium) - styleguide
- PB-48256 Small upgrade for lodash-es (Medium) - all-projects
- PB-48257 Small upgrade for lodash (Medium) - all projects
- PB-48527 Small upgrade for locutus (Critical) - passbolt-windows
- PB-48535 NPM - Remove now unnecessary overrides in package.json for styleguide and bext
- PB-49119 Remove dev phantom dependencies - node-fetch
- PB-49120 Remove dev phantom dependencies - history
- PB-49121 Remove dev phantom dependencies - expect
- PB-49369 Fix GCVE-0-2026-2391 - Medium CVSS4.0
- PB-49372 Fix GCVE-0-2025-68458 & GCVE-0-2025-68157 - LOW CVSS3.1
- PB-49373 Fix GCVE-0-2026-25547 - CRITICAL CVSS4.0
- PB-49432 Fix GCVE-0-2025-69873 - MEDIUM CVSS4.0
- PB-49452 Fix GHSA-3ppc-4f35-3m26 - HIGH CVSS4.0
- PB-49454 Update CSPs to allow inline <style> in SVGs
