Release song: https://www.youtube.com/watch?v=kymdKYtkJbQ

Passbolt v5.4.0 ships with encrypted metadata and the accompanying new resource types promoted to stable. These capabilities have been battle-tested for months, and the last remaining edge cases have been smoothed out so they can now be enabled for everyone.

Removing the beta label means that every new instance starts with encrypted metadata activated by default. As a result, features introduced in previous releases, such as icons, multiple URIs and custom fields, are available from day one without any action from end-users.

For existing instances, the activation process has been simplified: administrators can decide with a single click whether their organisation is ready or would prefer to postpone the launch. Once enabled, the instance immediately supports the new resource types and their extended capabilities. Because the change may disrupt external integrations, existing content is not migrated automatically; migration remains the responsibility of content owners or administrators. It can be performed item-by-item in the resource workspace or organisation-wide with the resource-metadata administration migration tool.

Revisiting resource capabilities was also an opportunity to increase the maximum size of secret notes to 50 000 characters, leaving ample room for full certificate chains, keys of any flavour or any long text you need to keep encrypted.

This release further improves cryptographic performance by introducing elliptic-curve keys (Curve25519/Ed25519) for new users. These keys provide security comparable to RSA-3072 while significantly reducing processing time and payload size.

Performance has been tuned for large organisations that manage substantial numbers of users or resources. Among other improvements: Users' workspace now opens more quickly, and deleting multiple resources generates fewer I/O operations.

Czech joins the list of supported languages, allowing native speakers to use Passbolt entirely in their own words, vítejte!

Many thanks to everyone who reported issues and tested encrypted metadata over the past months. Your feedback made this release possible and brings these new features to all users today.

### Added
- PB-44201: E2EE The organisation settings offer now a simplified way to activate metadata encryption and the new resource types
- PB-42205: E2EE encrypted metadata and new resource types are activated by default after the first administrator setup
- PB-43255: Add support for multiple uri import export on kdbx files
- PB-43110: ZK - WP4.2 As a signed-in user I should not be allowed to upgrade resources with missing key situation
- PB-43712: Translate the application in Czech
- PB-43939: ZK - WP3.2 Add an app event to get or find the metadata keys settings
- PB-43980: Add support for custom field import export on kdbx files
- PB-44080: ZK - WP4.1 Create a dialog explaining the missing key situation
- PB-44081: ZK - WP4.3 As a signed-in user I should not be allowed to create resources with missing key situation in the resource workspace
- PB-44090: ZK - WP4.4 As a signed-in user I should not be allowed to edit resources with missing key situation
- PB-44091: ZK - WP4.5 As a signed-in user I should not be allowed to share resources with missing key situation
- PB-44094: ZK - WP4.6 As a signed-in user I should not be allowed to import resources with missing key situation
- PB-44095: ZK - WP4.7 As a signed-in user I should not be allowed to move resources with missing key situation
- PB-44096: ZK - WP4.8 As a signed-in user I should not be allowed to move folders with missing key situation
- PB-44097: ZK - WP4.9 Display a page explaining the missing key situation on the quick app
- PB-44098: ZK - WP4.10 As a signed-in user I should not be allowed to create resources with missing key situation in the quick app
- PB-44099: ZK - WP4.11 As a signed-in user I should not be allowed to generate password on the inform menu
- PB-44206: ZK - WP4.14 As administrators I cannot trigger the encrypted metadata migration if I have missing metadata keys
- PB-44211: ZK - WP3.5 Add MetadataKeysSettingsLocalStorageContextProvider to the App and the quick-app and the inform menu
- PB-44212: CU - WP5.2 Update ExternalResourceEntity buildDtoFromResourceEntityDto to support custom fields
- PB-44286: ZK - WP3.6 Add a quick app and inform menu event to get the metadata keys settings
- PB-44295: ZK - WP4.15 As a signed-in user with missing keys I should not be able to create resource if metadata shared key is enforced on the inform menu
- PB-44296: ZK - WP4.16 As a signed-in user I should not be allowed to move shared folders into personal folders with missing key situation
- PB-44327: Display sub-folders in breadcrumbs
- PB-44374: Extend notes v5 max length to 50_000

### Fixed
- PB-43296: Displaying resource activities should not crash the application when a resource activity does not have related user or group
- PB-43652: The sentence to change the passphrase in the user settings workspace should have a space after.
- PB-43657: Resources loading became noticeably slower after migrating to encrypted
- PB-43667: Cancelling the user passphrase request should not trigger an error when sharing missing metadata key
- PB-43676: Cancelling the user passphrase should not freeze the create resource dialog
- PB-43719: After importing resources from Bitwarden the URIs are not separated correctly
- PB-43784: Display the progression of the encryption of metadata in the import dialog
- PB-43906: User should be notified of any errors while loading comments
- PB-44079: Update/Create a method in resourceLocalStorage.js to bulk delete resources
- PB-44161: As a user I should not see the resource description and note warning message if only one of them is concerned
- PB-44273: Activities are not loaded when new resource is clicked after load more activities of a previous resource

### Maintenance
- PB-43585: Azure SSO login_hint settings can now be configured
- PB-43908: Move logic of commentModel file to a service and update assertions in controllers
- PB-44076: Create a Controller to handle Resource Delete
- PB-44077: Create a dedicated Service to handle resource deletion
- PB-44396: the endpoint complete/recover.json is now used instead of the legacy endpoint

### Security
- PB-43730: Upgrade vulnerable library brace-expansion
