Passbolt 5.11.0 “Song Name” introduces improvements to enterprise authentication and integration capabilities, alongside continued security hardening.

This release adds support for OAuth-based SMTP authentication for Microsoft Exchange Online and expands SSO coverage with PingOne. It also includes the finalisation of SCIM following external audit fixes.

## SMTP OAuth support for Microsoft Exchange Online 

Passbolt 5.11 introduces OAuth 2.0 support for SMTP with Microsoft Exchange Online, replacing legacy username/password authentication.

Administrators can configure the OAuth (Client Credentials) method by registering an application in Microsoft Entra ID and providing the required tenant ID, client ID, client secret, and service account email.

At runtime, Passbolt retrieves short-lived access tokens to authenticate SMTP connections without user interaction, improving security and aligning with modern authentication standards.


## PingOne SSO support (Passbolt Pro)

Passbolt 5.11 adds support for PingOne as a new SSO provider, enabling organisations to authenticate users via their existing Ping Identity infrastructure.

The integration is based on OpenID Connect (OIDC) using the Authorization Code flow, with Passbolt delegating authentication to PingOne and receiving a verified user identity via ID tokens.

Administrators can configure PingOne from the SSO settings using the required environment ID, client ID, client secret, and base URL, with a dry-run option available to validate the setup before activation. Once enabled, users are redirected to PingOne for authentication and seamlessly logged into Passbolt, including during account recovery.

This addition expands Passbolt’s SSO coverage for enterprise environments and removes a key adoption blocker for organisations standardised on Ping Identity.

## SCIM: audit fixes and general availability (Passbolt Pro)

Following the external security audit conducted by Cure53, this release includes fixes addressing the identified findings in the SCIM provisioning implementation.

With these changes, SCIM is now considered stable and exits beta.

The audit-driven improvements strengthen validation, error handling, and overall robustness of the provisioning flow. SCIM is now ready for production use in environments requiring automated user lifecycle management.

## Security improvements

This release continues the ongoing security hardening effort across the platform.

In addition to the SCIM audit fixes, improvements have been made to align with external audit recommendations and reduce potential attack surface in authentication and integration layers.

## Maintenance & performance

This release includes general performance improvements, particularly around background job processing and email delivery workflows.

Email-related operations are now more efficient and better distributed, reducing bottlenecks in high-load environments.

As usual, additional optimisations are already in progress for upcoming releases.

## Conclusion

As usual, the release is also packed with additional improvements and fixes. Check out the changelog to learn more.

Many thanks to everyone who provided feedback, reported bugs, and contributed to making passbolt better!

### Added
- PB-49733 SMTP-OAUTH - WP2.1 Update SmtpSettingsService to SmtpSettingsApiService
- PB-49734 SMTP-OAUTH - WP1.1 Create the SmtpSettingsEntity
- PB-49737 SMTP-OAUTH - WP2.2 Update SmtpTestSettingsService to SmtpTestSettingsApiService
- PB-49738 SMTP-OAUTH - WP2.3 Split SmtpSettingsModel to new architecture pattern
- PB-49739 SMTP-OAUTH - WP2.4 Split SmtpTestSettingsModel to new architecture pattern
- PB-49740 SMTP-OAUTH - WP3.1 Adapt context with the new SMTP entities
- PB-49741 SMTP-OAUTH - WP3.2 Adapt ManageSmtpAdministationSettings to handle the new OAUTH fields
- PB-50058 OAuth SMTP: add the new styleguide to backend
- PB-50135 SSO with PingOne
- PB-50157 Enable avatar upload for Safari
- PB-50254 SCIM-WP1.2 Adapt form to handle the new date field and display warning message when expired
- PB-50263 Add a username selector compatible with ProxMox

### Fixed
- PB-46678 Fix quickaccess closing issue on Safari
- PB-49237 DisplayUserBadgeMenu attention required should be displayed on Administration page served by API
- PB-49287 When deleting a user, the URL must changed not to reference the deleted user id
- PB-49476 Fix autofill for websites using identifier as name for username field
- PB-49619 Fix username input field selector for OVH
- PB-49849 Sync generator password policy with the administration after save
- PB-49866 Fix the expiry column in the resource workspace grid is not present anymore
- PB-49882 Fix username input field selector for Supermicro IPMI WebUI
- PB-50023 Fix multifield OTP selector matching hidden inputs
- PB-50077 Fix React router issue that reloads the page unexpectedly
- PB-50177 Fix autofill issues for two websites

### Maintenance
- PB-49129 Delegate tab opening to service worker in order to send all cookie via Safari
- PB-49459 Timeouts not cleared properly when filtering resources/users grids by keywords
- PB-49705 Add missing TOTP unit tests
- PB-49730 Setup an environment for publishing to npmjs registry
- PB-49998 Add required `data_collection_permissions` for Firefox and set it to `none`
- PB-50013 Make Safari download custom avatars
- PB-50118 Major upgrade for locutus (Critical) - passbolt-browser-extension
- PB-50158 Add Safari enablement through a feature flag
- PB-50200 Move the logic of passbolt.groups.create to GroupCreateController
- PB-50201 Update group create call in groupApiService to contain "my_group_user" as urlOptions
- PB-50202 Add supported formats documentation link in export dialog
- PB-50225 Create a CreateGroupService.js file and move the create call to api service inside it
- PB-50338 - Fix phantom @babel/preset-react

### Security
- PB-49608 Fix ReDoS vulnerability in PGP armor regex validation
- PB-50271 Fix GHSA-25h7-pfq9-p65f - HIGH CVSS3.1
- PB-50272 Fix brace-expansion vulnerabilities
