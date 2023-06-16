# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
## [4.1.0] - 2023-06-21

### Added
- PB-24169 As an administrator I want to customise what capabilities users are allowed to access on the UI of my organisation
- PB-24598 SSO allow administrators to remap email/username properties

### Fixed
- PB-14174 As a user I want the inform menu not to be displayed outside my browser window
- PB-24657 As a user I should see the triage page even when SSO is misconfigured
- PB-25031 Fix margin on folder name in the information panel

### Improvement
- PB-24619 As LU I should see the link on the same line in a paragraph
- PB-24646 As LU, I should see colored passwords

### Maintenance
- PB-24622 Put back the rolled-back code for LDAP multi-domain and field-mapping feature
- PB-24794 Adapt browser extension to not crash when unknown content types are retrieved from the API

### Security
- PB-23852 PBL-02-002 As a user I should sign-out using POST method
- PB-24997 Change static images URL to be served from the browser extension instead of the API

## [4.0.4] - 2023-06-07
### Fixed
- PB-24932 Fix: As a user I want to be able to sign-in through SSO from the inform menu

## [4.0.3] - 2023-06-05
### Fixed
- PB-24734 Fix As a registered user I would like to be able to use SSO login via the quickaccess

## [4.0.1] - 2023-05-17
### Fixed
- PB-24639 Fix: As an administrator I want to be see which users have activated MFA from the users workspace

## [4.0.0] - 2023-05-02
### Added
- PB-23531 As an administrator I can setup google as SSO provider
- PB-23532 As a user I can sign-in with SSO
- PB-23535 As a user I want to self register with SSO enabled
- PB-23952 As an administrator I want to synchronize only groups belonging to a given parent group
- PB-24168 As a user I want to use an accessible version of the UI

### Improvements
- PB-21564 Application should be aware of authentication status as soon as the user is getting signed out

### Fix
- PB-21488 Fix the loading of pagemods when user data is not set in the local storage
- PB-23547 As a signed-in user I should auto-filling credentials in iframe even if there is an empty iframe src ahead
- PB-24076 Fix ApiClient BaseUrl generation to avoid double slashes in the final URL
- PB-24100 As a developer I want to use a fix working version of storybook
- PB-24145 As a signed-in user the inform integration should not freeze the browser if there is a lots of dom changes
- PB-24260 As a signed-in user I should not see a resource stays selected after moves in a folder

### Security
- PB-22858 As a user the session storage should have a limit of port by tab
- PB-22859 As a user the web integration pagemod should be attached only on top frame
- PB-23556 PBL-08-002 WP2: Passphrase Retained In Memory Post-Logout
- PB-23942 PBL-08-008 WP2: Lack of explicit CSP on extension manifest
- PB-23797 Backport MV3 port manager on MV2 without using the webNavigation permission

### Maintenance
- PB-18667 Migrate gpgAuth session check loop into a dedicated service startLoopAuthSessionCheckService
- PB-22641 As a user the browser extension should handle when the version is updated
- PB-22642 As a developer, when inform call to action and inform menu are destroyed, I should remove the port reference in the session storage and portManager
- PB-24105 As a user I want to trigger file download on firefox with file pagemod
- PB-24131 As a developer I should have class files in the correct folder
- PB-24134 As a developer I should be able to run the CI pipeline even if the audit job is failing
- PB-24147 Remove legacy entry point to check if the user is authenticated

## [3.12.1] - 2023-03-29
### Fix
- PB-23930 Fix the removal of the SSO kit on CSRF token error
- PB-23949 Fix as a user I should be able to use uppercase characters for username
- PB-24041 Fix missing import XRegExp
- PB-24065 Fix to prevent the browser extension from crashing if the server is configured with an unsupported SSO provider

## [3.12.0] - 2023-03-15
### Added
- PB-22521 As a signed-in user, I want to export resources in logmeonce csv
- PB-22520 As a signed-in user, I want to export resources in nordpass csv
- PB-22519 As a signed-in user, I want to export resources in dashlane csv
- PB-22518 As a signed-in user, I want to export resources in safari csv format
- PB-22517 As a signed-in user, I want to export resources in mozilla csv
- PB-22515 As a signed-in user, I want to export resources in bitwarden csv
- PB-22516 As a signed-in user, I want to export resources in chromium based browsers csv
- PB-22838 As an administrator I can customise the application email validation

### Improvements
- PB-22896 Improve DUO style

### Fix
- PB-23281 Fix as a user I should see an accurate entropy when a password contain words from a dictionary
- PB-23541 As a user I can use SSO recover when Passbolt is served from a subfolder

### Security
- PB-23706 As an administrator I should be the only one to know which users have enabled MFA


## [3.11.2] - 2023-03-03
### Security
- PB-23328 - PBL-08-001 WP2 Credentials Leakage via Clickjacking - As a signed-in user I should not be able to open the application iframe in an untrusted parent frame
- PB-23327 - PBL-08-001 WP2 Credentials Leakage via Clickjacking - As a signed-in user I should not be able to open the quickaccess in an iframe

## [3.11.1] - 2023-02-27
### Added
- PB-22081 As a signed-in user I can import my passwords from a Mozilla web browsers csv export
- PB-22082 As a signed-in user I can import my passwords from Safari web browser csv export
- PB-22116 As a signed-in user I can import my passwords from a Dashlane csv export
- PB-22117 As a signed-in user I can import my passwords from a Nordpass csv export
- PB-22510 As a signed-in user I can import my passwords from a LogMeOnce csv export
- PB-22866 As a user I want to use passbolt in Italian
- PB-22866 As a user I want to use passbolt in Portuguese (Brazil)
- PB-22866 As a user I want to use passbolt in Korean
- PB-22866 As a user I want to use passbolt in Romanian
- PB-22882 As a user I can use the SSO feature to speed up the extension configuration process

### Improved
- PB-21408 As a logged-in user navigating to the account recovery user settings from the MFA user settings I should not see the screen blinking
- PB-21548 As a signed-in user I can access my MFA settings for a given provider following a dedicated route
- PB-22647 As a signed-in user I want to use my personal google email server as SMTP server
- PB-22699 A a user I want a unified experience using pwned password feature
- PB-22725 As a signed-in user I want to see an introduction screen prior setting up Duo v4
- PB-22835 As an administrator I can define the optional SMTP Settings “client” setting
- PB-22861 As an administrator I want to manage Duo v4 settings

### Fixed
- PB-22387 As an administrator generating an account recovery organization key, I should see the warning banner after submitting the form
- PB-22587 Fix the CSV exports columns presence and order
- PB-22588 As a signed-in user I want to import resources in Lastpass csv export following their conventions
- PB-22701 As a signed-in user I should not see the MFA mandatory dialog if there are no MFA providers enabled for my organization
- PB-22704 As a user with a configured account and SSO, I should be able to recover/setup another account
- PB-23277 As a signed-in user I should not have a 404 error with the flag mfa policy disable

### Security
- PB-21645 As content code application I should be restricted to open ports only for applications I am allowed to open
- PB-21754 As a user I should not see any trace of previously downloaded content in my history
- PB-23279 As a user completing a setup I should not have access to the background page decryption secret capabilities

