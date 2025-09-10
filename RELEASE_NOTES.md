Release song: https://youtu.be/L3Wo8jcNrkQ?si=HiNK6kSFC-aMFMJe

Passbolt 5.5.0-RC.0 is a feature release candidate that lets administrators run encrypted metadata in zero-knowledge mode and adds SCIM provisioning (beta) for easier user management.

# Zero-knowledge
Zero-knowledge for encrypted metadata is intended for organisations that prioritise maximum privacy and can do without server-side auditability. In this mode, the server never receives the shared metadata private key and therefore cannot access any resource metadata.

When a new user joins, the server does not automatically share the key with them. Instead, administrators are notified by email once the user has completed their activation and is ready to receive access. From the Users & Groups workspace, administrators can then review the situation and share the key when the time is right.

Until a user receives the key, their experience is intentionally limited: actions that depend on the shared metadata key, such as sharing a resource, moving a private item into a shared folder, or creating content meant to be shared, are blocked.

To know more about the encrypted metadata zero-knowledge mode, check out this [blog post](https://www.passbolt.com/blog/the-road-to-passbolt-v5-encrypted-metadata-and-other-core-security-changes-2).

# SCIM (beta)
This release also introduces SCIM 2.0 (beta) to automate user provisioning with your identity provider. The first iteration focuses on Microsoft Entra ID (Azure AD) and is available on Passbolt Pro.

With SCIM, administrators can create, update, and deactivate users directly from their identity provider, without ever touching the Passbolt UI. For now, only user synchronisation is supported, while group synchronisation will follow in a future update.

Note that Okta should work out of the box, though some journeys may still need polish, such as the user deactivation.

Several bugs reported by the community have also been fixed. As always, thank you to everyone who took the time to file issues and suggest improvements. Checkout the changelog for more information.

### Added
- PB-43921 - Increase directory sync report dialog size
- PB-44816 Pro teasing - WP1.1 Create DisplaySubscriptionKeyTeasing component
- PB-44817 Pro teasing - WP1.2 Create DisplayPasswordPoliciesAdministrationTeasing
- PB-44818 Pro teasing - WP1.3 Create DisplayAdministrationUserPassphrasePoliciesTeasing
- PB-44819 Pro teasing - WP1.4 Create ManageAccountRecoveryAdministrationSettingsTeasing
- PB-44820 Pro teasing - WP1.5 Create ManageSsoSettingsTeasing
- PB-44821 Pro teasing - WP1.6 Create DisplayMfaPolicyAdministrationTeasing
- PB-44822 Pro teasing - WP1.7 Create DisplayUserDirectoryAdministrationTeasing
- PB-44823 Pro teasing - WP1.8 Create DisplayScimAdministrationTeasing
- PB-44826 Pro teasing - WP2.1 Add teasing property and new route on AdministrationHomePage
- PB-44827 Pro teasing - WP2.2 Update the DisplayAdministrationMenu to display teasing Icon on PRO menu for CE
- PB-44393 ZK - WP5.1 As an administrator I should be able to enable zero knowledge mode
- PB-44646 ZK - WP5.3 Add share metadata private keys to MetadataKeysSettingsEntity
- PB-44641 ZK - WP5.4 Create UpdateMetadataSettingsPrivateKeyService to to be able to disabled zero knowledge mode
- PB-44631 ZK - WP5.5 Update SaveMetadataKeysSettingsController to be able to disabled zero knowledge mode
- PB-44757 ZK - WP5.6 As an administrator with missing metadata keys I should not be able to change metadata settings
- PB-44630 - SCIM administration screen

### Fixed
- PB-44638 - Password expiry should not be removed when password is not updated
- PB-44604 - Fix regular expression on public key metadata validation
- PB-44707 - Fix service worker not restarting after browser extension update on Chrome
- PB-45060 - Fix custom fields json schema properties type
- PB-44933 - Fix setup a new user should have missing key set

### Maintenance
- PB-44594 - Upgrade xregexp to 5.1.2
- PB-44638 Password expiry should not be removed when password is not updated
- PB-44668 The create menu import operation should be actionable when encrypted metadata plugin is not available
