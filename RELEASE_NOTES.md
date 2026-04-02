Passbolt 5.10.4 is a hotfix release. It resolves a bug on the resources workspace where filtering resources by URIs would cause the application to crash, a regression surfaced by the latest upgrade of the UI framework.

If you encountered the issue before updating, resetting your column customization in the workspace will restore normal behavior.

### Fixed
- PB-50034 As a user I should be able to sort by uris
- PB-49459 Timeouts not cleared properly when filtering resources/users grids by keywords