### Maintenance
PB-19641 Handle the setup and recover runtime object
- PB-19675 As a signed-in user I want to perform a recover using the browser extension with MV3
- PB-19676 As a signed-in user I want to perform a setup using the browser extension with mv3
- PB-19677 As a signed-in user I want to perform a sign-in using the browser extension with MV3
- PB-19678 As a signed-in user I want to start the application using the browser extension with mv3
- PB-21750 As service worker I should be able to wake up a disconnected application port
- PB-21822 As a signed-in user I want to open quickaccess using the browser extension with MV3
- PB-21823 As a signed-in user I want to see the web integration using the browser extension with MV3
- PB-21824 As a signed-in user I want to see the web public sign in using the browser extension with MV3
- PB-21829 Clean port after a web navigation on the main frame
- PB-21996 As a signed-in user I want to see the in form call to action using the browser extension with MV3
- PB-21997 As a signed-in user I want to see the in form menu using the browser extension with MV3
- PB-22009 Create a service to parse the webIntegration in url
- PB-22076 Handle flush local storage on browser runtime onStartUp for MV3
- PB-22077 Handle config init and post logout on service worker startup
- PB-22078 Create a polyfill to handle browser.action on MV2
- PB-22113 As a signed-in user I should be able to open the quickaccess popup from inform menu with MV3
- PB-22412 As a signed-in user I want to use account recovery process using the browser extension with MV3
- PB-22648 Adapt payload when back return duo settings
- PB-22896 Update styles to adapt to Duo forms updates
- PB-22898 Update login form design styles

## [3.10.0] - 2023-02-09
### Added
- PB-21752 As an anonymous user I can self register if the organization allows my email domain
- PB-21999 As a signed-in administrator I can force users to authenticate with MFA at each sign-in
- PB-22000 As a signed-in administrator I can force users to enable MFA
- PB-22080 As a signed-in user I should be able to import chromium based browsers csv
- PB-21874 As signed-in user I should be able to import bitwarden csv

### Improved
- PB-21910 As a signed-in administrator on the self registration admin settings form I want to see the domain warnings while typing and not after blur event
- PB-22007 As a user finalizing my account recovery I should be able to authenticate with SSO after my first sign out
- PB-22619 As a user authenticating with SSO, I should close the SSO popup when I am navigating away in the main frame
- PB-22617 As a user authentication with SSO, closing the third party popup should not redirect me to the passphrase screen

### Fixed
- PB-18371 Fix contextual menu positioning issue when right clicking at the bottom of the page
- PB-22386 As an administrator I want to know if the weak passphrase I am entering to generate an organization recovery key has been pwned
- PB-22387 As an administrator generating an account recovery organization key, I should see the warning banner after submitting the form
- PB-22388 Fix as a user recovering my account i should not see that the passphrase i entered has been pwned if it is not the valid passphrase
- PB-22084 As a signed-in user I can import my passwords from 1Password csv export with their new header conventions

### Maintenance
- PB-21562 Refactor service worker port and add coverage
- PB-21813 Unit test the private key's passphrase rotation SSO kit regeneration
- PB-21878 Unit test the user stories related to SSO via quickaccess
- PB-21932 Unit test: As AD I want my SSO kit to be generated when saving a new SSO settings
- PB-21933 Create a service to parse the sign in url
- PB-22337 Merge both controller AuthController and AuthSignInController to keep consistency
- PB-22353 Remove redundant toDto function in SsoClientPartEntity
- PB-22403 Instead of using new URL when getting sso url login, use an entity to ensure consistency and that the data is validated
- PB-22478 As a developer I should be sure my changes don’t introduce regression in the build
- PB-22479 As a developer I should be sure my changes don't introduce dependency vulnerabilities
- PB-22614 Avoid telemetries to be sent to Storybook
- PB-22630 Fix the Unit test in the browser extension about  method that shouldn't be called

## [3.9.2] - 2023-01-31
### Fixed
- PB-22557: As LU I should be able to download file on chromium based browsers

## [3.9.0] - 2023-01-18
### Added
- PB-21383 As AD I can save the SSO server settings
- PB-21383 As AD I can disable the SSO server settings
- PB-21393 As a registered user I can use the SSO feature to sign in to passbolt
- PB-21400 As LU I can rotate my private key's passphrase and still be able to sign in via SSO
- PB-21735 As a signed-in administrator in the administrator workspace, I can see the user
self registration settings option in the left-side bar
- PB-21740 As a signed-in administrator I can remove a domain from the user self registration list
- PB-21767 As AN I want to have the SSO login displayed by default when I have an SSO kit available
- PB-21768 As AD I want my SSO kit to be generated when saving a new SSO settings if I don't have already one
- PB-21769 As AN I want to use SSO login from the quickaccess
- PB-21814 As LU When rotating my passphrase I want to clean my SSO kit on the API
- PB-21842 As AN I want to have help if I can't remember my passphrase and SSO login is activated
- PB-21907 As a signed-in on the self registration admin settings form, I want to see the warning message on a row domain even when there are errors on other domains rows
- PB-21908 As a signed-in administrator on the self registration admin settings form, I should not see an error when I enable the settings which previously were containing error
- PB-21909 As a signed-in administrator on the self registration admin settings form, I want to see the new row having focus when I click on the add a new row button
- PB-22006 - As a user finalising my recover I should be able to authenticate with SSO after my first sign out

### Improved
- PB-21920 As a user I want to use the new PwnedPasswords service when I setup an account, recover an account, change my passphrase or generate a organisation recovery key
- PB-19793 As a user I want to see a consistent layout while signing-in to passbolt
- PB-20561 As a user changing my passphrase I would like to see the passphrase field description translated
- PB-21490 As an administrator I shouldn't see the "save required" banner after saving the SMTP settings
- PB-20559 As an administrator I want clearer account recovery email notification descriptions relative to administrators
- PB-21746 As a signed-in user I want to autofill french authentication form using french language as field name
- PB-21612: Refactor fileController into a dedicated service
- PB-19156: Replace setInterval by alarm in worker::waitExists

### Fixed
- PB-19649 As a user sharing a resource/folder, I should be able to see the number of users contained in groups search result
- PB-21443 As a user on the administration section I would like to see the passbolt logo
- PB-21476 As signed-in user, I want to copy content in my clipboard using passbolt over http
- PB-22022 Fix height for the svg Passbolt logo

### Maintenance
- PB-19054 Remove the usage of the soon the soon unavailable global “window” object
- PB-19292 As a user I want file downloads to be compatible with MV3 as well
- PB-19299 Remove the usage of the soon the soon unavailable global “window” object in the unit tests
- PB-19309 Remove the usage of the soon the soon unavailable global “window” object in the “Random” crypto helper
- PB-19586 Refactor administration screen actions components
- PB-19639 Refactor applications port connection bootstrap
- PB-19650 Handle MV3 port re-connection
- PB-19657 Add frameId to the ScriptExecution
- PB-21370 Reduce repository size
- PB-21435 Bootstrap MV3 service worker
- PB-21486 Increase code coverage relative to the SMTP authentication method recently added in the SMTP settings admin screen
- PB-21911 As a developer I want to know the source (author, url, license) of the src/react-extension/lib/Domain/Domains.js list


## [3.8.2] - 2022-11-27
### Fixed
- PB-21565: As a logged-in user, I should decide to keep my session alive until I sign out
- PB-21372: As a logged-in user, I should see folders without caret aligned

## [3.8.0] - 2022-11-04
### Added
- PB-19151: As a logged-in user, I want to be able to use Solarized light and dark themes
- PB-19220: As an administrator, I want to manage the organization SMTP settings in the administration workspace

### Improved
- PB-19229: As an administration, I want to see the passwords I entered in the MFA administration settings forms
- PB-19226: As a logged-in user, I want to move resources to another folder with better performances
- PB-19034: As a group manager I should see if there is more than 3 users in a group I'm editing
- PB-19214: As a logged-in user, I want to see long entities names fitting in dialog

### Fixed
- PB-19228: As a user, I should see a feedback when the password or description fields content is truncated by a field limit
- PB-19216: As a logged-in user, I want to populate a form from the Quick Access after the generation of new credentials
- PB-20978: As a logged-in user, I want to autocomplete using reserved keywords

### Security
- PB-19537: As a user I want my password fields to be hidden in Passbolt forms when the form is being submitted
- PB-18639: Restrict the port connection to our extension only for chrome

