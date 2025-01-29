Song: https://youtu.be/3RmQTYLD398?si=Eye1bVyIM2DTax2v

Passbolt v4.11.0 introduces beta support for encrypted metadata in the administration settings, laying groundwork for the upcoming v5 release and its new resource format. This beta feature allows developers and integrators to explore and adapt their systems ahead of the transition.

This release also resolves a security issue where an attacker could modify the Passbolt URL in certain emails if an administrator’s configuration was invalid. Additionally, role-based access control is now enforced for the “Copy to Clipboard” feature in the browser extension. Vulnerabilities in dependencies—though not directly impacting Passbolt—have been addressed as well.

As one of the final updates in the v4 series, this version prepares administrators for v5. While v4.11.0 does not require PHP 8.2, v5 will. We recommend beginning to plan or upgrade PHP to ensure a smooth transition. If a server migration is needed, please consult the online documentation.

Thank you to the community for your feedback and support.

### Added
PB-37669: WP5-1.1 Implement save method in ServiceWorker
PB-37670: WP5-1.2 Implement SaveMetadataSettingsService in the Service Worker to handle saving of metadata types settings
PB-37671: WP5-1.3 Implement SaveMetadataTypesSettingsController in the Service Worker to expose metadata types settings save functionality to the content code
PB-37672: WP5-1.4 Implement MetadataSettingsBextService in the Content Code to handle Service Worker requests that handles metadata types settings
PB-37673: WP5-1.5 Add MetadataTypesSettingsEntity in the Content Code to support the metadata types settings form data
PB-37676: WP5-1.6 Implement DisplayContentTypesMetadataAdministrationActions in the content Code to support content types metadata administration actions
PB-37677: WP5-1.7 Implement DisplayContentTypesMetadataAdministration in the Content Code to display the metadata content types administration form
PB-38019: WP5-1.8 Implement entity v2 required getter, setter, and comparison function to handle form data
PB-38020: WP5-1.9 Add allow_v4_v5_upgrade property to metadata types settings entity
PB-38021: WP5-1.10 Implement verifyDataHealth on MetadataTypesSettingsFormEntity to verify the settings health and help prevent problematic situations
PB-38022: WP5-2.2 Metadata keys collection shouldn’t try to decrypt metadata private key that are not encrypted
PB-38093: WP5-2.1 Make ExternalGpgKeyEntity and ExternalGpgCollection accessible to the content code
PB-38105: WP5-2.3 Add support of expired on metadata key entity
PB-38106: WP5-2.4 Find all metadata keys for session storage should not retrieve deleted keys
PB-38108: WP5-2.5 Apply style on content types encrypted metadata administration screen
PB-38111: WP5-2.6 Implement MetadataKeysServiceWorkerService in the Content Code to request the Service Worker to retrieve metadata keys
PB-38121: WP5-2.7 Implement findKeysSettings in MetadataSettingsServiceWorkerService in the Content Code to request the Service Worker to retrieve metadata keys settings
PB-38124: WP5-2.8 Implement GpgServiceWorkerService in the Content Code to request the Service Worker and retrieve gpg keys info
PB-38135: WP5-2.9 Implement DisplayContentTypeMetadataKeysAdministration component to read metadata keys settings
PB-38186: WP5-2.11 Make ExternalGpgKeyPairEntity accessible to the content code
PB-38194: WP5-2.10 Implement generate function on MetadataKeysServiceWorkerService to support new metadata key generation in content types metadata keys administration page
PB-38198: WP5-2.12 As an administrator I can generate metadata key when there is none yet active
PB-38201: WP5-2.13 Implement findAll and findAllActive on findUsersService to retrieve respectively all users and only active users
PB-38258: WP5-2.14 Implement saveKeysSettings function on MetadataSettingsServiceWorkerService to save metadata keys settings in the content types metadata keys administration page
PB-38259: WP5-2.15 Implement EncryptMetadataPrivateKeysService to encrypt metadata private key data
PB-38260: WP5-2.16 Implement save capability on the metadata keys settings administration page

### Fixed
PB-37682: URI not stored when password is weak with the quick access
PB-38125: Display auto-fill CTA when the browsed page does not display its iframes

### Security
PB-37706: Fix RBAC preview and copying should no be allowed after group filter
PB-38310: Upgrade i18next-parser undici dependency

### Maintenance
PB-38027: Remove .page.js from styleguide code coverage
PB-38243: Upgrade playwright dependency and fix CI
