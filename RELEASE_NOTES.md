Release song: https://www.youtube.com/watch?v=HR1KH4zElcY

Hey community members,

Prepare for an exciting update! 🥁

Passbolt is thrilled to announce that the v4.5.0 Release Candidate is officially available for testing. With this release candidate you will be able to get a preview of the password expiry feature if you install both the RC of the browser extension and the API with the `PASSBOLT_PLUGINS_PASSWORD_EXPIRY_ENABLED` feature flag enabled and additionally the `PASSBOLT_PLUGINS_PASSWORD_EXPIRY_POLICIES_ENABLED` feature flag enabled for the version PRO.

Head to GitHub and dive in, following the steps [here](https://community.passbolt.com/t/passbolt-beta-testing-how-to/7894). As always, your feedback is invaluable, please share and report any issues you come across.

Thank you for your support, helping test passbolt prior to a release is a very valuable contribution to the project! ♥️

## [4.5.0-rc.0] - 2024-02-02
### Added
- PB-28679 As an administrator I can set advanced password expiry settings
- PB-28681 As a user importing a resources from a file I should also import expiry date from keepass files
- PB-28682 As a user I can quickly mark resources as expired
- PB-28687 As a resource owner, I can change the resource expiration date manually
- PB-28692 As a user I can change the expiry date of a resource automatically based on the password expiry configuration
- PB-28850 As a signed-in user creating a resource from the app I should set the expired date if default expiry period has been defined in the organisation policies
- PB-28851 As a signed-in user creating a resource from the quickaccess I should set the expired date if default expiry period has been defined in the organisation policies
- PB-28852 As a signed-in user creating a resource from the auto-save I should set the expired date if default expiry period has been defined in the organisation policies
- PB-29045 As a user I want to open the quickaccess using a keyboard shortcut
- PB-29125 As an administrator I should not see the control function AllowIfGroupManagerInOneGroup on the UI

### Improved
- PB-15269 As a user I do not want my browser extension to make multiple calls on resources.json in a row
- PB-21484 As an administrator I can use Microsoft 365 or Outlook as SMTP providers
- PB-22071 As an administrator I want the SSO messages to be in correct english
- PB-25503 As an admin I should be able to enable/disable emails that request group managers to add users to groups (LDAP/AD)
- PB-25860 As signed-in user I want to see the full name of the user at the origin of any account recovery action
- PB-27783 As a user opening the quickaccess I should have a clear feedback if the API service is unreachable
- PB-27961 As a signed-in user I cannot skip the administrator request to join the account recovery program
- PB-28507 As signed-in user importing resources I should know what is supported
- PB-28612 As a signed-in user I should see TOTP in uppercase
- PB-28646 As an administrator in the account recovery settings I should see “Prompt” instead of “Mandatory"
- PB-28709 Mark SASL option in Users Directory as Enterprise Edition
- PB-28727 As an administrator in the SSO settings I should see a combobox instead of a text input for the Azure’s URL
- PB-28923 As a user I want to be able to use passbolt in Russian
- PB-29008 As an administrator in RBAC administration page I should not see the role to setup the desktop or mobile app if the plugin is not enabled
- PB-29159 As a signed-in user I want the Mfa screen to be available when using the bext 4.4 and API 4.5
- PB-29263 Replace the mechanism to have CSRF token from the cookie


### Security
- PB-29194 Upgrade vulnerable library web-ext
- PB-28658 Mitigate browser extension supply chain attack
- PB-28659 Mitigate browser styleguide supply chain attack
- PB-28660 Mitigate browser windows app supply chain attack

### Fixed
- PB-22864 As a signed-in user, I should see a relevant error if I use special characters as security token
- PB-24496 As a user I should be able to use a passphrase with emoji
- PB-28283 As a user when I preview a secret I should see the activity sidebar updated
- PB-28540 As a user I should scroll automatically to the resource selected from the route
- PB-28625 As a user I can open resource url from the resource sidebar on Firefox
- PB-28632 As a user Fix design TOTP button disabled on create and edit resource
- PB-28696 As a user I should fill secret for TOTP with spaces
- PB-28721 As a user I can see the beta chip next to the desktop app menu item in the users settings menu
- PB-28753 As a user I should be able to edit a standalone TOTP from contextual menu
- PB-28880 As a user I should not see an error when I update the description of a resource with TOTP from the information panel
- PB-28842 As a user I can reach the Windows store passbolt app from the Desktop app setup screen
- PB-28282 As a user deleting a TOTP I should see the relevant dialog title mentioning Resource and not password
- PB-28873 As a signed-in user when I autofill input fields I should trigger a change event
- PB-29006 As a user I should not have my browser extension crashing when it receives an unsupported RBAC control_function value

### Maintenance
- PB-27972 Refactor code of SSO settings
- PB-28592 Fix minimum gecko version in firefox manifest.json
- PB-29020 Fix detection pagemod duplicate
