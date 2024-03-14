The Passbolt Pro 4.6.0 release "Purple Haze", brings a new SSO provider and improves administrative aspects and overall system health.

A major addition in this release is the Beta implementation of SSO AD FS (Active Directory Federation Services), enabling streamlined single sign-on capabilities for improved user access management.

Furthermore, this version incorporates the Health Check feature within the Admin workspace, offering administrators a comprehensive tool for system health assessment, thereby enhancing the platform's maintainability and reliability.

This release also focuses on refining the platform's infrastructure for enhanced performance. It lays the groundwork for future updates by optimizing data verification processes and reducing memory usage during web activities.

The update paves the way for a series of successive enhancements with the next releases.

## [4.6.0] - 2024-03-14
### Added
- PB-24485 As signed-in administrator I can see the healthcheck in the UI
- PB-29051 As a user I can use ADFS as SSO provider
- PB-29162 As signed-in administrator I can authorize only group managers to see the users workspace
- PB-29396 As signed-in administrator I can hide the share folder capability with a RBAC

### Security
- PB-29384 As signed-in administrator I should see a 404 when accessing a non existing administration page
- PB-29384 As signed-in user I should see a 403 when attempting to access an administration page

### Fixed
- PB-25865 As a signed-in user I want to autofill form which listen to change events
- PB-27709 As signed-in administrator I can reconfigure the LDAP integration after a server key rotation
- PB-29258 A signed-in users with a large data set I should have a direct feedback when selecting a resource with the checkbox
- PB-29506 As signed-in user, when loading the application, I should scroll to the resource detected in the url
- PB-29548 As a signed-in administrator, editing the password expiry policy, I want to be sure that I’m editing the latest version of the settings
- PB-29606 As signed-in user I should be able to export TOTP to keepass for Windows
- PB-29860 As signed-in user I should see the columns header translated to my language
- PB-29861 As signed-in user I should see the filter “Expiry” named “Expired” instead
- PB-29895 As user importing an account to the Windows application I should be able to access the getting started help page
- PB-29961 As signed-in user I want to see the import dialog information banner below the form and before the action buttons
- PB-30033 As a signed-in user I should be able to sign in with the quickaccess right after launching my browser

### Maintenance
- PB-25555 Upgrade outdated dev library webpack and associated
- PB-25556 Upgrade outdated library i18next and associated
- PB-25689 Upgrade outdated library ip-regex and associated
- PB-25692 Upgrade openpgpjs to v5.11
- PB-25696 Upgrade outdated library webextension-polyfill
- PB-25699 Upgrade outdated library xregexp
- PB-25701 Upgrade outdated library luxon
- PB-29162 MFA user settings screens should be served by the browser extension
- PB-30015 Homogeneize collection constructor signature
- PB-30017 Remove collection and entity inheritance dependency
- PB-30021 Make collection and entity DTO optionally cloneable
- PB-30022 Reduce the number of resources collection instantiations while displaying the number of suggested resources
- PB-30023 Reduce the number of resources collection instantiations while displaying the suggested resources in the inform menu
- PB-30142 Homogenize collection and entity call parameters
- PB-30143 Ensure entities DTOs are not cloned when the data is retrieved from the API or the local storage
- PB-30156 Ensure the tags collection is not validating multiple times the entities while getting instantiated
- PB-30324 Reduce garbage collector usage while validating large amount of data
