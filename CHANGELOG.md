# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Fixed
- GITHUB-58: Use consistent wording to define a gpg private key passphrase

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

[Unreleased]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.8.2...HEAD
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
