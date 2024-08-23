Song: https://www.youtube.com/watch?v=VmtU-bLyReU

This release candidate addresses several bugs reported by the community. Additionally, it includes numerous maintenance updates as part of our ongoing efforts to ensure a smooth transition and support for the upcoming v5.

Thank you to the community for reporting these issues.


## [4.9.2] - 2024-08-26
### Fixed
- PB-33861: Resources with personal field set to null should be considered as personal resources
- PB-34314: Fix shadow-dom autofill fields
- PB-34236: Fix Retrieving folder activities displaying no data

### Maintenance
- PB-34313: Add resources type retrieval requirements documentation
- PB-34259: E2EE WP1 - Transform dtos from v4 to v5
- PB-34260: E2EE WP1 - Display resource sidebar information section in v5
- PB-34261: E2EE WP1 - Display resource sidebar activity section in v5
- PB-34262: E2EE WP1 - Display resource sidebar description section in v5
- PB-34263: E2EE WP1 - Display copy username to clipboard from more menu using v5
- PB-34264: E2EE WP1 - Display resource grid using v5
- PB-34265: E2EE WP1 - Display resource grid contextual menu using v5
- PB-34266: E2EE WP1 - Display quickaccess resource view page in v5
- PB-34267: E2EE WP1 - Display quickaccess home page in v5
- PB-34268: E2EE WP1 - Display inform menu in v5
- PB-34269: E2EE WP1 - Autofill resources from Quickaccess in v5 format
- PB-34270: E2EE WP1 - Make resource entity compatible with v4 and v5
- PB-34271: E2EE WP1 - Display inform and toolbar suggested resources badge CTA in v5
- PB-34272: E2EE WP1 - Search resource in webapp using v5
- PB-34287: E2EE WP1 - Create password resource from webapp in v5 format
- PB-34288: E2EE WP1 - Create standalone TOTP resource in v5 format
- PB-34289: E2EE WP1 - Edit password resource in v5 format
- PB-34290: E2EE WP1 - Edit standalone TOTP resource in v5 format
- PB-34291: E2EE WP1 - Edit resource description from sidebar in v5 format
- PB-34292: E2EE WP1 - Delete resource(s) in v5 format
- PB-34293: E2EE WP1 - Share resource(s) in v5 format
- PB-34294: E2EE WP1 - Import resource(s) in v5 format
- PB-34295: E2EE WP1 - Export resource(s) in v5 format
- PB-34296: E2EE WP1 - Move resource(s) in v5 format
- PB-34297: E2EE WP1 - Create password resource from quickaccess in v5 format
- PB-34298: E2EE WP1 - Auto-save password resource from quickaccess in v5 format
- PB-34299: E2EE WP1 - Make resource entity compatible only with v5
- PB-34311: E2EE WP1 - Make resource V4 and V5 compatible in both ways
- PB-34315: E2EE WP1 - Transform DTO to V4 for API and adapt resource validation to v5
- PB-34391: E2EE WP1 - Enforce resource type id should be required and not null
- PB-34392: E2EE WP1 - Validate Metadata.uris as array of string, and maxLength

### Security
- PB-34237: Upgrade vulnerable library i18next-parser
- PB-34305: Upgrade lockfile-lint library on passbolt_api package-lock.json
- PB-34422: Remove grunt-browserify dev dependency from browser extension