### Maintenance
- PB-19237: As a developer, I should see the “change user passphrase” stories in storybook
- PB-18499: [MV3] Bootstrap MV3 build
- PB-18600: [MV3] Migrate passphrase “remember me” code into a service
- PB-18640: [MV3] Use alarms API instead of setTimeout and setInterval
- PB-18641: [MV3] Use ProgressService instead of ProgressController
- PB-18649: Use navigator.clipboard API instead of the copy to clipboard iframe mechanism
- PB-18657: [MV3] Implement a scripting polyfill to ensure scripts and css can be injected with both manifest versions
- PB-19231: Improve “select” styleguide component unit tests coverage
- PB-19232: Implement browser extension app url parser
- PB-19238: Move events create and get to dedicated controllers
- PB-19558: Run storybook test against CI
- PB-19586: Create email notifications actions

## [3.7.3] - 2022-09-24
### Security
- PB-19090 Ensure we are spell-jacking proof for our input password

## [3.7.2] - 2022-09-13
### Fixed
- PB-17158: As LU I want to see an entropy at 0 when the typed passphrase is exposed in a data breach
- PB-18370: As LU I want to see the user settings yubikey form matching the common form style
- PB-18417: As AN I want to see the server key change error with the proper design
- PB-17154: As AD I want to see the input field in user directory UI with the proper design

### Maintenance
- PB-17720: As AD I wish the account recovery setting page not to refresh infinitely
- PB-18498: As a developer I wish to build the background page in manifest version 2 with webpack

### Improved
- PB-16898: As AN I want to the full list of supported browser if I'm not using one
- PB-18495: As LU I want to see effective date as tooltip of calculated relative date
- PB-17152: As LU for a first install with chrome, I wish to see the 'eye catcher' with a good contrast
- PB-18659: As LU I want to be able to give to folder names up to 256 characters
- PB-17062: As a developer I can customize and test new theme on storybook
- PB-16946: As a developer I want to have a new theme in Storybook

## [3.7.1] - 2022-08-11
### Fixed
- PB-18420 As AN completing the setup I should understand what information the account recovery feature will treat

### Maintenance
- PB-18421 As a developer I can build a custom theme

### Security
- PBL-07-004 WP1: Finished account recovery aids future key compromise

## [3.7.0] - 2022-07-26
### Added
- PB-15305 As LU I can access the mobile configuration page from the profile dropdown
- PB-16925 As AN I can access the sign in form of my organization from passbolt.com
- PB-17094 Mark account recovery feature as stable
- PB-17095 As a user I can use passbolt in Spanish
- PB-17095 As a user I can use passbolt in Lituanian

### Improved
- PB-14103 As a user I want to be able to use the autofill on dzb-bank.de
- PB-14865 As LU I should see the warning messages on all dialogs with the same design
- PB-16560 As LU I should be able to read textarea content of dialog without zooming it
- PB-16641 As AD I want to have a clear error message when I import an account recovery organization key having an expiry date
- PB-16665 As a user I should see proper error message when an unexpected error happened in the quickaccess
- PB-16695 As a translator I can provide translation for languages that have multiple plurals
- PB-16937 As group manager I want to see a dialog skeleton when I'm editing a group having a large number of members
- PB-16942 Improve UI performance while adding a user to an existing group
- PB-16944 Improve UI performance while sharing multiple passwords in bulk
- PB-16991 Improve UI performance of the create group dialog
- PB-16995 Improve UI performance while adding a user or group to the list of people to share a password with
- PB-16998 As GM selecting a user to add to a group, I should see the latest member added
- PB-16703 As a user I can autofill my username on ovh.com
- PB-16757 As a user on a screen with low dpi I do not want to have a blur effect on the text
- PB-16759 As a user I want to see a coherent UI on a screen with a large resolution

### Fixed
- PB-15049 As a user I should be able to complete the setup even if my machine and the server do not have a synchronized time
- PB-15247 As a user I should not see passbolt setup/recover starting on pages having similar urls
- PB-16169 As LU I want to see the feedback card call to actions aligned to the left
- PB-16640 As AD I should be able to subscribe to the account recovery program right after configuring it for the organization
- PB-16663 Misc style fixes on account recovery download generated key dialog
- PB-16763  As LU I should be able to change my passphrase and download the new recovery kit
- PB-16769 As LU I should be able to save passwords with an uri greater than 1024 from the in-form integration
- PB-16793 Misc style fixes on account recovery administration page
- PB-16807 As a user I should see the spinner Icon in the Autocomplete component
- PB-16840 As a user I should not get an error if a gpg key is stored in the local storage with a gpg key expiry set to null
- PB-16841 As AD I should not be able to import a public organization key having an expiration date
- PB-16883 As AD I want to be able to select Groups parent group and Users parent group fields in the User Directory interface
- PB-16926 As LU I should be able to see the right 'Modified' date property in the user sidebar
- PB-16928 As a translator I should not have strings with unpredictable variables to translate
- PB-17012 As a user if my domain changed, I should still see the login form after completing a setup, recover or an account recovery
- PB-17013 As LU I should see the pre-loading / skeleton style properly
- PB-17090 As a contributor I want to be able to switch theme in storybook
- PB-17155 As a user I want to see my security token with the chosen colors on the account recovery complete screen

### Maintenance
- PB-13559 CI to report on code coverage
- PB-13887 Prepare theme colors file to welcome the theme customization feature
- PB-14271 Follow-up add className disabled for input text div
- PB-14876 Add test for browser integration scroll parent on iframe
- PB-16770 Update React to version 17
- PB-16994 Remove check extension configured for browser integration bootstrap
- PB-17029 As contributor I want to see a storybook home page
- PB-17032 Remove translatable strings that are duplicated
- PB-17071 Log verify gpg key error on authentication screen

### Security
- PB-15259 As LU sharing a resource/folder I want to see a unified tooltip that informs me about a user fingerprint
- PB-16141 As AN importing a key during the setup, I should be warned when my passphrase is part of a data breach
- PB-16152 As AD I can not generate an account recovery key with a password which is part of a data breach
- PB-16154 As AN I cannot bypass the data breach assertion while completing the setup
- PB-16595 As AD reviewing an account recovery request I should get an error if the domain stored in the encrypted password data is not similar to mine

## [3.6.2] - 2022-06-02
### Improved
- PB-16651 As LU I want to get a clear message if I enroll to a disabled account recovery program
- PB-15677 As LU I want to see openpgp assertions messages translated into my language

### Fixed
- PB-16736 Fix as AN I can accept a new server key

## [3.6.1] - 2022-05-31
### Improved
- PB-16116 Change user creation dialog tips following the introduction of account recovery
- PB-16119 As LU changing my security token I should be able to access documentation about phishing attacks
- PB-16166 Change nested folders icons size
- PB-16206 Change search bar padding
- PB-16207 Change midgar theme hover background colour
- PB-16208 Change midgar inset shadow highlight opacity
- PB-16209 Change inside fields buttons radius
- PB-16210 Change midgar hover/active grid lines backgrounds
- PB-16211 Change midgar active button background
- PB-16212 Change authentication loading spinner padding
- PB-16213 As LU I should see a beta pill next to the account recovery menu entry
- PB-16556 Change midgar sign-in form background
- PB-16559 Change user settings account recovery layout
- PB-16588 As GM editing group memberships, I want to see the tooltip icon aligned with the username
- PB-16589 Change the attention required icon color in the user settings menu
- PB-16592 Change quickaccess connecting state box background
- PB-16603 Change grids font weight
- PB-16605 Reduce letter spacings globally
- PB-16639 As LU enrolling to the account recovery program I should be requested my passphrase

### Fixed
- PB-14278 As LU I should see warning messages on form fields
- PB-16117 As AD I should not see the MFA status in the user sidebar if the user is not active
- PB-16146 As AD I should not be able to copy the public key of a inactive user
- PB-16558 As AN on unauthenticated page I should not see “about us” cta tooltip
- PB-16604 As a LU I should be able to sort the grid by Username and URI
- PB-16661 As a AN I can accept a server key rotation when the server key stored in the local storage cannot be parsed

