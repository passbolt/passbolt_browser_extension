# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
- PASSBOLT-1366: Worker bug when multiple passbolt instances are open in multiple windows

## [1.0.12]
### Added
- PASSBOLT-959: Added plugin version number in footer.
- PASSBOLT-1488: As AP, I shouldn't be able to complete the setup if I import a key that already exist on server.

### Fixed
- PASSBOLT-1255: Button height issues + missing tooltip on setup

## [1.0.11]
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

[Unreleased]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.12...HEAD
[1.0.11]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.9-b...v1.0.10
[1.0.9-b]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.9-a...v1.0.9-b
[1.0.9]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.8...v1.0.9-a
[1.0.8]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/passbolt/passbolt_firefox/compare/1.0.4...v1.0.5