# v5.15.0
Passbolt 5.15.0 improves form detection for autofill, makes permission changes easier to review, and adds several security and administration improvements. This release also introduces new session management tooling and additional safeguards for Passbolt Pro.

## Clearer permission confirmation changes
The permission confirmation dialog has been visually improved to make access changes clearer before they are applied. Users can now understand the impact of permission changes more clearly before applying them. New badges show whether permissions are being added, modified, or deleted. 

Deleted permissions can also be rolled back to their original state before confirmation, making access changes easier to review and correct.

## Improved autofill 
Passbolt 5.15.0 continues the process to improve the autofill feature in several phases. This first iteration improves detection on websites that were previously unsupported, enhancing the end-user experience by identifying complex forms and simplifying it. 

Upcoming releases will have iterations focusing on reducing false positives and refining  the classification further. 

## Miscellaneous Improvements
### Database-backed sessions for Passbolt API (Beta)

Passbolt API now supports database-backed sessions in beta, helping improve API performance and simplify high-availability deployments without relying on third-party caching systems such as Redis. By removing file-based session locking, requests from the same user can run in parallel, while load-balanced deployments no longer require sticky sessions. 

The feature must be enabled manually by a system administrator.

A new healthcheck now identifies the active session provider, helping administrators verify their session setup. A new purge command can clear stored sessions when needed, while the sessions table is created automatically if it is not already in place.

### Deleted user notifications

Administrators are now notified whenever any user is deleted, giving them better visibility into account removals across the organisation. Previously, notifications were sent only when an administrator was deleted.

## Conclusion
As usual, release 5.15.0 has dependency updates Many thanks to everyone who provided feedback, reported bugs, and contributed to making passbolt better!

## Changelogs
### Added
PB-53103 - AUTOFILL EPIC - Autofill improvements
PB-53105 - Add ShadowDomDictionary and InFormFieldDictionary
PB-53107 - Create ShadowRootResolverService
PB-53108 - Add ShadowRootCollectorService
PB-53109 - Add ShadowRootCacheService
PB-53110 - Add ShadowMutationObserverService
PB-53120 - Add ShadowDomQueryService
PB-53121 - Add ShadowDomFocusHealerService
PB-53122 - Add InFormFieldGeometryService
PB-53123 - Update InFormCallToActionField to use ShadowRootCacheService, ShadowDomQueryService and InFormFieldGeometryService
PB-53124 - Find username element through shadow doms if needed
PB-53125 - Switch from DomUtils to InFormFieldGeometryService in InformMenuField
PB-53126 - Listen for focus event on the whole page to detect missed inputs
PB-53127 - Refactor InFormManager to use previously created services
PB-53128 - Refactor DomUtils
PB-53574 - Shadow dom should solve duck-types as a shadow root
PB-53619 - Shadow dom piercing is missing on the autofill resolver
PB-53394 - Global new design of share dialog

### Fixed
PB-48042 - Sign-in with SSO secondary CTA alignment on sign-in with passphrase page
PB-52353 - Clicking on several items is not possible when filtering the grid by expired
PB-52539 - Left side bar alignment adjustments
PB-53329 - Discrepancy in data (group or member) display when we remove and add them again
PB-53819 - Fix height for share dialog badges and dropdowns
PB-53820 - Fix revert button disappearing at certain widths
PB-53921 - Fix application crash after creating a resource in a shared folder while transferring ownership
PB-53497 - Fix crash when is-authenticated endpoint response is not JSON

### Security
PB-53357 - Fix js-yaml GCVE-0-2026-59869 - HIGH CVSS3.1
PB-53358 - Fix brace-expansion GHSA-3jxr-9vmj-r5cp - HIGH CVSS4.0
PB-53386 - Potential Cross Site Scripting (XSS) via window.location.href (Low)
PB-53391 - Fix svgo GHSA-2p49-hgcm-8545 - HIGH CVSS3.1
PB-53392 - Fix fast-uri GHSA-4c8g-83qw-93j6 - HIGH CVSS3.1
PB-53401 - Fix shell-quote GHSA-395f-4hp3-45gv - HIGH CVSS4.0
PB-53402 - Fix websocket-driver GHSA-xv26-6w52-cph6 - CRITICAL CVSS4.0
PB-53403 - Fix postcss GHSA-r28c-9q8g-f849 - HIGH CVSS3.1
PB-53404 - Fix webpack-dev-server GHSA-m28w-2pqf-7qgj - MEDIUM CVSS3.1
PB-53405 - Fix body-parser GHSA-v422-hmwv-36x6 - LOW CVSS3.1
PB-53550 - Small upgrade for js-yaml (Low)
PB-53552 - Fix fast-uri GHSA-7p8r-x3mc-p8w7 - HIGH CVSS3.1
PB-53559 - Fix brace-expansion GHSA-mh99-v99m-4gvg - HIGH CVSS3.1
PB-53942 - Fix image-size GHSA-5p2g-fcmc-qvqq - HIGH CVSS4.0
PB-53357 - Fix js-yaml GCVE-0-2026-59869 - HIGH CVSS3.1
PB-53358 - Fix brace-expansion GHSA-3jxr-9vmj-r5cp - HIGH CVSS4.0
PB-53385 - Fix adm-zip GHSA-xcpc-8h2w-3j85 - HIGH CVSS3.1
PB-53391 - Fix svgo GHSA-2p49-hgcm-8545 - HIGH CVSS3.1
PB-53392 - Fix fast-uri GHSA-4c8g-83qw-93j6 - HIGH CVSS3.1
PB-53401 - Fix shell-quote GHSA-395f-4hp3-45gv - HIGH CVSS4.0
PB-53550 - Small upgrade for js-yaml (Low)
PB-53552 - Fix fast-uri GHSA-7p8r-x3mc-p8w7 - HIGH CVSS3.1
PB-53553 - Fix undici GHSA-4cwx-7wf7-3272 - HIGH CVSS3.1
PB-53559 - Fix brace-expansion GHSA-mh99-v99m-4gvg - HIGH CVSS3.1
PB-53940 - Small upgrade for @xmldom/xmldom (High)

### Maintenance
PB-53204 - Reverse passboltEnvPlugin logic
PB-53671 - Replace the forked secrets.js library with a native randomHex 
PB-53764 - Update Storybook libraries in passbolt-styleguide to remove vulnerable dependencies while keeping the Storybook scripts functional
PB-53934 - Use correct version for github-pages-deploy-action
PB-53972 - Clean comment in ShareDialog