### Maintenance
- PB-16155 Apply linter on all styleguide src code
- PB-14951 Move common test material

## [3.6.0] - 2022-05-23
### Added
- PB-12965 As AD I can enable account recovery for the organization
- PB-13759 As AD I can rotate the organization account recovery key
- PB-16193 As AD I can see a user account recovery requests history
- PB-13012 As a user who lost its credentials I can request an account recovery
- PB-13025 As AD I can approve or reject an account recovery request
- PB-16117 As AD I can see a user MFA status in the details sidebar
- PB-15033 As a user who lost its credentials I can request help to an administrator
- PB-14672 As a user I should see the new design on the password workspace
- PB-14673 As a user I should see the new design on the user workspace
- PB-14674 As a user I should see the new design on the user settings workspace
- PB-15026  As a user I should see the new design on the administration workspace
- PB-14675 As a user I should see the new design on the authentication screens
- PB-14677 As a user I should see the new design on the quickaccess application
- PB-14960 As a user I should see the new design on the web integration inform menu
- PB-14131 As AN performing a setup, I can import ECC keys

### Improved
- PB-14896 As AN performing a setup, I should not be able to import an already decrypted key
- PB-14816 As AN performing a setup, I should not be able to use a passphrase which is part of a data breach
- PB-14462 As AN on the authentication screens, I should see unexpected errors details
- PB-14203 As LU on the application, I should see unexpected errors details
- PB-13852 Improve encryption/decryption performances

### Security
- PB-13908 As AN performing a setup, I generate key of 3072 bits
- PB-13908 As AN performing a setup, I cannot import keys weaker than 3072 bits

### Fixed
- PB-15241 As a user I can use the web integration inform menu in iframe authentication forms
- PB-13901 As AN performing a sign-in, I should be prompted the server key changed only when the parsed key changed
- PB-14130 As LU I can select multiple passwords filtered by folder
- PB-14405 Fix misc sentences plural

### Maintenance
- PB-14155 Upgrade node to version 16
- PB-13852 Upgrade openpgp.js to version 5
- PB-14672 Increase storybook screens coverage
- PB-14052 Increase browser extension code coverage

## [3.5.2] - 2022-04-12
### Improved
- PB-14880 Debounce/throttle resource workspaces API requests

## [3.5.1] - 2022-03-29
### Fixed
- PB-14378 Tab doesn't always have defined url, title and favIconUrl properties on chrome.tabs.onUpdated event listener callback

## [3.5.0] - 2021-01-12
### Added
- PB-13161 As LU I should be able to passbolt with my Android mobile
- PB-13161 As LU I should be able to passbolt with my IOS mobile
- PB-13321 As a user I can use passbolt in Dutch
- PB-13321 As a user I can use passbolt in Japanese
- PB-13321 As a user I can use passbolt in Polish

### Improved
- PB-9402 As LU I should be able to create and import passwords having a name and username of 255 characters long
- PB-13178 As a user visiting the web stores I should be aware that the application supports multiple languages
- PB-9748 Optimize in-form menu integration performance by avoiding the CTA mutation observer to be called when passbolt manipulates the DOM itself

### Security
- PB-13162 Upgrade QRCode library to v1.5.0

### Fixed
- PB-12819 Fix as LU I should autofill/auto-save on forms having only a password field
- GITHUB-136 Fix as LU I want to see the in-form menu CTA well positioned on pages having no scroll but CSS transformation
- GITHUB-137 Fix as a user I should see the in-form menu CTA on modal having a z-index greater that 1000
- PB-13268 As LU I should be able to put comma in my user names
- PB-12873 As LU I shouldn’t see double escaped characters on the translation of strings including variables

### Maintenance
- PB-12955 Fix error and warning messages in unit test console
- PB-13309 Upgrade dev dependency webpack-dev-server to v4.7.2

## [3.4.0] - 2021-12-01
### Added
- PB-9826 As a user I want to use passbolt natively on Edge
- PB-1743 As LU I want to tag resource using drag and drop
- PB-8372 As LU I want to see the quickaccess application in dark mode
- PB-8371 As LU I want to see the login screen in dark mode
- PB-8371 As AN I want to see the recover & setup screens in dark mode as per my OS preferences

### Improvement
- PB-9374 As LU I want to see the loading text translated in all the setup/recover screens
- PB-9374 As LU I want to see the next button translated in all the setup/recover screens
- PB-8521 As LU I want to preview my passphrase when I sign-in with the quickaccess
- PB-8521 As LU I want to preview the password protecting a kdbx when I import a kdbx protected by password
- PB-9292 As LU I want to see the neat grids checkboxes
- PB-8935 As LU changing my passphrase I want to see my security token when my current passphrase is requested
- PB-9315 As AN I want to see some space between my name and my avatar on the login screen
- PB-9318 As LU already logged in I don't want to see any error when I try to sign-in again

### Fixed
- PB-9316 Fix as LU I don't want to see a padding at the right of the quickaccess right after signing in
- PB-9759 Fix as LU I don't want to see in form menu CTA if the associated input field was removed from the DOM
- PB-9376 Fix as LU I want to see the sub-folders caret aligned with the sub-folders names
- PB-8900 Fix as LU I don't want to see the sub-folders of the last folder displayed on top of the tags section
- PB-9648 Fix as LU I don't want to see in form menu CTA displayed out of its associated input field
- PB-9409 Fix as LU I don't want to see a dead link on the update my passphrase settings screen
- PB-8934 Fix as LU I want to see the key UI in the key inspector screen of the profile instead of my account full name
- PB-9410 Fix as LU changing my passphrase I should see the processing button aligned with the other form button
- PB-9321 Fix spelling mistakes reported by the community
- PB-9287 Fix as LU I want to see the text displayed in the recovery process "check your email" screen will the right size
- PB-8939 Fix as LU I don't want to see the progress dialog current operation details on 2 lines
- PB-9286 Fix as LU I want to see the locale dropdown field of the setup/recover screen well positioned
- PB-8938 Fix as LU previewing a password in the resource details sidebar I don't want to see the password spread over 2 lines
- PB-8937 Fix as LU previewing a password in the grid I don't want to see the password spread over 2 lines
- PB-9285 Fix as LU uploading an invalid avatar I want to see an error having the same style as other form fields errors
- PB-9331 Fix as LU I should not see the in-form menu CTA on the passbolt trusted domain
- PB-9317 Fix theme selection screen does not work when server url is not a TLD

### Security
- SEC-315 fix Upgrade validator dependency

### Maintenance
- PB-8523 Ignore "src/css" folder in styleguide dependency npm package
- PB-8432 Improve the way styles are loaded in storybook
- PB-5897 Add language switch in storybook for all components
- PB-8374 Lint background page source code

## [3.3.1] - 2021-10-26
### Fixed
- PB-9388 Fix unnecessary organization settings API calls

## [3.3.0] - 2021-10-20
### Added
- PB-7608 As LU I should be able to customize the password generator parameters
- PB-7608 As LU I should be able to use emojis in the generated passwords
- PB-7608 As LU I should be able to generate passphrase instead of passwords
- PB-7606 As LU I should be able to see how many credentials are suggested for the page I’m currently on by looking at the passbolt icon in the toolbar
- PB-7649 As LU I should be prompted to save a new credential when I generate a password for a new sign-up form
- PB-7683 As LU I should be able to auto-fill a suggested credential directly from inside an authentication form
- PB-7693 As LU I should be able to generate a password directly from inside a sign-up form
- PB-8189 As a user should be able to use the application in German or Swedish
- PB-6034 As LU I should be able to configure my mobile [experimental]

