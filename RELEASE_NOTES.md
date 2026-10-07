Release song - TBD

# v5.17.0
Passbolt 5.17.0 provides authentication via passkeys as MFA, permission confirmation dialog on the move operations, autofill improvments and pin code resource type in quickaccess

## Changelogs
### Added
PB-53327 Include group membership changes in the permission drift calculation before saving
PB-53450 AUTOFILL - WP 2.0 - Create the orphanDictionary for the DOM extraction
PB-53451 Add OrphanFieldPredicates class to check wether an element is a button
PB-53452 AUTOFILL - WP 2.2 - Create the FieldVisibilityService to avoid detection of hidden inputs
PB-53460 Add FormExtractionService to gather forms with viewable text fields
PB-53461 AUTOFILL - WP 2.4 - Create the OrphanFieldsExtractionService to extract build the orphan forms
PB-53462 Create NestedFormExtractionService
PB-53464 Rework InFormCredentialsFormField
PB-53465 AUTOFILL - WP 2.8 - Update the InFormManager to use the new extraction logic
PB-53466 AUTOFILL - WP 3.0 - Create the TextNormalizer as an helper to infer on extracted text
PB-53480 AUTOFILL - WP 3.1 - Create the ScrapingDictionary to handle scraping constants
PB-53482 AUTOFILL - WP 3.2 - Create the ScrapingIdentity to support identifier after scraping
PB-53483 AUTOFILL - WP 3.3 - Create the ScrapingCache object
PB-53484 AUTOFILL - WP 3.4 - Create the PageScraperHelpers to group helpers used for scraping
PB-53485 AUTOFILL - WP 3.5 - Create the LabelScraper to handle the label logic extraction
PB-53486 AUTOFILL - WP 3.6 - Create the FieldScraper to handle the field extraction
PB-53487 AUTOFILL - WP 3.7 - Create the FormScraper to extract information from form
PB-53488 AUTOFILL - WP 3.8 - Create the FieldQualifier to detect the type of field scraped
PB-53489 AUTOFILL - WP 3.9 - Create the PageScraper
PB-53980 PCD - improve PCD on move operations
PB-54162 AUTOFILL - WP 4.0 Create keywordsDictionary for classification
PB-54163 AUTOFILL - WP 4.1 Create taximony for classification
PB-54165 AUTOFILL - WP 4.2 Create KeywordMatchingService
PB-54167 AUTOFILL - WP 4.3 Create FieldFeatureService
PB-54168 AUTOFILL - WP 4.4 Create FormClassificationService
PB-54171 AUTOFILL - WP 4.5 Create SawfClassificationService
PB-54172 AUTOFILL - WP 4.6 Create PasswordRoleResolutionService
PB-54173 AUTOFILL - WP 4.7 Create FieldsRationalizationService
PB-54184 AUTOFILL - WP 4.8 Create SegmentedOtpResolutionService
PB-54185 AUTOFILL - WP 4.9 Create ClassificationService
PB-54336 AUTOFILL - WP 4.10 Create PageClassificationService
PB-54337 AUTOFILL - WP 4.11 Connect the new service to the fill plan
PB-54346 AUTOFILL - Fill not working on modal when z index is high
PB-54374 AUTOFILL - Call-to-action missing on first focus for shadow-DOM fields
PB-54344 AUTOFILL - Autocomplete should not block when it not valid
PB-54500 Quick access: list PIN code resources
PB-54502 Quick access: display PIN code in the resource view page
PB-54530 AUTOFILL is not working for input length attribute
PB-54571 Add the Passkeys provider toggle to the MFA administration page
PB-54596 Implement the restartable WebAuthn setup ceremony
PB-54608 OFM - PIN Code as offline available resource
PB-54706 Show the Passkeys card in the user MFA provider overview
PB-54707 Add the passkey authenticator icon set and AAGUID mapping to the styleguide
PB-54709 Add the passkey registration flow to the Passkeys settings page
PB-54710 Implement the WebAuthn MFA verification page as a styleguide React application
PB-54759 BEST - WP 1.1 - Implement ScimEntity for Healthcheck
PB-54760 BEST - WP 1.2 - Update HealthcheckEntity to handle the new ScimEntity
PB-54761 BEST - WP 1.3 - Update DisplayScimSettingsAdministration to handle the new expiry behaviour
PB-55047 Prune fields nested in forms deeper than the one evaluated
PB-55050 False positive on first name and inform menu blinking
PB-55099 Fix add user to group progress dialog for offscreen
PB-55115 Implement the delegated WebAuthn MFA verification page for the mobile applications

### Fixed
PB-53265 Autocomplete fails in share dialog when custom email validator is on
PB-54103 Fix null reference on storage change event
PB-54531 Editing resources in a group-view doesn't update the grid
PB-54764 OFM button not presented to eligible authenticated user with mfa required and API unavailable
PB-54790 Prevent potential issue with TOTP autofill
PB-54818 Offline mode plane icon stroke width should be 1.5px instead of 2px
PB-54841 Fix quickaccess tab not opening when an account is not configured
PB-54976 AUTOFILL - Plex CTA is blinking
PB-55046 AUTOFILL - agoda email is not fillable
PB-55048 AUTOFILL - Focus on a input should keep the CTA
PB-55136 AUTOFILL - confirm password should be filled on a form
PB-55155 AUTOFILL - Fix ant design search input is not working

### Security
PB-52830 restrict retrieved cookie on Safari to what a browser would normally get back
PB-52831 Ensures Safari does not accept unexepected redirection to avoid cookie leakage
PB-52832 Fix parameter name in sanitizeUrl function
PB-53545 Major upgrade for yargs (Low)
PB-53942 Fix image-size GHSA-5p2g-fcmc-qvqq - HIGH CVSS4.0
PB-54648 Fix adm-zip GHSA-vwc7-r8mq-g2x9 - CVSS4.0 MEDIUM
PB-54751 Major upgrade for @noble/hashes (Low) - passbolt-styleguide
PB-55262 Fix undici multiple CVEs - CVSS3.1 HIGH
PB-55264 Fix axios multiple CVEs - CVSS3.1 HGH
PB-55267 Fix braces-expansion multiple CVEs - CVSS3.1 HIGH
PB-55268 Fix braces GHSA-vfj7-8cjw-p6xm - CVSS3.1 HIGH
PB-55274 Fix shell-quote GHSA-pqg4-j6r4-53mv - CVSS4.0 CRITICAL
PB-55276 Fix fast-uri multiple CVEs - CVSS3.1 HIGH
PB-55277 Fix source-map-js GHSA-68fv-2mgg-jv7q - CVSS4.0 HIGH
PB-55279 Fix i18next-http-backend GHSA-xvq9-wjp8-hwqf - CVSS3.1 LOW
PB-55293 Fix joi multiple CVEs - CVSS4.0 HIGH
PB-55295 Fix probe-image-size GHSA-gjj5-9665-rwrc - CVSS3.1 HIGH
PB-54842 clipboard auto-clear bypass via untrusted copy/cut DOM event

### Maintenance
PB-49117 optimise tab retrieval by id
PB-52127 SAF - Reactivate avatar handling from client
PB-54525 Product naming convention for Group Manager instead of Group Admin
