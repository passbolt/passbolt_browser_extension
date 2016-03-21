# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
(Add here current version changes)

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

[Unreleased]: https://github.com/passbolt/passbolt_firefox/compare/v1.0.5...HEAD
[1.0.5]: https://github.com/passbolt/passbolt_firefox/compare/1.0.4...v1.0.5