### Improvement
- PB-7639 As LU I should be able to import folders containing slash in their names
- PB-8256 As LU I should be able to see the username and password fields pre-filled when I create a password with the quickaccess
- PB-8088 As LU I should not see the quickaccess passphrase capture screen shaking when it appears
- PB-7599 As AN installing the extension on chrome I should be able to see instructions regarding how to pin the extension in the toolbar
- PB-7626 As LU I should be able to auto-fill a form by directly clicking on a credential suggested by the browser extension quickaccess without seeing the credential details first
- PB-6132 As LU I should be able to see the role column inside the users grid
- As LU I should be able to see my quickaccess with a larger wi

### Fixed
- PB-7813 Fix as LU I shouldn't be able to export from the folders section label if the exports feature is disabled
- PB-8306 Fix as LU I should see a content skeleton during loading on the share dialog of the application
- PB-8525 Fix as LU signing-in for the first time with the quickaccess I should be able  to see the tags category
- PB-7364 As GM I should not see the group name editable in the group edit dialog

### Security
- PB-8368 Password secret complexity calculation algorithm should take in account graphemes
- PB-8453 Mark password fields that are viewable as not auto-completable
- PB-8455 Update dependencies, remove unused grunt-contrib-concat

### Maintenance
- PB-8367 Add code coverage automation
- PB-8492 Optimize passbolt-styleguide dependency package size
- PB-7575 Remove jQuery dependency
- PB-6057 Remove underscore dependency

## [3.2.3] - 2021-06-07
### Fixed
- PB-7561 Fix as LU I should import CSV containing non latin1 characters
- PB-7563 Update passbolt styleguide dependencies

## [3.2.2] - 2021-05-31
### Fixed
- PB-7569 As AN with an unconfigured extension on chrome I should not get an error clicking on the toolbar passbolt icon

## [3.2.1] - 2021-05-26
### Added
- PB-5054 French internationalization
- PB-5526 As AD I can manage the subscription key from the administration panel

### Fixed
- PB-5366 Fix share autocomplete search results can be invalid
- PB-5498 Fix image version displayed after avatar upload
- PB-5861 Fix serializePlaintextDto should validate secret maxlength if resourceTypeId is set to legacy type, or not set
- PB-5909 Fix as LU aborting a preview operation I should not see an empty preview
- PB-5983 Fix as LU I can import passwords with non latin characters
- PB-6008 Fix as LU I should get a feedback in the quickaccess when I try to autofill credentials on a page, but an error occurred
- PB-6080 Fix add favorites fetch payload error

### Improvement
- PB-5443 As LU I should get a visual feedback when the maximum length of the secret fields is reached so that I do not loose data
- PB-5455 As LU selecting a description order to copy it should not enter the description edit mode
- PB-5496 As LU updating my avatar I should see the error message if an error occurred
- PB-5857 As LU I should be able to change the user role in the create/edit user dialog by clicking on the checkbox label

### Security
- PB-6012 Fix the quickaccess suggestion component should not suggest TLD entries (PB-01-002)

### Maintenance
- PB-5069 Migrate moment to Luxon
- PB-5884 Move quickaccess front end code to the styleguide repository
- PB-5887 Fix semantic gap in naming conventions in styleguide
- PB-5959 Bump webpack to v5

## [3.1.0] - 2021-03-17
### Added
- PB-4924 As LU I should be able to edit my security token
- PB-4917 As LU I should be able to change my passphrase
- PB-3550 As LU I can preview a password in the passwords grid
- PB-3575 As LU I can preview a password in the quick access
- PB-3570 As LU I can preview a password in the password details sidebar

### Fixed
- PB-5437 As LU I should see the group edit dialog when I follow a group edit permalink
- Allow resizing of textarea

## [3.0.7] - 2021-03-04
### Fixed
- GITHUB-156 Fix import/export and legacy API v2

## [3.0.6] - 2021-03-02
### Fixed
- Fix missing chevron image in quickaccess
- Remove EJS from dependencies
- Fix import of keepass file containing entries with undefined field
- Fix import should not throw an error if a resource or a folder cannot be created
- GITHUB-381 Fix quickaccess and custom fields. Lazy load resource types local storage on demand.
- PB-5154 Fix autofill and username field without type property defined

## [3.0.5] - 2021-02-03
### Fixed
- Fix keep session alive

## [3.0.4] - 2021-02-03
### Fixed
- Allow decryption with rsa signing key to work around old openpgpjs bug
- Pre sanitize data prior to collections/entity creation for the following operations: local storage update (resources, groups, users), user and avatar update, group update

## [3.0.3] - 2021-01-28
### Fixed
- Fix do not enforce validation for gpgkey with type property set to null
- Fix do not enforce validation for gpgkey with bits property set to null

## [3.0.2] - 2021-01-27
### Fixed
- Fix allow favorites with non conforming v1 data

## [3.0.1] - 2021-01-27
### Fixed
- Fix do not enforce validation error for tags with slug duplicates
- Fix do not enforce validation for avatar with empty user_id

## [3.0.0] - 2021-01-27
### Added
- Add a new login page and process redesign
- Add a new setup pages and process redesign
- Add a new recovery page and process redesign
- Add request passphrase prior to downloading the private key in user workspace
- Add the ability to sort by favorites
- Add the ability to encrypt description
- Add baseline support for other resource types

### Improved
- Migrate user workspace code previously served by server in the extension
- Migrate password workspace code previously served by server in the extension
- Migrate user profile code previously served by server in the extension
- Migrate the front-end code from CanJS to React
- Improve import export speed and misc compatibility improvements
- Improve server data validation in background page
- Misc update of dependencies
- Misc fixes of small styling issues in user and password workspace

### [2.13.8] - 2020-09-09
### Fixed
- PB-3519 Fix inherited permissions are not updated on share with nested folder and resources

### [2.13.7] - 2020-09-09
### Fixed
- Fix terminate any active session if user starts another account recovery / setup.
- Fix local storage / session should not be flushed when window is closed.

### Added
- Add codeql-analysis.yml for Github code analysis

### [2.13.6] - 2020-08-06
### Fixed
- PB-1416 As LU deleting a folder it should update the resources local storage
- PB-1417 As LU importing resources it should update the resources local storage

### Improved
- PB-1418 As LU deleting resources it should update the resources local storage after each delete (improve the feedback)

## [2.13.5] - 2020-07-22
### Fixed
- Fix autofill should work when input type is not lowercase
- Fix export to CSV should work if export does not include the resource associated folder

## [2.13.4] - 2020-06-23
### Added
- Increase the number of passwords the quickaccess suggests
- PB-1290 As a user I can choose which permission changes strategy to apply on a move
- PB-1326 Add support for signatures on share and import encryption operations

### Improvements
- PB-1348 Performance. Openpgpjs version bump v4.10.4

### Fixed
- Fix CSV import and export should support folders
- Fix progress bar should never be more than 100%
- GITHUB-238: As an administrator I should be able to install passbolt on a domain without a TLD.
- BUGZILLA-1372288: Hide extension URL from page when inserting iframe in a content script

## [2.13.3] - 2020-06-05
### Fixed
- Fix import folders batch issue

## [2.13.2] - 2020-06-03
### Fixed
- Fix resource URI can be null or a string
- Fix folder rename issue
- Fix export with large amount of resources issue
- Fix bulk move large amount of resources with the same folder parent issue
- Fix bulk share with large amount of resources

## [2.13.1] - 2020-05-29
### Fixed
- Fix direct export of resources/folders with a parent not included in export group
- Fix share folder/resource dialog should display item name
- Fix move shared folder cases where the permissions should not change
- Fix move shared resources cases where the permissions should not change
- Fix the response to the event 'passbolt.share.get-folders' should return an array
- Fix transform entity to dto before port.emit
- Fix linting

## [2.13.0] - 2020-05-28
### Added
- PB-658 Add folder create dialog and service
- PB-658 Add rename folder dialog
- PB-658 Add select and scroll to a folder after creation
- PB-658 Add store folder in local storage when logged in
- PB-658 Add create a resource or folder into a folder
- PB-658 Add support for creating resource with parent permissions
- PB-658 Add support for creating folder with parent permission
- PB-658 Add loading state to share dialog
- PB-658 Add folder share recursive
- PB-658 Add folders move in bulk (resources and folders)
- PB-658 Add support for multi resource move with permissions changes
- PB-658 Add folder delete dialog
- PB-658 Add cascading folders delete
- PB-1059 As a user I can import folders from a kdbx file
- PB-1059 As a user I can export resources and folders to a kdbx file

### Fixes
- Fix package-lock.json and rebuild extensions
- Fix share dialog autocomplete search, only the last API query result should be shown.
- Fix file format for export and file download by adding mime type.
- Fix linting
- Fix react app pagemod
- Fix React app to supports theme changes

### Improvements
- PB-799 Migrate share to react
- PB-799 Migrate resource edit dialog to react
- Add support for structured model entities
- Add npm version in package.json
- Do not display the domain the extension is configured for when triggering reconfig on another.
- Fix backward compatibility with v2.12
- PB-1089: Bump dependencies to higher versions
- Styleguide update

## [2.12.3] - 2020-05-18
### Fixed
- Add support to replace server OpenPGP public key when expired or replaced
- Fix error message on Firefox (insert script return value must be structured-clonable)
- Fix quickaccess create password field should be max 4096 characters in length

## [2.12.2] - 2020-04-14
### Fixed
- PB-1209: Bump jQuery to v3.5

## [2.12.1] - 2020-03-04
### Improved
- PB-1089: Bump dependencies to higher versions

## [2.12.0] - 2019-12-05
### Improved
- PB-649: The quickaccess passphrase field text and background colors should remain as default when the field is not focused.

### Fixed
- GROOVE-1610: Fix share operation should not fail silently
- GITHUB-84: Fix high server session timeout setting can lead to constant sessions check in legacy systems
- PB-879: Fix the setup security token validation bug
- PB-883: The quickaccess suggestion should filter passwords by uri protocol and port if provided.
- PB-766: Fix 414 server issues for features that work with batch of resources. Reduce the size of the batches.

## [2.11.3] - 2019-11-28
- GROOVE-1605 Revert to OpenPGP v2.6.2

## [2.11.2] - 2019-11-19
- PB-847: The quickaccess should suggest resources only if the current tab domain matches or is a subdomain of the resource uri.

## [2.11.1] - 2019-09-16
- PB-125: Sessions should be extended by default when user ask to remember passphrase.

## [2.11.0] - 2019-08-08
### Improved
- PB-242: Add local storage resources capabilities to manipulate the resources (add, delete, update)
- GITHUB-79: Improve autofill compatibility, trigger an input event instead a change event while filling forms
- PB-278: #GITHUB-61: Improve autofill compatibility, support Docker and AWS forms
- PB-432: Improve autofill compatibility, support reddit.com
- PB-433: Improve autofill compatibility, support Zoho CRM
- GITHUB-78: Improve autofill compatibility, fill only username if no password fill present
- PB-494: Improve autofill compatibility, ignore hidden fields
- PB-514: Improve autofill compatibility, fill iframe forms

### Fixed
- PB-544: Fix login passphrase remember me and quickaccess
- PB-533: Fix session expired management
- PB-515: Autofill should not fill if the url in the tab have changed between the time the user clicked on the button to fill and the data is sent to the page.

## [2.10.2] - 2019-07-10
- GITHUB-66: The browser extension doesn't build by default on unix system
- GITHUB-70: Fix autofill for self-hosted GitLab instance does not work
- GITHUB-71: Fix autofill for openstack horizon does not work
- PB-449: Fix image url when using non local image storage
- PB-449: Fix auth redirect when passbolt is installed in directory

### Improved
- Update the resources local storage when add, delete or update resources

## [2.10.1] - 2019-05-17
### Fixed
- Fix suggested section typo

## [2.10.0] - 2019-05-17
### Added
- PB-189: Quickaccess: As LU I can browse my passwords with the quickaccess using filters

### Fixed
- PB-40: Quickaccess: Don't hide not sanitized uri in the resource view screen

## [2.9.2] - 2019-04-25
### Fixed
- PB-227: Fix browser extension backward compatibility with API < v2.2.0

## [2.9.1] - 2019-04-25
### Fixed
- PB-3: Quickaccess: Fix resource create screen styleguide

## [2.9.0] - 2019-04-24
### Add
- PB-3: Quickaccess: As LU I can add a password via the quickaccess

## [2.8.3] - 2019-04-17
### Fixed
- GITHUB-58: Use consistent wording to define a gpg private key passphrase
- GITHUB-64: As AP when I am logging in with the quickaccess I should see a relevant error message in any cases
- GITHUB-63: Fix password generation mask
- PB-177: Upgrade Jquery to v3.4
- PB-178: Drop fetch polyfill for chrome
- PB-153: Fix dictionary test result when pwnedpassword is unavailable
- GITHUB-14: As LU I should be able to navigate into the passphrase popup with the keyboard

## [2.8.2] - 2019-04-02
### Fixed
- Fix broken event. Exception has to be serialized before emiting them from addon to content code
- Fix typo in README

## [2.8.1] - 2019-04-02
### Fixed
- PB-97: Fix - As a user I cannot login using the QuickAccess if i'm using MFA

## [2.8.0] - 2019-04-01
### Add
- PB-3: Quickaccess: Simplified app to access passwords from the browser extension

## [2.7.0] - 2019-02-08
### Improvement
- PASSBOLT-3347: When the extension requires the users to enter their master password, the popup should be displayed with no delay
- PASSBOLT-3313: As GM adding a user to a group I should see the loading popup when the extension is processing/requesting the API
- PASSBOLT-3312: As GM adding a user to a group I should see a relevant feedback in case of network/proxy errors
- PASSBOLT-3316: As LU Sharing a password I should see a loading feedback when the extension is requesting the API
- PASSBOLT-3318: As LU I should retrieve a secret when I'm copying it
- PASSBOLT-3319: As LU I should retrieve a secret when I'm editing it
- PASSBOLT-3403: As LU I should retrieve secrets when I'm exporting the associated passwords

## [2.4.6] - 2018-12-18
### Fix
- Update to openpgpjs to v4.3.0

## [2.4.5] - 2018-12-04
### Fix
- PASSBOLT-3256: Fix the bulk share passwords feature which could have forgot passwords when a user is sharing more than 100 passwords

## [2.4.4] - 2018-11-08
### Fix
- GITHUB-52 As AP I should be able to generate a gpg key with a comment

## [2.4.3] - 2018-11-05
### Add
- PASSBOLT-3093: As LU I can select all passwords to perform a bulk operation

### Fix
- Update openpgpjs to v4.2.0

## [2.4.2] - 2018-10-26
### Fix
- Fix copy to clipboard does not work on firefox when focus is set on search text input

## [2.4.1] - 2018-10-15
### Fix
- Fix application pagemod not starting after mfa verification

## [2.4.0] - 2018-10-12
### Added
- PASSBOLT-2983: As LU I should be able to share multiple passwords in bulk

### Improved
- PASSBOLT-2981: As Pro LU importing a large set of passwords I should request the API by batch
- PASSBOLT-3074: As a logged in user selecting a "remember me" duration the  checkbox should be selected automatically

### Fix
- PASSBOLT-3022: Fix the "import tag" is not associated to passwords imported from a csv where have no category

## [2.2.1] - 2018-08-14
### Fix
- Fix login redirect issue, it should not redirect to / if passbolt is installed in a subfolder

## [2.2.0] - 2018-08-13
### Fix
- Fix setup fatal error should not trigger a redirect
- PASSBOLT-2940 AppPagemod should start on the routes of the appjs /app/*

## [2.2.0] - 2018-08-09
### Fix
- Fix setup fatal error should not trigger a redirect
- PASSBOLT-2940 AppPagemod should start on the routes of the appjs /app/*

## [2.1.0] - 2018-06-14
### Add
- Add support for dark theme
- Add check if passphrase is part of a dictionary

### Fix
- Fix press escape to close master password dialog regression
- GITHUB-268 Fix remember me checkbox label should be clickable
- GITHUB-46 Fix security token validation regression
- PASSBOLT-2854 [Pro] Fix bug tags imported are always the same
- PASSBOLT-2887 [Pro] Fix iframe resize issue
- PASSBOLT-2883 Fix logout link and remember me cleanup

## [2.0.10] - 2018-06-07
### Fix
- Fix export of kdbx contain test values

## [2.0.9] - 2018-05-23
### Fix
- Fix content scripts should not be inserted if they are already present.
- Fix auth pagemod should insert script when a redirection is set in url
- Fix json.headers should be json.header

## [2.0.8] - 2018-05-09
### Fix
- Fix backward compatibility issue with user search API

## [2.0.7] - 2018-05-09
### Fix
- Fix backward compatibility issue with legacy API.

## [2.0.6] - 2018-05-08
### Fix
- Temporarily rollback of v2.0.5 as it break compatibilty with API version < v1.6.10

## [2.0.5] - 2018-05-08
### Fix
- PASSBOLT-2857: Fix password generator does not use secure PRNG
- GITHUB-35: Fix login redirects in wrong tab
- PASSBOLT-2764: Fix share autocomplete search concurrency issue on result display

### Improve
- PASSBOLT-2853: Upgrade to OpenPGP.js 3.x
- PASSBOLT-2853: Improve error feedback on login
- PASSBOLT-2853: Cleanup config defaults

## [1.6.10] - 2018-03-28
### Fixed
- PASSBOLT-2774: Fix download in chrome 65
- PASSBOLT-2777: Manage third party libraries with npm
- PASSBOLT-2709: [Pro] As LU I can use the remember me feature on the login form
- PASSBOLT-2707: [Pro] As LU I can choose the duration passbolt remember my passphrase in a set of options
- PASSBOLT-2648: [Pro] As LU I can import passwords from kdbx or csv
- PASSBOLT-2655: [Pro] As LU I can export my passwords in kdbx or csv

## [1.6.9] - 2018-02-13
### Fixed
- GITHUB-38: Fix to allow password to be remembered for 5 minutes when Enter is pressed
- GITHUB-39: Fix Firefox plugin claiming to be Chrome on wrong domain template
- PASSBOLT-2677: Add version number to all API calls
- PASSBOLT-2677: Fix recover link is wrong when optional redirect parameter is set in url
- PASSBOLT-2677: Bump dependencies to higher versions

## [1.6.8] - 2017-12-28
### Fixed
- PASSBOLT-2558: Security fix content scripts should not be injected on non trusted domain
- PASSBOLT-2558: Wordsmith verify feature help text
- PASSBOLT-2199: Drop jpm from list of dependencies
- PASSBOLT-2199: Fix key import key info screen control flow
- PASSBOLT-2199: Fix register link
- PASSBOLT-2199: Add alternative Gpgkey key property armored_key prior to API v2 rollout
- PASSBOLT-2474: Add new github contribution guidelines and issue templates

## [1.6.7] - 2017-10-13
### Fixed
- PASSBOLT-2452: Fix broken template on stage0 missing server key
- PASSBOLT-2455: Fix setup should not use browser storage to temporarily store private key

## [1.6.6] - 2017-10-02
### Fixed
- PASSBOLT-2419: Remove FF legacy extension support
- PASSBOLT-2423: Template missing when recovering an account: setup/importKeyRecoverInfo.ejs
- PASSBOLT-2425: Chrome 61, issue with minified version of jquery

## [1.6.5] - 2017-09-14
### Fixed
- PASSBOLT-2386: Enforce the usage of templates instead of manual DOM content insertion

## [1.6.4] - 2017-08-31
### Fixed
- PASSBOLT-2344: Remove content scripts from web accessible resources
- PASSBOLT-2352: Webextension should not use defer(), use native promise instead
- PASSBOLT-2350: Move grunt-passbolt-ejs-template-compile as node module
- PASSBOLT-2370: Plugin upgrade openpgpjs to 2.5.10

## [1.6.3] - 2017-08-21
### Fixed
- PASSBOLT-2318: Remove unsafe-eval from CSP
- PASSBOLT-2318: Precompile EJS templates using grunt-passbolt-ejs-compile task
- PASSBOLT-2269: As LU I can't encrypt a secret for more than 200 people #GITHUB-124
- PASSBOLT-2346: Plugin upgrade openpgpjs to 2.5.9

## [1.6.2] - 2017-08-12
### Added
- PASSBOLT-2198: Migrate from Firefox legacy SDK to embed/native webextensions
- PASSBOLT-2254: Add log system to grab selenium tests traces
- PASSBOLT-2210: Update Grunt build tasks
- PASSBOLT-2200: Update to OpenPGP.js version 2.5.8
- PASSBOLT-2069: Update to JQuery version 3.2.1
- PASSBOLT-2248: Migrate from window.localStorage to chrome.storage on chrome
- PASSBOLT-2283: Migrate from simplestorage to chrome.storage on firefox

## [1.6.0] - 2017-06-21
### Fixed
- PASSBOLT-2078: As GM/AD I shouldn't be able to add a user who didn't complete the registration process to a group I edit/create
- PASSBOLT-2111: As an admin I should be able to install passbolt under mydomain.tld/passbolt

## [1.5.1] - 2017-05-23
### Fixed
- PASSBOLT-1908: Fix memory leak with openpgp webworker initialization

## [1.5.0] - 2017-05-16
### Added
- PASSBOLT-1955: As an administrator I can create a group
- PASSBOLT-1969: As a group manager I can see which users are part of a given group from the group edit dialog
- PASSBOLT-1838: As a group manager I can add a user to a group using the edit group dialog
- PASSBOLT-1838: As a group manager adding a user to a group, the passwords the group has access should be encrypted for the new user
- PASSBOLT-1838: As a group manager I can remove a user from a group using the edit group dialog
- PASSBOLT-1969: As a group manager I can edit the membership roles
- PASSBOLT-1953: As a user I can share a password with a group
- PASSBOLT-1940: As a user when editing a password for a group, the secret should be encrypted for all the members

### Fixed
- PASSBOLT-2031: Share a password with multiple users/groups in a single operation

## [1.4.3] - 2017-02-16
### Updated
- PASSBOLT-1909: updated openpgpjs to latest version: 1.3.7. Thanks to @pomarec for the pull request. (https://github.com/passbolt/passbolt_browser_extension/pull/11)

## [1.4.2] - 2017-02-11
### Fixed
- Fix for chrome 56 memory leak (https://www.passbolt.com/incidents/20170210_chrome_not_available)

## [1.4.0] - 2017-02-07
### Fixed
- PASSBOLT-1850: GITHUB-5 Minor spelling and grammar fixes (@colin-campbell)
- PASSBOLT-1807: Fix parsing issues with keys that have multiple identities

## [1.3.2] - 2017-01-16
### Fixed
- PASSBOLT-1827: As a user I should be able to log in with a passphrase longer than 50 chars in length
- PASSBOLT-1809: As a developer I should be able to get the chrome zip distrib file as part of the build process

## [1.3.1] - 2017-01-03
### Fixed
- PASSBOLT-1606: Wrong message when auto logged out and passbolt is not the active tab
- PASSBOLT-1769: Refactor extension bootstrap, prepare code to welcome future features
- PASSBOLT-1759: Share: autocomplete list will appear even when there is no text entered in the search
- PASSBOLT-1760: Share: image is broken in the autcomplete list after user has changed it
- PASSBOLT-1566: Share autocomplete html is not valid
- PASSBOLT-1778: Simplify toolbarController openPassboltTab function
- PASSBOLT-1680: Password is limited to 50 chars, increase the limit to 4096
- PASSBOLT-1657: As AP I should not be able to complete the recovery process with my public key

## [1.3.0]
### Added - 2016-11-25
- PASSBOLT-1725: Chrome support

### Fixed
- PASSBOLT-1708: Refactor Request get and post to use fetch

## [1.2.0] - 2016-10-16
### Fixed
- PASSBOLT-1668: Refactor GPGAuth to handle capitalization issue. See github #24 & #16
- PASSBOLT-1660: Refactoring ground work for Chrome Extension
- PASSBOLT-1698: Gpgkey is not downloadable after generation

## [1.1.1] - 2016-08-13
### Fixed
- PASSBOLT-1655: Visual glitch on password create field, bump to styleguide v1.1.0
- PASSBOLT-1635: Clean/Document messaging layer

## [1.1.0] - 2016-08-09
### Fixed
- PASSBOLT-1432: Passbolt.app pagemod shouldn't start if user is not logged in

## [1.0.13] - 2016-07-01
### Fixed
- PASSBOLT-1366: Worker bug when multiple passbolt instances are open in multiple windows

### Added
- PASSBOLT-1588: As AN it should be possible to recover a passbolt account on a new device.

## [1.0.12] - 2016-05-31
### Added
- PASSBOLT-959: Added plugin version number in footer.
- PASSBOLT-1488: As AP, I shouldn't be able to complete the setup if I import a key that already exist on server.

### Fixed
- PASSBOLT-1255: Button height issues + missing tooltip on setup

## [1.0.11] - 2016-16-16
### Added
- PASSBOLT-1108: As LU when entering my master key I can have the plugin remember it for 5 min.

### Fixed
- PASSBOLT-1494: After two consecutive setup, the plugin stops working and doesn't start anymore.

## [1.0.10] - 2016-05-03
### Changed
- PASSBOLT-1316: As a AP trying to register again, I should see an information message informing me that the plugin is already configured.


## [1.0.9-b] - 2016-04-25
### Fixed
- PASSBOLT-1457: As LU, I should not be able to create a resource without password.
- PASSBOLT-1441: Wordsmithing: a parenthesis is missing on set a security token step.
- PASSBOLT-1158: Remove all errors (plugin/client) from the browser console at passbolt start.

### Changed
- PASSBOLT-1456: When generating a password automatically it only generates a "fair" level password.

## [1.0.9-a] - 2016-04-15
### Fixed
- PASSBOLT-1408: As a LU I should see the email addresses of the people I'm sharing a password with.

## [1.0.8] - 2016-04-05
### Fixed
- PASSBOLT-1455: As a AP during setup I should not see Learn more broken links.
- PASSBOLT-1158: Cleanup: remove useless console.log() from the code.

## [1.0.7] - 2016-04-04
### Fixed
- PASSBOLT-1158: Cleanup: remove useless console.log() from the code.
- PASSBOLT-1462: Remove spelling mistake on encrypting.

## [1.0.6] - 2016-03-28
### Fixed
- PASSBOLT-1424: Cleanup: in Firefox addon remove URL_PLUBLIC_REGISTRATION.
- PASSBOLT-1417: At the end of the setup, or in case of setup fatal error, setup data should be cleared.
- PASSBOLT-1359: Setup should restart where it was left.


## [1.0.5] - 2016-03-21
### Added
- PASSBOLT-1304: As a LU getting an Error500 when trying to authenticate I should see a retry button.
- PASSBOLT-1310: As user whose account is deleted I should get an appropriate feedback on login.

### Fixed
- PASSBOLT-1377: As LU I should be able to login again after my session timed out.
- PASSBOLT-1381: As LU I should not be able to share a password with a user who is registered but who has not completed his setup
- PASSBOLT-1418: The App worker should be attached only on private pages.

# Terminology
- AN: Anonymous user
- LU: Logged in user
- AP: User with plugin installed
- LU: Logged in user

[Unreleased]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.1.0...HEAD
[4.1.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.4...v4.1.0
[4.0.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.3...v4.0.4
[4.0.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.1...v4.0.3
[4.0.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.12.1...v4.0.0
[3.12.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.12.0...v3.12.1
[3.12.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.11.2...v3.12.0
[3.11.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.11.0...v3.11.2
[3.11.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.10.0...v3.11.0
[3.10.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.9.2...v3.10.0
[3.9.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.9.0...v3.9.2
[3.9.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.8.0...v3.9.0
[3.8.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.3...v3.8.0
[3.7.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.2...v3.7.3
[3.7.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.1...v3.7.2
[3.7.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.0...v3.7.1
[3.7.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.6.2...v3.7.0
[3.6.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.6.1...v3.6.2
[3.6.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.6.0...v3.6.1
[3.6.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.5.2...v3.6.0
[3.5.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.5.1...v3.5.2
[3.5.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.3.1...v3.4.0
[3.3.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.2.3...v3.3.0
[3.2.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.2.2...v3.2.3
[3.2.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.1.0...v3.2.1
[3.1.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.7...v3.1.0
[3.0.7]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.6...v3.0.7
[3.0.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.5...v3.0.6
[3.0.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.4...v3.0.5
[3.0.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.8...v3.0.0
[2.13.8]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.7...v2.13.8
[2.13.7]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.6...v2.13.7
[2.13.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.5...v2.13.6
[2.13.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.4...v2.13.5
[2.13.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.3...v2.13.4
[2.13.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.2...v2.13.3
[2.13.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.1...v2.13.2
[2.13.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.0...v2.13.1
[2.13.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.12.1...v2.13.0
[2.12.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.12.0...v2.12.1
[2.12.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.3...v2.12.0
[2.11.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.2...v2.11.3
[2.11.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.1...v2.11.2
[2.11.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.0...v2.11.1
[2.11.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.10.1...v2.11.0
[2.10.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.10.0...v2.10.1
[2.10.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.9.2...v2.10.0
[2.9.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.9.1...v2.9.2
[2.9.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.9.0...v2.9.1
[2.9.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.8.3...v2.9.0
[2.8.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.8.2...v2.8.3
[2.8.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.8.1...v2.8.2
[2.8.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.8.0...v2.8.1
[2.8.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.7.0...v2.8.0
[2.7.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.4.6...v2.7.0
[2.4.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.4.5...v2.4.6
[2.4.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.4.4...v2.4.5
[2.4.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.4.3...v2.4.4
[2.4.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.4.2...v2.4.3
[2.4.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.4.1...v2.4.2
[2.4.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.2.1...v2.4.0
[2.2.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.0.10...v2.1.0
[2.0.10]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.0.9...v2.0.10
[2.0.9]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.0.8...v2.0.9
[2.0.8]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.0.7...v2.0.8
[2.0.7]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.0.6...v2.0.7
[2.0.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.10...v2.0.5
[1.6.10]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.9...v1.6.10
[1.6.9]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.6...v1.6.9
[1.6.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.5...v1.6.6
[1.6.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.4...v1.6.5
[1.6.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.3...v1.6.4
[1.6.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.4.2...v1.5.0
[1.4.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.4.2...v1.4.3
[1.4.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.4.0...v1.4.2
[1.4.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.13...v1.1.0
[1.0.13]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.12...v1.0.13
[1.0.12]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.9-b...v1.0.10
[1.0.9-b]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.9-a...v1.0.9-b
[1.0.9]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.8...v1.0.9-a
[1.0.8]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/passbolt/passbolt_browser_extension/compare/1.0.4...v1.0.5
