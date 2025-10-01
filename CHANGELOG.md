# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [5.6.0] - 2025-10-08
### Added
- PB-39068 WP5-5.6 - Implement a Service RotateResourcesMetadataKeyService that proceed with the rotation of the key
- PB-39069 WP5-5.8 - Implement a new method in MetadataKeysServiceWorkerService to call for  to expire a key
- PB-39071 WP5-5.1 - Implement a new method in MetadataKeysApiService to expire a shared metadata key
- PB-39072 WP5-5.4 - Implement a new Service UpdateMetadataKeysService to process with the expiration of a key
- PB-39073 WP5-5.2 - Implement a new API service MetadataRotateKeysResourcesApiService to retrieve the first page of data to rotate
- PB-39074 WP5-5.3 - Implement a new method in MetadataKeysApiService to register the rotated data on the API
- PB-39075 WP5-5.7 - Implement a Controller RotateResourcesMetadataKeyController to run the rotation process
- PB-39076 WP5-5.9 - Implement a new method in MetadataKeysServiceWorkerService to call passbolt.metadata.rotate-resources-metadata for  with the new Key
- PB-39078 WP5-5.10 - Implement the ConfirmMetadataRotationDialog
- PB-39094 WP5-6.2 - Display the rotate key button when multiple metadata key are active
- PB-43253 Workspace resizable sidebars
- PB-44582 lastpass example csv import with totp success
- PB-45385 SN - WP1.1 Create the entity SecretDataV5StandaloneNoteEntity
- PB-45389 SN - WP1.3 Update ResourceFormEntity to include secret SecretDataV5StandaloneNoteEntity
- PB-45400 SN - WP2.1 Add new resource type in DisplayContentTypesAllowedContentTypesAdministration
- PB-45404 SN - WP2.2 Add new resource type in DisplayResourcesWorkspaceMainMenu
- PB-45406 SN - WP2.3 Update passbolt default resource type icons to include the new resource type icon
- PB-45408 SN - WP2.4 Update DisplayResourcesListDetails to handle the correct subtitle for standalone note and add the same for standalone custom fields
- PB-45412 SN - WP3.1 Apply a minimum height to the resource workspace ‘others’ dialog used to create other resource types
- PB-45413 SN - WP3.3 Increase the height of the notes textarea to use the maximum available space in the resource creation dialog
- PB-45414 SN - WP3.3 Add “hide” button when the note is decrypted to hide it again
- PB-45417 SN - WP2.5 Update the “other” dialog to add the standalone note in the content type list in v5
- PB-45424 SN - WP3.4 Ensure Import/Export is working as expected with standalone notes
- PB-45464 GMUO - WP1.1 Create new collection ‘GroupUpdateCollection’
- PB-45465 GMUO - WP1.2 Migrate group update logic to optimise the request on the API
- PB-45466 GMUO - WP1.3 Adapt group update progress bar mechanism
- PB-45476 WP5-6.3 - Create events with controller to rotate and resume rotation of a metadata key

### Fixed
- PB-43218 Date field icons should not be replaced with the copy icon in the SSO settings and expiry resource dialogs
- PB-45239 Folders are not displayed in the correct order (GITHUB #568)
- PB-45329 add TOTP toString handling similar to other csv exports
- PB-45402 Add missing icon property to resource types schema definition
- PB-45450 Fix account kit export with big private armored keys
- PB-45458 Remove Organisation Settings max-width

### Maintenance
- PB-44253 Upgrade vulnerable library form-data
- PB-44593 Upgrade i18next to v24x
- PB-45182 Major upgrade for copy-anything (Medium)
- PB-45183 Minor upgrade for browserslist (Low)
- PB-45184 3rd party Github Actions should be pinned (Medium)
- PB-45401 Enforce the requirement of the property object_type for custom fields
- PB-45484 Fix low security vulnerability dependency with web-ext to 8.10.0
- PB-45583 Review and clean up npm overridden dependencies
- PB-45601 Update the "Upgrade to Passbolt Pro" buttons URL

## [5.5.1] - 2025-09-15
### Fixed
- PB-45290 Fix password missing crash on metadata activation in first admin setup

## [5.5.0] - 2025-09-10
### Added
- PB-43921 Increase directory sync report dialog size
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
- PB-44630 SCIM administration screen

### Fixed
- PB-44638 Password expiry should not be removed when password is not updated
- PB-44604 Fix regular expression on public key metadata validation
- PB-44707 Fix service worker not restarting after browser extension update on Chrome
- PB-45060 Fix custom fields json schema properties type
- PB-44933 Fix setup a new user should have missing key set

### Maintenance
- PB-44594 Upgrade xregexp to 5.1.2
- PB-44638 Password expiry should not be removed when password is not updated
- PB-44668 The create menu import operation should be actionable when encrypted metadata plugin is not available

## [5.4.0] - 2025-08-13
### Added
- PB-44201 E2EE The organisation settings offer now a simplified way to activate metadata encryption and the new resource types
- PB-42205 E2EE encrypted metadata and new resource types are activated by default after the first administrator setup
- PB-43255 Add support for multiple uri import export on kdbx files
- PB-43110 ZK - WP4.2 As a signed-in user I should not be allowed to upgrade resources with missing key situation
- PB-43712 Translate the application in Czech
- PB-43939 ZK - WP3.2 Add an app event to get or find the metadata keys settings
- PB-43980 Add support for custom field import export on kdbx files
- PB-44080 ZK - WP4.1 Create a dialog explaining the missing key situation
- PB-44081 ZK - WP4.3 As a signed-in user I should not be allowed to create resources with missing key situation in the resource workspace
- PB-44090 ZK - WP4.4 As a signed-in user I should not be allowed to edit resources with missing key situation
- PB-44091 ZK - WP4.5 As a signed-in user I should not be allowed to share resources with missing key situation
- PB-44094 ZK - WP4.6 As a signed-in user I should not be allowed to import resources with missing key situation
- PB-44095 ZK - WP4.7 As a signed-in user I should not be allowed to move resources with missing key situation
- PB-44096 ZK - WP4.8 As a signed-in user I should not be allowed to move folders with missing key situation
- PB-44097 ZK - WP4.9 Display a page explaining the missing key situation on the quick app
- PB-44098 ZK - WP4.10 As a signed-in user I should not be allowed to create resources with missing key situation in the quick app
- PB-44099 ZK - WP4.11 As a signed-in user I should not be allowed to generate password on the inform menu
- PB-44206 ZK - WP4.14 As administrators I cannot trigger the encrypted metadata migration if I have missing metadata keys
- PB-44211 ZK - WP3.5 Add MetadataKeysSettingsLocalStorageContextProvider to the App and the quick-app and the inform menu
- PB-44212 CU - WP5.2 Update ExternalResourceEntity buildDtoFromResourceEntityDto to support custom fields
- PB-44286 ZK - WP3.6 Add a quick app and inform menu event to get the metadata keys settings
- PB-44295 ZK - WP4.15 As a signed-in user with missing keys I should not be able to create resource if metadata shared key is enforced on the inform menu
- PB-44296 ZK - WP4.16 As a signed-in user I should not be allowed to move shared folders into personal folders with missing key situation
- PB-44327 Display sub-folders in breadcrumbs
- PB-44374 Extend notes v5 max length to 50_000

### Fixed
- PB-43296 Displaying resource activities should not crash the application when a resource activity does not have related user or group
- PB-43652 The sentence to change the passphrase in the user settings workspace should have a space after.
- PB-43657 Resources loading became noticeably slower after migrating to encrypted
- PB-43667 Cancelling the user passphrase request should not trigger an error when sharing missing metadata key
- PB-43676 Cancelling the user passphrase should not freeze the create resource dialog
- PB-43719 After importing resources from Bitwarden the URIs are not separated correctly
- PB-43784 Display the progression of the encryption of metadata in the import dialog
- PB-43906 User should be notified of any errors while loading comments
- PB-44079 Update/Create a method in resourceLocalStorage.js to bulk delete resources
- PB-44161 As a user I should not see the resource description and note warning message if only one of them is concerned
- PB-44273 Activities are not loaded when new resource is clicked after load more activities of a previous resource

### Maintenance
- PB-43585 Azure SSO login_hint settings can now be configured
- PB-43908 Move logic of commentModel file to a service and update assertions in controllers
- PB-44076 Create a Controller to handle Resource Delete
- PB-44077 Create a dedicated Service to handle resource deletion
- PB-44396 the endpoint complete/recover.json is now used instead of the legacy endpoint

### Security
- PB-43730: Upgrade vulnerable library brace-expansion

## [5.3.2] - 2025-07-17
### Added
- PB-25265 Flush clipboard strategy
- PB-43095 Display the metadata issue in the HealthCheck served by the UI
- PB-43403 Search resources should take into account available custom fields information in the web application

### Improved
- PB-43474 As LU I should be able to clear the search field with a button

### Fixed
- PB-43916 Fix hitting the key enter on the search fields
- PB-43996 Users should access encrypted metadata section of the administration guide on the help site when clicking on the documentation CTA from the sidebar

### Maintenance
- PB-43491 The resource activities should use a service worker service to request the service worker
- PB-43496 The user should be notified if an error occurs while displaying additional resource activities
- PB-43501 Cover ActionLogService API service and rename class as per naming convention
- PB-43502 Move logic of ActionLogModel into FindActionLogService
- PB-43506 Move logic of event passbolt.actionlogs.find-all-for into its dedicated Controller
- PB-43738 Create DeleteUserService to call the userService deleteDryRun
- PB-43739 Create DeleteDryRunUserController to call the DeleteUserService
- PB-43750 An unexpected error should be displayed on delete user
- PB-43904 Add a service to request or send data CommentsServiceWorkerService
- PB-43907 Add tests for commentService API service and rename the service class as per naming convention
- PB-43938 Create a GetOrFindMetadataKeysSettingsController to retrieve the metadata keys settings
- PB-43940 Create a MetadataKeysSettingsLocalStorageContextProvider to retrieve the metadata keys settings

## [5.3.0] - 2025-06-09

### Added
- PB-43269 Create the entity CustomFieldEntity
- PB-43271 Create the entity collection CustomFieldsCollection
- PB-43273 Create the entity SecretDataV5StandaloneCustomFieldsCollection
- PB-43275 Update the resource types schema definitions
- PB-43277 Update the ResourceMetadataEntity
- PB-43278 Update the ResourceFormEntity
- PB-43279 Update the Secret Entities
- PB-43283 Display a new entry the create/edit dialog to set custom fields on the left sidebar and the menu
- PB-43284 Create the CustomFieldForm for the create/edit dialog
- PB-43285 Handle the CustomFieldForm warnings and limitation
- PB-43286 Update create/edit resource to select secret custom fields for a standalone custom fields
- PB-43287 Display the Custom Fields section on the right sidebar
- PB-43289 Display standalone custom fields in the component DisplayResourceCreationMenu
- PB-43290 Display standalone custom fields in the component DisplayResourcesWorkspaceMainMenu
- PB-43291 Display the URIs section in the right sidebar
- PB-43374 Add validation on keys and values of each elements of custom fields for the resource form entity
- PB-43377 Add set collection into entity v2
- PB-43145 Find a list of resources based on IDs and that are suitable for local storage from the API
- PB-43146 Find a list of resources based on a parent folder id and that are suitable for the local storage from the API
- PB-43133 Display padding below tags in resource workspace left sidebar
- PB-42185 The folder caret that expands or collapses folders in the tree should have a larger clickable area to make it easier to use
- PB-43222 Improve the group dialog to match the new share dimensions
- PB-43147 Find and update resources based on parent folder id for the local storage
- PB-43148 Create a connector for finding resources based on a parent id for the styleguide to call it later
- PB-43149 Create a ResourcesServiceWorkerService to call the service worker for resource related operations
- PB-43150 Implement the optimised call in the Styleguide when filtering by a folder
- PB-43151 Optimise the data retrieved from the API such that updates are not done if unnecessary
- PB-43156 Clarify implications for backups and other devices before changing the passphrase in the user settings workspace
- PB-43489 Display unexpected error if there is any issue during the secret decryption

### Fixed
- PB-43109 Fix: from the sidebar when upgrade from v4 to v5 goes wrong the error message in the notification
- PB-43118 Hide the "Share metadata keys" button in the users workspace action bar for the current signed-in user
- PB-43215 Fix account recovery creator name
- PB-43063 Fix group edit dialog double warning message has broken UI
- PB-43117 Hide the "Share metadata keys" button in the users workspace action bar after sharing missing metadata keys with a user
- PB-43064 Fix group edit dialog can show a mix of error and warning messages
- PB-43150: fix folder not being reloaded
- PB-43424 Clicking on the "open in a new tab” call to action  in the quick application should open the resource url in a new tab
- PB-43108 Display attention required icon on "metadata keys" label in the user details sidebar if the user is not having access to some metadata keys
- PB-43217 The default icon stroke width is too thick in the grid and doesn't match the custom icons
- PB-43220 Copy URL field action button lacks padding and is broken in the SSO settings
- PB-43168 Align vertically resources workspace select check-boxes
- PB-43211 The feedback message notifying the administrator when a metadata key has been shared with a user contains a typo
- PB-43471 Center vertically the icon on the create and edit dialog

## [5.2.0] - 2025-06-04

### Added
- PB-42936 Translate the application into Ukrainian
- PB-42897 Upgrade resource to v5 from information panel
- PB-42896 PB-42896 Display an “Upgrade Resource to v5” card in the information panel
- PB-42895 Upgrade v4 password string resources to v5 default
- PB-42894 Upgrade a single v4 resource to v5
- PB-42860 Translate the application into Slovenian
- PB-42796 Add a limit for multiple URIs
- PB-42788 As a user I can access the resource appearance customization from the create/edit
- PB-42704 Display missing metadata keys information in the user sidebar
- PB-42658 Refresh the users local storage after sharing missing metadata keys
- PB-42598 Retrieve missing_metadata_keys_ids information when retrieving signed-in user details with the getOrFindMe method of the UserModel
- PB-42590 Write the background color and icon ID into KDBX files
- PB-42589 Read the background color and icon ID from KDBX files
- PB-42588 Adapt the ResourceIcon component to handle IconEntity
- PB-42587 Add the AddResourceAppearance form part for the resource dialog
- PB-42586 Add the ‘appearance’ metadata field in the resource dialog
- PB-42585 Add IconEntity as an associated entity in MetadataEntity
- PB-42584 Create IconEntity to hold custom icon and color information
- PB-42570 Create a method canSuggestUris using canSuggestUri
- PB-42543 Allow users to navigate to the additional URIs from the SelectResourceForm
- PB-42536 Allow user to add additional URIs from the Create and Edit Resource v5 dialogs
- PB-42534 Display resource additional URIs badge in the filtered resource of the QuickApplication
- PB-42533 Display resource additional URIs badge in the suggested resource of the QuickApplication
- PB-42530 Display resource additional URIs in the details of a resource of the QuickApplication
- PB-42529 Display resource additional URIs badge in the browsed resource of the QuickApplication
- PB-42528 Display resource additional URIs badge in the resource details sidebar
- PB-42527 Display resource additional URIs badge in the resources grid
- PB-42526 Create the ResourceUrisBadge component to handle resource additional URIs badge and the tooltip displaying them
- PB-42130 Add shareMetadataKeyPrivate event to AppEvents
- PB-42129 Create ShareMetadataKeyPrivateController and use ShareMetadataKeyPrivateService to perform the action
- PB-42127 Create ShareMetadataKeyPrivateService and implement shareMissing method
- PB-42114 Add create or share method to metadata private key api service
- PB-42368 Update EncryptOne method from EncryptMetadataPrivateKeysService to allow encryption without signature
- PB-42134 Update DisplayUsersContextualMenu to display a Share metadata keys action if key is missing
- PB-42133 Update DisplayUserWorkspaceActions to display a Share metadata keys action if key is missing
- PB-42132 Implement Dialog confirmation when administrator wants to share keys with an user
- PB-42131 Add share method into metadataKeysServiceWorkerService to perform the UI action
- PB-42126 Add cloneForSharing method into MetadataPrivateKeyEntity
- PB-42124 Create ShareMetadataPrivateKeysCollection
- PB-42110 Update userModel updateLocalStorage method to include missing_metadata_keys_ids option
- PB-42109 Add missing_metadata_keys_ids property to UserEntity
- PB-41617 Add comfortable grid
- PB-39042 Display upgrade resource to v5 card

### Improved
- PB-42883 Improve performance by skipping the decryption of unchanged metadata.
- PB-41654 Transform workspaces shifter into a dropdown
- PB-42184 Increase the share dialog width to accommodate longer strings from translations or user names

### Fixed
- PB-43008 Fix dragging v5 resources into shared folders should trigger the share strategy on the resource
- PB-42985 Translate the button manage account in the profile dropdown
- PB-42789 Fix userAvatar on userInformationPanel with attention required svg
- PB-42702 Fix contains missing_metadata_keys_ids miss match
- PB-42606 Fix the Quick App Login form CTA spinner should not be displayed over the text of the button
- PB-42272 Fix display v5 resource metadata in the grid when filtering by group
- PB-42077 Update navigation menu icon width
- PB-41649 Re-align components in the left sidebar
- PB-41643 Remove TOTP MFA (profile workspace) border around the QR code and card
- PB-41642 Update Turn off MFA primary button to be red

### Maintenance
- PB-43012 Change authentication_token parameter to token for get the user key policies endpoint
- PB-42790 Replace legacy Icon by SVG
- PB-42572 Update Quickaccess HomePage to use the canSuggestUris
- PB-42571 Update isSuggestion in resource entity to use canSuggestUris
- PB-42569 Create and merge canSuggestUri into a service
- PB-42978 Check object_type is defined and valid before metadata encryption

### Security
- PB-42700 Upgrade vulnerable library undici and lockfile-lint-api
- PB-42391 Update Papaparse library


## [5.1.0] - 2025-05-12

### Added
- PB-41340 Add dedicated input to fix autofill on specific website
- PB-41734 SPKD-1.1 Rename metadata private key getter/setter dataSignedByCurrentUser & ensure constructor pass options to its parent class to ensure validation can be disabled
- PB-41735 SPKD-1.2 Verify the metadata public key entity fingerprint is equal to the  armored key fingerprint in FindMetadataKeysService findAll
- PB-41737 SPKD-1.3 Verify metadata private  key data entity fingerprint with armored key fingerprint in DecryptMetadataPrivateKeysService decryptOne
- PB-41738 SPKD-1.4 Assert metadata keys collection fingerprints public/private integrity in DecryptMetadataPrivateKeysService decryptAllFromMetadataKeysCollection
- PB-41739 SPKD-1.5 Adapt DecryptMessageService.decrypt to return the raw OpenPGP decryption result, including signatures, without throwing an error when signature verification fails
- PB-41740 SPKD-1.7 Implement findVerifiedSignatureForGpgKey in src/all/background_page/service/crypto/findSignatures utils to retrieve a signature for a given OpenPGP key
- PB-41741 SPKD-1.8 Check current user signature when decrypting Metadata Private Key Data
- PB-41742 SPKD-1.6 Implement ExternalGpgSignatureEntity to carry OpenPGP signature data
- PB-41743 SPKD-1.9 Implement MetadataTrustedKeyEntity to carry the information relative to a trusted metadata key
- PB-41744 SPKD-1.10 Implement TrustedMetadataKeyLocalStorage to support the persistence of the trusted metadata key
- PB-41746 SPKD-2.1 Implement bext ConfirmMetadataKeyContentCodeService to request user to confirm trusted metadata keys changes
- PB-41747 SPKD-2.2 Implement confirm metadata key event handler and dialog on the web application
- PB-41748 SPKD-2.3 Implement confirm metadata key event handler and dialog on the quick application
- PB-41749 SPKD-2.4 Implement GetMetadataTrustedKeyService get to retrieve the trusted metadata key from the local storage
- PB-41753 SPKD-2.8 Implement VerifyOrTrustMetadataKeyService verifyTrustedOrTrustNewMetadataKey to verify that the current active metadata key is trusted or request the user to trust it
- PB-41750 SPKD-2.5 Implement MetadataPrivateKeyApiService update to update a trusted metadata key on the API
- PB-41751 SPKD-2.6 Implement UpdateMetadataKeyPrivateService update function to update a trusted metadata key
- PB-41752 SPKD-2.7 Implement TrustMetadataKeyService trust to trust a new metadata key
- PB-41847 SPKD-2.18 Add creator field to metadataKeyEntity test data
- PB-41916 SPKD-2.19 Flush Metadata Keys Settings storage when a user is signed-out
- PB-41918 SPKD-2.20 Adapt EncryptMessageService.encrypt so that it can sign a message with a specified date
- PB-41919 SPKD-2.21 Adapt EncryptMetadataPrivateKeysService.encryptOne so that it can sign a message with a specified date
- PB-41958 SPKD-2.10 Verify and trust metadata key prior to encrypt metadata
- PB-41961 SPKD-2.21 Add in diagram TrustMetadataKeyService
- PB-41962 SPKD-2.22 Add unit test and in the diagram for VerifyOrTrustMetadataKeyService

### Fixed
- PB-35383 refresh folders list after delete parent folder and keep items inside
- PB-39607 metadata migration should encrypt metadata with user's key when encrypting a personal resource
- PB-40181 The session keys cache items are missing modified field
- PB-41296 on a fresh install + first login after setup (firefox + debian) going to the user workspace crashes as roles are not defined
- PB-41304 import password errors (UAT required & fix)
- PB-41305 clicking on folder parent in location of a resource in the right sidebar just close the panel
- PB-41407 account recovery in user profile can crash when clicking on review
- PB-41638 Hide administration workspace shifter on desktop app
- PB-41716 Permalink when paste in url and local storage is not loaded yet
- PB-41753 safer key public distribution confirmation in quickaccess
- PB-41776 password input with show icon can display a broken UI
- PB-41841 user workspace displays a blank screen when accessing a user's URL directly from the browser
- PB-41846 Other type resource dialog TOTP does not open a TOTP but a password + totp
- PB-42030 'where to find my account kit' does no open the browser for help
- PB-42033 design of security token in input field could be broken with some characters
- PB-42046 set empty translations with their default string
- PB-42105 import of resources process always uses shared metadata key instead of personal key
- PB-42106 throw an error while decrypting resource metadata if the decrypted metadata object type is not valid
- PB-41378 UI minor bug: multiple resource select, right sidebar cropped
- PB-41435 Display the folder context menu above the “More” button
- PB-41551 Show a disabled style when dragging an item over an invalid drop target
- PB-41550 Refresh the folder tree after the folder‑hierarchy cache updates (order issue)
- PB-41627 UI bug: Note formatting in the right sidebar
- PB-41759 Browser extension should enforce object_type on metadata of resource creation / edition

### Maintenance
- PB-38199 Update administration page Role-Based Access Control save behavior
- PB-41346 Remove mfa settings screens from API
- PB-41366 ECC-1.1 Update browser extension outdated OpenPGP.js to version 6
- PB-41384 Upgrade vulnerable lib on bext 'image-size'
- PB-41385 2.1 Display react list for folder tree
- PB-41386 2.2 Folders updated should be refreshed in the folder tree
- PB-41387 2.3 Navigate to a folder form route should scroll the folder tree to see the selected folder
- PB-41388 2.4 Update the padding according to the depth of the folder
- PB-41414 WP4-14.2 Migrate import account kit screen
- PB-41646 UI adjustment: All tables should have a 0.8rem gap
- PB-41648 UI adjustment: Name column size in grid should be large by default
- PB-41647 UI adjustment: All dialog & setting primary should have a regular font weight
- PB-41653 UI adjustment: Grid select column, padding left & right 1.6rem
- PB-41709 Add activity diagram to verify metadata keys
- PB-41720 Add licence on SVG in the folder svg on the styleguide

## [5.0.1] - 2025-04-14
### Fixed
- PB-41438 Prevent users from migrating encrypted notes to cleartext descriptions when editing a resource
- PB-41540 Display the v5 redesign skeleton while the application is loading
- PB-41541 Display an ellipsis for long names and usernames on the user badge

## [5.0.0] - 2025-04-09
### Added
- PB-33425 Allow users to reset resource grid columns to default factory settings through the columns settings dropdown
- PB-35232 Add a resource grid filter to display only private resources
- PB-37332 Rename encrypted description to note and clearly differentiate between the metadata description and the secret note
- PB-37620 Allow users to resize and reorder the users grid
- PB-37638 Add a details sidebar for multiple grid resource selections to allow users to review their selection
- PB-38938 Redirect administrator to a home page instead of the first available settings page
- PB-38940 Organize the administration menu into meaningful sections
- PB-39415 Redesign the application
- PB-39464 Introduce unified and modular resource creation and editing dialogs to support upcoming resource types
- PB-40150 Display a default resource icon in the grid

### Fixed
- PB-28280 Display the complete resource path in sidebar details
- PB-33618 Disable the "select all" dropdown in the users grid until bulk operations are supported
- PB-39994 Display a pending changes banner after modifying administration email notification settings
- PB-39995 Ease identification of generated organization recovery key file name by including the GPG key identifier
- PB-40268 Display a pending changes banner after modifying administration internationalization settings
- PB-40270 Display a pending changes banner after modifying administration email server settings
- PB-40271 Display a pending changes banner after modifying administration RBAC settings
- PB-40272 Display a pending changes banner after modifying administration users directory settings
- PB-40273 Display a pending changes banner after modifying administration SSO settings
- PB-40669 Display loading feedback in the folder navigation tree during folder loading
- PB-40186 WP6-7.5 Validate the object_type property of v5 secrets to mitigate unwanted content decryption attacks
- PB-40576 Reposition the expiry item in resources grid column settings to reflect its lower display priority in the grid
- PB-41275 Display the complete folder path in sidebar details

### Maintenance
- PB-40117 Upgrade browser extensions repositories to node 22
- PB-40687 Upgrade vulnerable library babel and relative
- PB-40688 Upgrade vulnerable library i18next-parser and relative

## [4.12.0] - 2024-03-10
### Added
- PB-38932 WP6-3.1 Implement navigation to content types migrate metadata content administration page
- PB-38915 WP6-3.2 Implement findUpgradeContentDetails function on MetadataMigrateContentServiceWorkerService to retrieve content to upgrade details in the content types migrate metadata administration page
- PB-38916 WP6-3.3 Implements MigrateMetadataSettingsFormEntity to handle form data
- PB-38917 WP6-3.4 As an administrator I can see the migrate metadata settings form
- PB-38918 WP6-3.5 Implements MigrateMetadataResourcesService to migrate metadata resources
- PB-38919 WP6-3.6 Implements PassboltResponseEntities to handle passbolt API response
- PB-38921 WP6-3.7 Implements MigrateMetadataResourcesController to run metadata migration from the styleguide
- PB-38923 WP6-3.8 Implements ConfirmMigrateMetadataDialog to warn admin before actually running the migration
- PB-38925 WP6-3.10 Implements MigrateMetadataSettingsActionBar to trigger migration process
- PB-38996 WP6-4.1 Update ResourceTypeEntity to handle the new 'deleted' field
- PB-38998 WP6-4.3 Implements findAllByDeletedAndNonDeleted on FindResourceTypesService  to retrieve all deleted and non deleted resources-types
- PB-38999 WP6-4.4 Implements FindAllByDeletedAndNonDeletedResourceTypesContoller to find all available and deleted resources-types
- PB-39000 WP6-4.5 Implements ResourceTypesServiceWorkerService to request the service worker for retrieving the resource types
- PB-39001 WP6-4.6 Implements ResourceTypesFormEntity to handle the data from the form component
- PB-39002 WP6-4.7 Implements navigation to allow content types administration page
- PB-39003 WP6-4.8 Implements DisplayContentTypesAllowedContentTypesAdministration component to display the administration form
- PB-39004 WP6-4.9 Implements ResourceTypesApiService undelete method to process the undelete of the given resources type
- PB-39005 WP6-4.10 Implements ResourceTypesService delete method to request the API for deleted the given resource type
- PB-39006 WP6-4.11 Implements UpdateResourceTypesService undelete method to process the update of the given resources types
- PB-39009 WP6-4.14 Implements UpdateAllResourceTypesDeletedStatusController to update all  resource types deleted status
- PB-39010 WP6-4.15 Implements ResourceTypesServiceWorkerService update and delete method to communication with the service worker
- PB-39011 WP5-4.16 Add to DisplayResourceTypes a "Save" button to trigger the update process of the allowed resource types

### Fixed
- PB-38763 Using V5 format, exporting resources now set all the fields properly
- PB-39388 Edition and creation of resources now export object_type in metadata properly
- PB-39084 When selecting multiple resources, the OS is detected and the right shortcut is used

## [4.11.0] - 2024-01-29
### Added
- PB-37669 WP5-1.1 Implement save method in ServiceWorker
- PB-37670 WP5-1.2 Implement SaveMetadataSettingsService in the Service Worker to handle saving of metadata types settings
- PB-37671 WP5-1.3 Implement SaveMetadataTypesSettingsController in the Service Worker to expose metadata types settings save functionality to the content code
- PB-37672 WP5-1.4 Implement MetadataSettingsBextService in the Content Code to handle Service Worker requests that handles metadata types settings
- PB-37673 WP5-1.5 Add MetadataTypesSettingsEntity in the Content Code to support the metadata types settings form data
- PB-37676 WP5-1.6 Implement DisplayContentTypesMetadataAdministrationActions in the content Code to support content types metadata administration actions
- PB-37677 WP5-1.7 Implement DisplayContentTypesMetadataAdministration in the Content Code to display the metadata content types administration form
- PB-38019 WP5-1.8 Implement entity v2 required getter, setter, and comparison function to handle form data
- PB-38020 WP5-1.9 Add allow_v4_v5_upgrade property to metadata types settings entity
- PB-38021 WP5-1.10 Implement verifyDataHealth on MetadataTypesSettingsFormEntity to verify the settings health and help prevent problematic situations
- PB-38022 WP5-2.2 Metadata keys collection shouldn’t try to decrypt metadata private key that are not encrypted
- PB-38093 WP5-2.1 Make ExternalGpgKeyEntity and ExternalGpgCollection accessible to the content code
- PB-38105 WP5-2.3 Add support of expired on metadata key entity
- PB-38106 WP5-2.4 Find all metadata keys for session storage should not retrieve deleted keys
- PB-38108 WP5-2.5 Apply style on content types encrypted metadata administration screen
- PB-38111 WP5-2.6 Implement MetadataKeysServiceWorkerService in the Content Code to request the Service Worker to retrieve metadata keys
- PB-38121 WP5-2.7 Implement findKeysSettings in MetadataSettingsServiceWorkerService in the Content Code to request the Service Worker to retrieve metadata keys settings
- PB-38124 WP5-2.8 Implement GpgServiceWorkerService in the Content Code to request the Service Worker and retrieve gpg keys info
- PB-38135 WP5-2.9 Implement DisplayContentTypeMetadataKeysAdministration component to read metadata keys settings
- PB-38186 WP5-2.11 Make ExternalGpgKeyPairEntity accessible to the content code
- PB-38194 WP5-2.10 Implement generate function on MetadataKeysServiceWorkerService to support new metadata key generation in content types metadata keys administration page
- PB-38198 WP5-2.12 As an administrator I can generate metadata key when there is none yet active
- PB-38201 WP5-2.13 Implement findAll and findAllActive on findUsersService to retrieve respectively all users and only active users
- PB-38258 WP5-2.14 Implement saveKeysSettings function on MetadataSettingsServiceWorkerService to save metadata keys settings in the content types metadata keys administration page
- PB-38259 WP5-2.15 Implement EncryptMetadataPrivateKeysService to encrypt metadata private key data
- PB-38260 WP5-2.16 Implement save capability on the metadata keys settings administration page

### Fixed
- PB-37682 URI not stored when password is weak with the quick access
- PB-38125 Display auto-fill CTA when the browsed page does not display its iframes

### Security
- PB-37706 Fix RBAC preview and copying should no be allowed after group filter
- PB-38310 Upgrade i18next-parser undici dependency

### Maintenance
- PB-38027 Remove .page.js from styleguide code coverage
- PB-38243 Upgrade playwright dependency and fix CI

## [4.10.2] - 2024-12-05
### Added
- PB-35706 WP3-3.7 Webapp EditStandaloneTotp component updates resources of type v5
- PB-35741 WP3-5.5 Export resources of type v5
- PB-35743 WP3-5.4 Migrate export resources controller logic into a dedicated service
- PB-35753 WP3-6.3 Migrate update group controller logic into a dedicated service
- PB-35771 WP3-8.1 Implement SessionKeyEntity entity to support session key
- PB-35772 WP3-8.2 Implement SessionKeysCollection collection to support collection of session keys
- PB-35773 WP3-8.3 Implement SessionKeysBundleEntity entity to support persisted collection session keys as stored on the API or local storage
- PB-35857 WP3-8.9 Implement SessionKeysBundlesSessionStorageService to store and retrieve session keys bundles from session storage
- PB-35858 WP3-8.4 Implement SessionKeysBundlesCollection collection to support collection of session keys bundle entity
- PB-35862 WP3-8.5 Implement decryptOne on DecryptSessionKeysBundles service to decrypt a session key bundle
- PB-35863 WP3-8.6 Implement decryptAll on DecryptSessionKeysBundlesService service to decrypt a sessions keys bundles collection
- PB-35864 WP3-8.7 Implement findAll on SessionKeysBundlesApiService to retrieve session keys bundles from the API
- PB-35867 WP3-8.8 Implement findAllBundles on FindSessionKeysService to retrieve sessions keys bundles from the API
- PB-35869 WP3-8.10 Implement findAndUpdateAllBundles on FindAndUpdateSessionKeysSessionStorageService to retrieve session keys bundles from the API and store them in the session storage
- PB-35876 WP3-8.11 Implement getOrFindAllBundles on GetOrFindSessionKeysService to retrieve session keys from store or from the API and store them in the session storage
- PB-35877 WP3-8.12 Implement getOrFindAllByForeignModelAndForeignIds on GetOrFindSessionKeysService to retrieve session keys from storage or from the API and store them in the session storage
- PB-35878 WP3-8.20 DecryptMetadataService should use the session keys when decrypting metadata of a collection of resources
- PB-35879 WP3-8.13 Implement decryptWithSessionKey on DecryptMessageService
- PB-35881 WP3-8.14 Implement GetSessionKeyService crypto service
- PB-35886 WP3-8.15 Implement create on SessionKeysBundlesApiService to create a session keys bundle on the API
- PB-35887 WP3-8.16 Implement delete on SessionKeysBundlesApiService to delete a session keys bundle on the API
- PB-35888 WP3-8.17 Implement update on SessionKeysBundlesApiService to update a session keys bundle on the API
- PB-35889 WP3-8.18 Implement encryptOne on EncryptSessionKeysBundlesService to encrypt session keys bundle session keys prior to persist the data
- PB-35890 WP3-8.19 Implement save on SaveSessionKeysService to persist sessions keys on API
- PB-35948 WP3-8.21 Implement SessionKeysBundleDataEntity entity to support persisted collection decrypted session keys bundle
- PB-36286 WP3-6.7 ShareDialog should not have to share resources by passing resources and all its details to the service worker
- PB-36509 WP3-6.5 Migrate move resource controller logic into a dedicated service
- PB-36511 WP3-6.8 Migrate share folder logic from controller/share model to service
- PB-36513 WP3-6.10 Migrate move folder controller logic into a dedicated service
- PB-36520 WP3-8.22 DecryptMetadataService should persists session keys changes after a decryptAllFromForeignModels is performed
- PB-36522 WP3-1.1 Remember the passphrase for a minimum default period after sign-in to allow smooth decryption of the metadata
- PB-36523 WP3-1.2 Updating resources local storage requiring user passphrase should request the user passphrase if not present in the session storage
- PB-36559 WP3-6.8.1 Implement findFoldersService findAllByIds to support request batch splitting
- PB-36560 WP3-6.8.2 Implement getOrFindFoldersService to retrieve folders from local storage or update if with API
- PB-36561 WP3-6.8.3 Implement findByIdsWithPermissions on findResourcesService and findFoldersService
- PB-36583 WP3-8.4.1 Add same user id build rules for SessionKeysBundlesCollection
- PB-36598 WP3-2.21 Validate GPG armored message to support iOS format
- PB-36897 WP4-1.2 Migration Storybook new CSF format
- PB-36945 WP3-8.24 GetOrFindSessionKeys getOrFindAll shouldn't crash if no sessions keys bundle is found

### Security
- PB-36967 Upgrade vulnerable library cross-spawn

### Fixed
- PB-36501 GITHUB Fix share dialog autocomplete sorting

### Maintenance
- PB-36972 Update progress service to propose an API to control step count to finish

## [4.10.0] - 2024-10-30
### Added
- PB-16113 As LU I should be able to drag and drop a resource I own on a shared tag
- PB-35412 WP3-2.1 Implement MetadataPrivateKey entity to support metadata private key
- PB-35419 WP3-2.3 Implement MetadataPrivateKeys collection to support collection of metadata private keys
- PB-35420 WP3-2.5 Implement MetadataKey entity to support metadata key
- PB-35421 WP3-2.6 Implement MetadataKeys collection to support collection of metadata keys
- PB-35422 WP3-2.2 Implement decryptOne on DecryptMetadataPrivateKeys service to decrypt a metadata private key
- PB-35424 WP3-2.4 Implement decryptAll on DecryptMetadataPrivateKeys service to decrypt a metadata private keys collection
- PB-35425 WP3-2.7 Implement decryptAllFromMetdataKeysCollection on DecryptMetadataPrivateKeys service to decrypt metadata private keys on MetadataKeys collection
- PB-35426 WP3-2.8 Implement the function findAll on the FindMetadataKeys service to retrieve metadata keys from the API and decrypt any metadata private keys found if any
- PB-35427 WP3-2.9 Implement the function findAllForSessionStorage on the FindMetadataKeys service to retrieve metadata keys for the Session storage
- PB-35428 WP3-2.10 Adapt resource entity to support both encrypted metadata and non encrypted metadata
- PB-35429 WP3-2.11 Implement decryptAllFromForeignModels on DecryptMetadata service to decrypt metadata on a resource collection
- PB-35430 WP3-2.12 Decrypt metadata of v5 resources types when retrieving resources from the API
- PB-35684 WP3-3.4 Implement encryptOneForForeignModel on EncryptMetadata service to encrypt metadata on a resource
- PB-35686 WP3-3.5 Encrypt metadata of v5 resource types when editing new resource types
- PB-35688 WP3-3.1 Add necessary capabilities to resource types collection and entity to support v5 types in the UI
- PB-35692 WP3-4.1 implement metadata types settings entity to support metadata types settings
- PB-35693 WP3-4.2 Implement findSettings on MetadataTypesSettingsApiService to retrieve metadata types settings
- PB-35694 WP3-4.3 Implement findTypesSettings on FindMetadataSettingsService to retrieve metadata types settings entity
- PB-35695 WP3-4.4 IImplement MetadataTypesSettingsLocalStorage to store and retrieve metadata types settings from local storage
- PB-35696 WP3-4.5 Implement findAndUpdateTypesSettings on FindAndUpdateMetadataSettingsService to retrieve metadata types settings from the API and store them in the local storage
- PB-35698 WP3-4.7 Implement GetOrFindMetadataTypesSettingsController to provide capability to retrieve the metadata types settings from the UI
- PB-35700 WP3-4.6 Implement getOrFindMetadataTypesSettings on GetOrFindMetadataSettingsService to retrieve metadata types settings from store or from the API and store them in the local storage
- PB-36225 WP3-4.10 Create resource service should determine personal resource only with permissions of the destination folder
- PB-35701 WP3-4.8 WebApp/QuickApp lazy loads metadata types settings and provide it to components that need them
- PB-35703 WP3-4.10 WebApp CreateResource component creates resources of type v5
- PB-35704 WP3-4.11 Webapp CreateStandaloneTotp component creates resources of type v5
- PB-35705 WP3-3.6 Webapp EditResource component updates resources of type v5
- PB-35707 WP3-4.12 Encrypt metadata of v5 resource types when creating new resources
- PB-35710 WP3-5.1 Migrate import resources controller logic into a dedicated service
- PB-35718 WP3-5.2 Resources import parsers should determine imported resource type based on imported data and configuration
- PB-35721 WP3-5.3 import resources of type v5
- PB-35755 WP3-6.2 Share resources of type v5
- PB-35853 WP3-4.14 Add resource types v5 to the list of supported resource types
- PB-35893 WP3-7.1 Implement MetadataKeysSettingsEntity to support metadata keys settings
- PB-35895 WP3-7.2 Implement findSettings on MetadataKeysSettingsApiService to retrieve metadata keys settings
- PB-35896 WP3-7.3 Implement findKeysSettings on FindMetadataSettingsService to retrieve metadata keys settings as entity
- PB-35897 WP3-7.4 Implement MetadataKeysSettingsLocalStorageService to store and retrieve metadata keys settings from local storage
- PB-35898 WP3-7.5 Implement findAndUpdateKeysSettings on FindAndUpdateMetadataSettingsService to retrieve metadata keys settings from the API and store them in the local storage
- PB-35899 WP3-7.6 Implement getOrFindMetadataKeysSettings on GetOrFindMetadataSettingsService to retrieve metadata keys settings from storage or from the API and store them in the local storage
- PB-35900 WP3-7.7 Enforce metadata encryption using the metadata key as dictated by the metadata key settings
- PB-35901 WP3-5.6 Implement encryptAllFromForeignModels on EncryptMetadata service to encrypt metadata on a collection of resources
- PB-35902 WP3-9.1 Implement MetadataKeysSessionStorageService to store and retrieve metadata keys from session storage
- PB-35903 WP3-9.2 Implement findAndUpdateAll on FindAndUpdateKeysSessionStorageService to retrieve metadata keys from the API and store them in the local storage
- PB-35904 WP3-9.3 Implement getOrFindAll on GetOrFindMetadataKeysService to retrieve metadata keys from storage or from the API and store them in the local storage
- PB-35907 WP3-9.5 decrypt metadata service should retrieve keys from session storage
- PB-35912 WP3-2.16 Implement MetadataPrivateKeyData entity to support decrypted metadata private key data
- PB-35914 WP3-2.19 Update metadata_key_type to be aligned with the API value for the shared_key
- PB-35915 WP3-2.18 update the resource metadata object_type to be aligned with the API
- PB-35947 WP3-2.17 Update MetadataPrivateKey entity to support MetadataPrivateKeyData
- PB-35982 WP3-2.20 allow a metadata_key_id to be set when metadata_key_type is set to 'user_key'
- PB-35989 WP3-4.13 QuickApp components creates resource of type v5 accordingly to metadata settings
- PB-36187 WP3-9.5.1 Refactor decryptMetadataService to welcome keys coming from getOrFindMetadataKeys
- PB-36226 Create an event to get the account of the user
- PB-36230 WP3-5.3.2 Encrypt EncryptMetadataService.encryptAllFromForeignModels should not crash if v4 resource type are sent for encryption
- PB-36231 WP3-5.3.3 ImportResourceService should encrypt a v5 resource type metadata

### Improved
- PB-35702 WP3-4.9 WebApp DisplayResourcesWorkspaceMainMenu should be able to determine the type of content to create
- PB-35718 WP3-5.2 Resources import parsers should determine imported resource type based on imported data and configuration
- PB-35802 WP3-3.2 WebApp lazy loads resource types and replace resourceTypeSettings usage with it
- PB-35803 WP3-3.2 QuickApp lazy loads resource types and replace resourceTypeSettings usage with it
- PB-35987 WP3-4.13 QuickApp components creates resource button should be display only when possible
- PB-35988 WP3-4.13 Inform components creates or save resources should be display only when possible

### Fixed
- PB-35709 Fix: theme back to default randomly after refresh or navigation
- PB-35714 Fix: Infinite loading when user try an account recovery process on another profile with an extension installed
- PB-35861 Fix: Wrong resource type is displayed in resource sidebar
- PB-36123 Fix: Filtering resources with a second group should not enter in a filtering loop between the first and second selected groups
- PB-36236 Fix: Resource type requirements when retrieving resources to export resulting in cardinality issue with some environment

### Maintenance
- PB-35762 WP3-6.1 Migrate share resources model logic into a dedicated service
- PB-35788 WP3-3.2 Handle resource types settings using an HOC

## [4.9.4] - 2024-09-30
### Fixed
- PB-33927 Update the label for password expiry email notification
- PB-34743 Fix: folder's sidebar information misses the creator and modifier information
- PB-35351 Fix: Grid columns resizing unexpectedly

### Maintenance
- PB-34313 E2EE WP2 documentation permissions finder class
- PB-34612 As a desktop app I should see the dotnet error message in of http error
- PB-34632 WP2-1.1 Migrate ResourceTypeEntity to EntityV2
- PB-34633 WP2-1.2 Migrate ResourceTypesCollection to EntityV2Collection
- PB-34634 WP2-1.3 Migrate CommentEntity to EntityV2
- PB-34635 WP2-1.4 Migrate CommentsCollection to EntityV2Collection
- PB-34636 WP2-1.5 migrate external resource entity to entity v2
- PB-34637 WP2-1.6 migrate external resources collection to entity v2 collection
- PB-34638 WP2-1.7 migrate external folder entity to entity v2
- PB-34639 WP2-1.8 migrate external folders collection to entity v2 collection
- PB-34640 WP2-1.9 Migrate ExportResourcesFileEntity to EntityV2
- PB-34641 WP2-1.10 Migrate PermissionTransferEntity to EntityV2
- PB-34642 WP2-1.11 Migrate PermissionTransfersCollection to EntityV2Collection
- PB-34643 WP2-1.12 Migrate GroupDeleteTransferEntity to EntityV2
- PB-34644 WP2-1.14 Migrate GroupUserTransfersCollection to EntityV2Collection
- PB-34645 WP2-1.15 Migrate UserDeleteTransferEntity to EntityV2
- PB-34646 WP2-1.13 Migrate GroupUserTransferEntity to EntityV2
- PB-34647 WP2-1.16 Migrate NeededSecretEntity to EntityV2
- PB-34648 WP2-1.17 Migrate NeededSecretsCollection to EntityV2Collection
- PB-34649 WP2-1.18 Migrate SecretEntity to EntityV2
- PB-34650 WP2-1.19 Migrate SecretsCollection to EntityV2Collection
- PB-34651 WP2-1.20 Migrate GroupUpdateDryRunResultEntity to EntityV2
- PB-34656 WP2-1.25 Migrate ImportResourcesFileEntity to EntityV2
- PB-34657 WP2-1.26 Migrate PlaintextEntity to EntityV2
- PB-34658 WP2-1.27 Migrate TotpEntity to EntityV2
- PB-34747 WP2-1.28 Remove not used sanitizeDto from GroupsUsersCollection
- PB-35124 Migrate 'gte' and 'lte' props of schemas to 'minimum' and 'maximum'
- PB-35125 WP2-2.6 Find resource permissions by requesting dedicated API permissions entry point
- PB-35128 WP2-2.1 unnecessary quick a api call when displaying home page
- PB-35161 WP2-2.2 unnecessary quick a api call for filtering resources: filter by favourite
- PB-35170 WP2-2.5 unnecessary quick a api call for filtering resources: filter by tags
- PB-35172 WP2-2.7 Find folder permissions by requesting dedicated API permissions entry point
- PB-35174 WP2-4.1 Migrate Webapp resource create form in view model
- PB-35175 WP2-4.2 Migrate Webapp resource edit form in view model
- PB-35177 WP2-4.3 Migrate Quickaccess resource create form in view model
- PB-35178 WP2-4.4 Migrate Quickaccess resource auto-save form in view model
- PB-35179 WP2-4.5 Migrate Webapp edit description from sidebar form in view model ?
- PB-35180 WP2-2.8 Copy/preview password/totp should find single secret by requesting dedicated API secrets entry point
- PB-35182 WP2-3.1 Migrate the resource types event 'passbolt.resource-type.get-all' into a controller
- PB-35233 WP2-5.1 PlainText entity schema should be provided by the browser extension
- PB-35253 WP2-3.2 Migrate resource update controller logic into service
- PB-35255 WP2-3.3 Migrate resource “update-local-storage” event logic to a dedicated controller
- PB-35256 WP2-5.2 Unit test performance of new collection v2 and ensure no regression is introduced
- PB-35261 WP2-2.10 Shift resources & folders and update local storage debounce...
- PB-35261 WP2-2.10 Decouple logic of update local storage, find all and get or find all in order to prepare for resource with encrypted metadata
- PB-35323 Ensure resource test factory does not contain any metadata at the root of the resource
- PB-35338 WP2-2.11 Folders update local storage should handle threshold period to limit the number of API request
- PB-35339 Review resource update service test
- PB-35340 WP2-2.12 drop resources collection sanitise dto
- PB-35341 WP2-2.13 Migrate findAll from ResourceModel into FindResourceService
- PB-35342 WP2-2.14 Leverage local storage when filtering resources by group
- PB-35344 WP2-2.15 Migrate findSuggestedResources from resource model to...
- PB-35345 WP2-2.16 Migrate findAllForShare from resource api service to FindResources service
- PB-35346 WP2-2.17 migrate find all for decrypt from resource api service to find resources service
- PB-35348 WP2-2.18 Migrate findById to the FindResourcesService
- PB-35359 WP3 Class diagram of resources types local storage HOC
- PB-35359 WP3 Update resource class diagram to support resource edit with v5
- PB-35359 Technical specifications: WP3 support v5 resource types with v4 UI
- PB-35414 WP2-2.16 Create ExecuteConcurrentlyService to perform query in parallel

### Security
- PB-35129 Upgrade vulnerable library webpack
- PB-35354 Upgrade vulnerable library path-to-regexp

## [4.9.3] - 2024-09-03
### Fixed
- PB-35185 Administrator should be able to delete users who are sole owners of resources or sole group manager

## [4.9.2] - 2024-08-26
### Fixed
- PB-33861 Resources with personal field set to null should be considered as personal resources
- PB-34314 Fix shadow-dom autofill fields
- PB-34236 Fix Retrieving folder activities displaying no data

### Maintenance
- PB-34313 Add resources type retrieval requirements documentation
- PB-34259 E2EE WP1 - Transform dtos from v4 to v5
- PB-34260 E2EE WP1 - Display resource sidebar information section in v5
- PB-34261 E2EE WP1 - Display resource sidebar activity section in v5
- PB-34262 E2EE WP1 - Display resource sidebar description section in v5
- PB-34263 E2EE WP1 - Display copy username to clipboard from more menu using v5
- PB-34264 E2EE WP1 - Display resource grid using v5
- PB-34265 E2EE WP1 - Display resource grid contextual menu using v5
- PB-34266 E2EE WP1 - Display quickaccess resource view page in v5
- PB-34267 E2EE WP1 - Display quickaccess home page in v5
- PB-34268 E2EE WP1 - Display inform menu in v5
- PB-34269 E2EE WP1 - Autofill resources from Quickaccess in v5 format
- PB-34270 E2EE WP1 - Make resource entity compatible with v4 and v5
- PB-34271 E2EE WP1 - Display inform and toolbar suggested resources badge CTA in v5
- PB-34272 E2EE WP1 - Search resource in webapp using v5
- PB-34287 E2EE WP1 - Create password resource from webapp in v5 format
- PB-34288 E2EE WP1 - Create standalone TOTP resource in v5 format
- PB-34289 E2EE WP1 - Edit password resource in v5 format
- PB-34290 E2EE WP1 - Edit standalone TOTP resource in v5 format
- PB-34291 E2EE WP1 - Edit resource description from sidebar in v5 format
- PB-34292 E2EE WP1 - Delete resource(s) in v5 format
- PB-34293 E2EE WP1 - Share resource(s) in v5 format
- PB-34294 E2EE WP1 - Import resource(s) in v5 format
- PB-34295 E2EE WP1 - Export resource(s) in v5 format
- PB-34296 E2EE WP1 - Move resource(s) in v5 format
- PB-34297 E2EE WP1 - Create password resource from quickaccess in v5 format
- PB-34298 E2EE WP1 - Auto-save password resource from quickaccess in v5 format
- PB-34299 E2EE WP1 - Make resource entity compatible only with v5
- PB-34311 E2EE WP1 - Make resource V4 and V5 compatible in both ways
- PB-34315 E2EE WP1 - Transform DTO to V4 for API and adapt resource validation to v5
- PB-34391 E2EE WP1 - Enforce resource type id should be required and not null
- PB-34392 E2EE WP1 - Validate Metadata.uris as array of string, and maxLength

### Security
- PB-34237 Upgrade vulnerable library i18next-parser
- PB-34305 Upgrade lockfile-lint library on passbolt_api package-lock.json
- PB-34422 Remove grunt-browserify dev dependency from browser extension

## [4.9.1] - 2024-07-23
### Fixed
- PB-34134 As a signed-in user I should search resources even if the data integrity is corrupted

## [4.9.0] - 2024-07-22
### Added
- PB-33439 As a user I want to hide entropy on passphrases passwords
- PB-33441 As a signed-in user I can search on folder metadata
- PB-33687 As a user navigating to a website with shadow-dom I can still autofill my credentials
- PB-33730 Link admin page with troubleshooting documentation
- PB-33847 As an administrator I can configure the LDAP integration to suspend deleted users
- PB-33853 As a signed-in user I should see location in grid
- PB-33857 Get folder hierarchy from resourceWorkspaceContext

### Improved
- PB-14173 As Logged out user, I shouldn't be able to view a previously viewed password
- PB-33608 As a signed in user browsing the web I should see the suggested resources count displayed updated almost instantly
- PB-33824 As a user I should not see other dialog open except the session expired
- PB-33880 As a user I should see tooltip always visible in any position
- PB-33919 As a user searching for users to share a resource/folder with I can see the user full name and username of proposed users
- PB-33920 As a user searching for users to share a resource/folder with I can see information icon next to a very long user full name

### Security
- PB-33691 Upgrade web-ext library to v8.0.0
- PB-33746 Update NPM dependency Braces
- PB-33825 Upgrade vulnerable library ws

### Fixed
- PB-23294 As LU I should not see a comment overlapping
- PB-25246 As signed-in user I should not see a blank page when I delete the parent folder of the folder I view the details
- PB-33426 As a user I should see the passbolt icon turns gray on a fresh start from chrome MV3
- PB-33436 As a user when an error happen during authentication the button try again should reload the tab
- PB-33438 Fix double tab opening after successful SSO sign-in with detached quickaccess
- PB-33614 As a user I want to have the url from the active tab when using SSO from quickaccess
- PB-33638 Fix hiding entropy behind tooltip in the quickaccess
- PB-33742 As a signed-in user I should see the toolbar icon updated when a tab is selected
- PB-33743 Fix padding icon on account recovery sidebar in the user workspace
- PB-33750 Fix passphrase entropy computation
- PB-33751 Fix avatar in activity section
- PB-33802 Fix icon attention required in the resource grid
- PB-33803 Fix button size and alignment for small screen on the resource workspace
- PB-33829 As a user I should not update the toolbar icon if the user is not authenticated
- PB-33833 As a user I should not see a grid size issue after a browser update
- PB-33922 Fix broken documentation links and unnecessary redirections

### Maintenance
- PB-32891 Entities validating null in anyOf should use nullable schema property
- PB-32981 Use a callback to destroy content script from a port with invalid context
- PB-33173 Add minimum version in the manifest v3 of chrome
- PB-33179 - Reuse testing pgpkeys assets served by styleguide and remove browser extension duplicate
- PB-33188 Reuse testing account recovery assets served by styleguide and remove browser extension duplicate
- PB-33191 Cover GroupUser entity with test and ensure non regression on validation changes
-  PB-33192 - When facing a domain issues due to ORK rotation, I should see the domain using console.debug
- PB-33215 Add optional ignoreInvalid parameter to group entity in order to ignore associated groups users which could be invalid
- PB-33216 Add optional ignoreInvalid parameter to user entity in order to ignore associated groups users which could be invalid
- PB-33221 Migrate GroupsCollections to v2 and cover group model sanitization with tests
- PB-33222 Ensure groups users are sanitized from groups users collection associated to a group using ignore strategy from collection v2
- PB-33226 Ensure groups users are sanitized from groups users collection associated to a users using ignore strategy from collection v2
- PB-33227 - Migrate UsersCollection to v2 and cover user model sanitization with tests
- PB-33230 - Ensure performance creating groups collection with large dataset remains effective
- PB-33236 - Ensure performance creating users collection with large dataset remains effective
- PB-33264 Validate entities schemas with anyOf null option
- PB-33267 - Validate PermissionEntity schema
- PB-33300 - Validate SecretEntity schema
- PB-33302 - Cover FavoriteEntity schema
- PB-33303 - Cover TagEntity schema
- PB-33306 - Switch ResourcesSecretsCollection to EntityV2Collection
- PB-33319 Switch TagsCollection to EntityV2Collection
- PB-33320 Switch PermissionsCollection to EntityV2Collection
- PB-33327 Switch ResourcesCollection to EntityV2Collection
- PB-33447 Ensure EntityV2Collection is treating items at the abstract constructor level
- PB-33454 - Ensure collection v2 schema is validated at the abstract class level
- PB-33459 Ensure resource entity and associated entities schemas are validated at an abstract class level - EntityV2 migration
- PB-33533 Collections and entities schemas of folders and associated should be cached, migrate to v2
- PB-33606 As an administrator, when the error is not related, I should not see "Could not verify the server key"
- PB-33615 As a user browsing the application, I should not refresh users and groups local storages when I do not need these information
- PB-33640 Performance: filter users.json by is-my-buddy to get only users I know
- PB-33648 Performance: filter group.json by is-my-buddy to get only groups I know
- PB-33796 As a signed in user when I navigate to the resource workspace, my browser extension does not load the users and the groups data
- PB-33797 As a signed in user when I navigate to the resource workspace, my browser extension only loads the groups data I am member of
- PB-33798 As a signed in user when I open the information section of the sidebar, I can see all the information
- PB-33799 As a signed in user when I display the share dialog, the autocomplete research is performed on the API instead of the local storage
- PB-33815 Selecting a group should not trigger a refresh of the local storage of the folders and resources
- PB-33816 - fix lint
- PB-33816 As a signed-in user I should see in the information section the location icon folder shared if relevant
- PB-33843 As a user I should retrieve the GPG keys of other users only when required and necessary
- PB-33921 Avoid gpgkeys sync when loading the autocomplete component

## [4.8.2] - 2024-06-13
### Improved
- PB-33686 As a user I should be signed out after browser update

### Fixed
- PB-33727 Fix session extension, service worker awaken and user instance storage not set
- PB-33801 Remove active account cache in memory

## [4.8.1] - 2024-05-18
### Fixed
- PB-33595 As a user running an instance serving an invalid certificate I should be able to sync the gpgkeyring

## [4.8.0] - 2024-05-16
### Maintenance
- PB-33541 Chrome Extension Manifest upgrade to version 3

## [4.7.8] - 2024-05-14
### Fixed
- PB-33410 Fix Chrome Extension frozen and unusable after some period of inactivity

## [4.7.7] - 2024-05-10
### Maintenance
- PB-33321 Fix local storage loading on extension update

## [4.7.6] - 2024-05-08
### Maintenance
- PB-33307 Add debug to capture onInstall reason details

## [4.7.5] - 2024-05-08
### Maintenance
- PB-33307 Browser extension version bump to v4.7.5-rc.0

## [4.7.4] - 2024-05-08
### Maintenance
- PB-33304 Fix extension update available service

## [4.7.3] - 2024-05-07
### Maintenance
- PB-33235 Convert formData file into a json serializable in offscreen
- PB-33297 Extension update available should store the state if user signed in

## [4.7.1] - 2024-05-02
### Maintenance
- PB-33225 MV3 beta rollout

## [4.7.0] - 2024-04-26
### Added
- PB-32931 As administrator, I see SSO and Directory Sync health checks in Passbolt API Status page
- PB-33065 As an administrator I can add a fallback property to map my organisation AD user username
- PB-33070 Request passphrase when exporting account kit

### Fixed
- PB-32420 Fix double calls to PwnedPassword API service
- PB-32631 Fix healthCheck Entity to support air gapped instances
- PB-33066 As AD, I should not see directorySync and SSO checks if they are disabled
- PB-33067 After an unexpected error during setup, recover or account recovery, only the iframe reload and the port cannot reconnect

### Maintenance
- PB-22623 Start service worker in an insecure environment
- PB-22640 As a signed-in user the inform call to action should remain after the port is disconnected only for MV3
- PB-22644 The passbolt icon should detect if the user is still connected after the service worker awake
- PB-23928 Handle when the extension is updated, the webIntegration should be destroy and injected again
- PB-29622 Simulate user keyboard input for autofill event
- PB-29946 When the service worker is shutdown and a navigation is detected the service worker do not reconnect port and stay in error mode
- PB-29965 Use a dedicated service to verify the server
- PB-29966 Update apiClient to support form data body and custom header
- PB-29967 Use a dedicated service to do the step challenge with the server
- PB-29968 use a dedicated service to check the user authentication status
- PB-29969 Use a dedicated service to logout the user
- PB-29988 Update the alarm in the class StartLoopAuthSessionCheckService to use the property periodInMinutes
- PB-29989 Put the alarm listener at the top level for the StartLoopAuthSessionCheckService to check the authentication status
- PB-29990 Move PassphraseStorageService keep alive alarm listener in top level
- PB-30272 Add message service in the app content script in order to reconnect the port from a message sent by the service worker
- PB-30273 On the post logout event the service worker should reconnect port that needs to receive the post logout message
- PB-30274 Add message service in the browser integration content script in order to reconnect the port from a message sent by the service worker
- PB-30310 Improve invalid groups users sanitization strategy
- PB-30335 Use timeout instead alarms for service worker
- PB-30336 Use timeout instead alarms for promise timeout service
- PB-30337 Put the alarm listener at the top level for the passphraseStorageService to flush passphrase after a time duration
- PB-30341 Remove alarms for toolbar controller
- PB-30342 Use timeout instead of alarm for the resource in progress cache service to flush the resource not consumed
- PB-30374 Check if AuthService from styleguide is still used in the Bext otherwise remove it
- PB-30375 Improve CI unit test performance by running them in band
- PB-32291 Cleanup legacy code and unused passbolt.auth.is-authenticated related elements
- PB-32335 Split PassphraseStorageService to put the KeepSessionAlive feature on its own service
- PB-32345 Ensures on the desktop app during import account that the file to import is taken into account
- PB-32597 Ensure ToolbarController are set on index.js
- PB-32598 Ensure add listener from authentication event controller are set on index.js
- PB-32599 Ensure add listener from StartLoopAuthSessionCheckService are set on index.js
- PB-32604 Ensure add listener from on extension update available controller are set on index.js
- PB-32602 Ensure add listener from user.js are set on index.js
- PB-32603 Ensure add listener from ResourceInProgressCacheService are set on index.js
- PB-32915 Update code to remove the destruction of the public web sign-in on port disconnected
- PB-32916 Update code to remove the destruction of the setup on port disconnected
- PB-32917 Update code to remove the destruction of the recover on port disconnected
- PB-33018 Automate browser extension npm publication
- PB-33024 Ensure only stable tags of the styleguide are published to npm
- PB-33024 Ensure only stable tag of the browser extension are sent for review or publish to the store
- PB-33061 Create account temporary storage
- PB-33062 Use temporary account storage for setup process
- PB-33063 Use temporary account storage for recover process
- PB-33064 Use temporary account storage for account recovery process
- PB-33068 Remove beta information for the windows app

## [4.6.2] - 2024-03-29
### Fixed
- PB-32394 As a user defining my passphrase while activating my account I want to know if my passphrase is part of a dictionary on form submission
- PB-32396 As a user defining my new passphrase while changing it I want to know if my new passphrase is part of a dictionary on form submission
- PB-32401 As an administrator defining the passphrase of the generated organization account recovery key I want to know if the passphrase is part of a dictionary on form submission
- PB-32407 As a user editing a password I am invited to confirm its edition when this one very weak in a separate dialog on form submission
- PB-32395 As a user defining my passphrase while requesting an account recovery I want to know if my new passphrase is part of a dictionary on form submission
- PB-32397 As a user verifying my private key passphrase while activation my account I do not want to know if my passphrase is part of a dictionary at this stage
- PB-32399 As a user confirming my passphrase while completing an account recovery (Admin approved) I do not want to know if my passphrase is part of a dictionary on form submission
- PB-32398 As a user confirming my passphrase while importing my private key during an account recover I do not want to know if my passphrase is part of a dictionary on form submission
- PB-32404 As a user creating a password from the quickaccess I am invited to confirm its creation when this one is part of a dictionary in a separate dialog on form submission
- PB-32403 As a user updating a password I am invited to confirm its edition when this one is part of a dictionary in a separate dialog on form submission
- PB-32405 As a user auto-saving a password from the quickaccess I should not be notified if the password is part of an exposed dictionary
- PB-32402 As a user creating a password I am invited to confirm its creation when this one is part of a dictionary in a separate dialog on form submission
- PB-32400 As a user confirming my passphrase while importing an account kit on the desktop app I do not want to know if my passphrase is part of a dictionary on form submission
- PB-32406 As a user creating a password I am invited to confirm its creation when this one very weak in a separate dialog on form submission
- PB-32427 As a user creating a password from the quickaccess I am invited to confirm its creation when this one is VERY WEAK in a separate page on form submission

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

## [4.5.2] - 2024-02-12
### Added
- PB-28672 As a user exporting resources I should also export TOTPs

### Fixed
- PB-25865 As a signed-in user I can autofill credentials using input and change events
- PB-29258 As a signed-in user with a large dataset I can select a resource quickly
- PB-29548 As a signed-in administrator I should refresh password expiry cache when navigating to the password expiry administration page
- PB-29560 As a user importing a resources from a Windows keepass kdbx I should also import TOTPs
- PB-29606 As a user exporting a resources to a Windows keepass kdbx I should also export TOTPs

## [4.5.1] - 2024-02-09
### Fixed
- PB-29626 As a user I should retrieve the csrf token if the instance is running from a sub-folder

## [4.5.0] - 2024-02-05
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

## [4.4.2] - 2023-11-06
### Fixed
- PB-28880 Fix resource with TOTP when description is updated from information panel

## [4.4.0] - 2023-11-06
### Added
- PB-25204 As a signed-in user I can create a standalone TOTP
- PB-25206 As a signed-in user I can add a TOTP to an existing password resource
- PB-25210 As a signed-in user I can edit a standalone TOTP
- PB-25224 As a signed-in user I can copy a TOTP
- PB-26088 As a signed-in user I can see standalone TOTP in the quickaccess
- PB-27600 As an administrator I want to suspend or unsuspend a user
- PB-27601 As a signed-in user I should see who is suspended in the ui
- PB-27773 As an administrator I can deny access to the mobile setup screen with RBAC
- PB-27898 As an administrator I should have the possibility to deny TOTP copy and preview actions with RBAC
- PB-27949 As a signed-in user I can see password with totp in the quickaccess
- PB-27950 As a user I can use generic OAuth2 as single sign on provider
- [FEATURE INACTIVE] PB-28263 As a user I can see the resource expiry status
- [FEATURE INACTIVE] PB-28265 As a user I can reset resource expiry date
- [FEATURE INACTIVE] PB-28266 As an administrator I can enable the password expiry feature
- [FEATURE INACTIVE] PB-28267 As an administrator I can set the email notifications of the password expiry feature

### Improved
- PB-19244 As a user with encrypted description resource type present when creating a resource using quickaccess the description should be encrypted by default
- PB-25560 As an administrator on the admin settings pages I can see the source of information
- PB-26002 As a user downloading my recovery kit I want to be warned about the critical character of this asset
- PB-26086 As an administrator generating an account recovery key for my organization I want to confirm the passphrase
- PB-26094 As an administrator having a passbolt trespassing the user limits I should see a better message
- PB-27668 As a user I'd like to know what the numbers by the heart mean
- PB-27922 As a user entering my passphrase I should see the entropy progressing
- PB-28183 As administrator I want to see warnings while synchronising the organisation users directory
- PB-28378 MFA screen should be display depending on the application

### Fixed
- PB-21625 As a user I shouldn't see apostrophe replaced by special characters
- PB-25279 As a user I should see in form call to action icon be well positioned
- PB-26000 As a user updating only a resource metadata I should not update the resource secret on the API
- PB-27784 As an administrator I should not see the account recovery enrollment twice
- PB-27794 Fix unsupported TOTP while decrypting TOTP on webapp
- PB-27894 As a user I should not see my username overpass the card in the login form
- PB-27947 Fix in-form menu generate password should not override all password fields but only new password fields
- PB-27954 Fix message after successful transfer to mobile
- PB-28170 Fix SMTP host from Sendgrid
- PB-28310 As a signed-in user I should not select or unselect a resource on TOTP click
- PB-28293 As a signed-in user I should be redirected when I click on the resource url in the information panel and contextual menu

### Maintenance
- PB-26121 Improve Styleguide coverage of password policies
- PB-27786 As a user I should not see my passphrase part of the breach if the field is empty
- PB-27945 Update web-ext lib to v7.8.0
- PB-27965 Upgrade node to v18
- PB-28148 Migrate development watcher to package.json scripts
- PB-28275 Upgrade @babel/traverse on styleguide as it has a critical security issue
- [FEATURE INACTIVE] PB-27605 As a signed-in user I can set up Yubikey as two-factor authentication on the client (previously done on the API served application)
- [FEATURE INACTIVE] PB-27606 As a signed-in user I can set up TOTP as two-factor authentication on the client (previously done on the API served application)
- [FEATURE INACTIVE] PB-27608 As a user I can sign in with TOTP and Yubikey as 2FA on the client (previously done on the API served application)

### Security
- PB-25688 As a desktop app user I should sign the exported account kit with my private key

## [4.3.1] - 2023-09-28
### Fixed
- PB-27860 As a signed-in user I should be able to autofill from the quickaccess


## [4.3.0] - 2023-09-21
### Added
- PB-24600 As a user remember me is kept checked for next time if it was used
- PB-25192 As a signed-in user I can persist the display customizations of the resource workspace grid
- PB-25202 As a signed-in user I can see an existing TOTP value in the password workspace grid
- PB-25932 As a signed-in administrator I can access the user passphrase policies
- PB-25933 As a signed-in administrator I can see the user passphrase policy settings
- PB-25934 As a signed-in administrator I can customise the user passphrase policy settings
- PB-25935 As a user registering to passbolt I have to comply with the policy
- PB-25937 As a user changing my passphrase I have to comply with the policy
- PB-27725 As a signed-in user I should not be able to edit resources with totp
- PB-27759 As a signed-in user I shouldn't see the TOTP column in the grid if the totp plugin is disabled

### Improved
- PB-22801 As an administrator I want to use a decrypted organization account recovery key
- PB-24089 Add Range component to styleguide
- PB-25301 Replace the 'unlock' icon to enhance visibility
- PB-25512 As a signed-in user I want to see previewed password with a bigger font
- PB-25965 As a signed-in user I shouldn't see the resources chips initialized with 0 as long as the breadcrumb is not rendered
- PB-27624 Release notes automation

### Fixed
- PB-18482 Fix missing translation in quickaccess resource view page
- PB-18520 Fix missing translation in user theme settings page
- PB-25247 As a user, I should not be able to configure MFA if I am not running HTTPS
- PB-25319 Fix double slashes in URLs builder in apiClient
- PB-25375 As a user I should not see the passbolt icon on gmail email search
- PB-25521 Fix web application loading skeleton
- PB-25956 Fix extra bracket typo in password generator screen
- PB-25962 As a signed-in user I should see the more button for folders, group and tag with border-radius
- PB-25966 Fix translations source strings issues reported by community in password policies administration screen
- PB-26140 Fix double detached quick access windows when the quick access is triggered by a sign-in from the in-form menu
- PB-26147 Fix user theme settings page title typo
- PB-26148 As a user when I signed out I should have the same theme on the login screen
- PB-26202 As a signed-in user, I should not be able to associate a mobile if I am not running HTTPS

### Maintenance
- PB-24795 Improve browser extension coverage of password policies
- PB-25551 Upgrade outdated development library web-ext to 7.6.2
- PB-25557 Remove xmldom dependency as direct dependency
- PB-25695 Remove unused utility hashString
- PB-25697 Remove unused jquery, copy-webpack-plugin dependency and references
- PB-25698 Remove cross-fetch unused direct dependency
- PB-25700 Remove simplebar as direct dev dependency
- PB-27662 Drive progress dialog with dedicated context
- PB-27706 Homogeneize resource plaintext secret as an object

### Experimental
- PB-25824 As an unknown user I should be invited to configure the desktop application
- PB-25825 As an unknown user configuring the desktop app I should be able to import an account kit
- PB-25826 As an unknown user configuring the desktop app I should see the detail of the account kit & verify my passphrase when importing an account


## [4.2.0] - 2023-08-21
### Added
- PB-24268 As a signed-in user I can reorder & show/hide columns of the resource workspace grid
- PB-25189 As a signed-in user I can resize the columns of the resource workspace grid
- PB-25283 As a signed-in administrator I can access the password policies
- PB-25283 As a signed-in administrator I can see the password policies settings
- PB-25283 As a signed-in administrator I can customise the password policies
- PB-25283 As a signed-in user I generate passwords using the password policies of my organization
- PB-25283 As a signed-in user I am warned about passwords which are part of a dictionary

### Improved
- PB-25251 As a sign-in user I want the passwords to be rendered with a monospace font
- PB-25288 As a signed-in user I should see the number or resources or users filtered in the workspace from the breadcrumb

### Fixed
- PB-22555 As a German-speaking signed-in user I want to autofilll my password and name when the input identifiers are in German
- PB-24612 As a user I should not see “remember until I log out” option in the quickaccess it the option is disabled from the servers
- PB-25259 Fix dropdown profile style
- PB-25260 As a user I should be redirect to the resource workspace when signing in right after a sign out
- PB-25261 Fix box-shadow on more button for folders
- PB-25320 In-form menu icon was moving when scrolling on page
- PB-25504 As a user I want to use SSO with Firefox
- PB-25807 As a signed in user I should see my profile metadata updated after editing my profile
- PB-25816 As a signed-in user, the link in resource activity or user account recovery activity should be valid
- PB-25822 Fix typos in User Directory settings interface

### Maintenance
- PB-25390 Upgrade outdated library word-wrap
- PB-25391 Udgrade outdated library tough-cookie
- PB-25704 Upgrade outdated library babel

### Experimental
- PB-25185 As LU user on the browser extension, I want to export my account to configure the windows application
- PB-25253 Desktop bootstrapped applications should have CSP rules enforced prior to execute any javascript

## [4.1.2] - 2023-07-26
### Improvement
- PB-25251 As a signed-in user previewing a password, I should be able to distinguish look alike characters

### Fixed
- PB-25502 Fix web navigation issue when a port already exists and port disconnection is not fired
- PB-25339 Fix application refusing to load when detecting passbolt event activities
- PB-25311 Fix as anonymous user with the browser extension not configured I should be redirected to passbolt getting started page when using the toolbar icon
- PB-24933 Fix in-form menu detection not working when existing tab port disconnection occurs after webnavigation event

### Maintenance
- PB-25471 Crowdin should export only a selected subset of languages
- PB-25272 Github actions updates for storybook
- PB-25172 Remove former demo application, replaced by storybook

## [4.1.0] - 2023-06-21
### Added
- PB-24169 As an administrator I want to customise what capabilities users are allowed to access on the UI of my organisation
- PB-24598 SSO allow administrators to remap email/username properties

### Fixed
- PB-14174 As a user I want the inform menu not to be displayed outside my browser window
- PB-24657 As a user I should see the triage page even when SSO is misconfigured
- PB-25031 Fix margin on folder name in the information panel

### Improvement
- PB-24619 As LU I should see the link on the same line in a paragraph
- PB-24646 As LU, I should see colored passwords

### Maintenance
- PB-24622 Put back the rolled-back code for LDAP multi-domain and field-mapping feature
- PB-24794 Adapt browser extension to not crash when unknown content types are retrieved from the API

### Security
- PB-23852 PBL-02-002 As a user I should sign-out using POST method
- PB-24997 Change static images URL to be served from the browser extension instead of the API

## [4.0.4] - 2023-06-07
### Fixed
- PB-24932 Fix: As a user I want to be able to sign-in through SSO from the inform menu

## [4.0.3] - 2023-06-05
### Fixed
- PB-24734 Fix As a registered user I would like to be able to use SSO login via the quickaccess

## [4.0.1] - 2023-05-17
### Fixed
- PB-24639 Fix: As an administrator I want to be see which users have activated MFA from the users workspace

## [4.0.0] - 2023-05-02
### Added
- PB-23531 As an administrator I can setup google as SSO provider
- PB-23532 As a user I can sign-in with SSO
- PB-23535 As a user I want to self register with SSO enabled
- PB-23952 As an administrator I want to synchronize only groups belonging to a given parent group
- PB-24168 As a user I want to use an accessible version of the UI

### Improvements
- PB-21564 Application should be aware of authentication status as soon as the user is getting signed out

### Fix
- PB-21488 Fix the loading of pagemods when user data is not set in the local storage
- PB-23547 As a signed-in user I should auto-filling credentials in iframe even if there is an empty iframe src ahead
- PB-24076 Fix ApiClient BaseUrl generation to avoid double slashes in the final URL
- PB-24100 As a developer I want to use a fix working version of storybook
- PB-24145 As a signed-in user the inform integration should not freeze the browser if there is a lots of dom changes
- PB-24260 As a signed-in user I should not see a resource stays selected after moves in a folder

### Security
- PB-22858 As a user the session storage should have a limit of port by tab
- PB-22859 As a user the web integration pagemod should be attached only on top frame
- PB-23556 PBL-08-002 WP2: Passphrase Retained In Memory Post-Logout
- PB-23942 PBL-08-008 WP2: Lack of explicit CSP on extension manifest
- PB-23797 Backport MV3 port manager on MV2 without using the webNavigation permission

### Maintenance
- PB-18667 Migrate gpgAuth session check loop into a dedicated service startLoopAuthSessionCheckService
- PB-22641 As a user the browser extension should handle when the version is updated
- PB-22642 As a developer, when inform call to action and inform menu are destroyed, I should remove the port reference in the session storage and portManager
- PB-24105 As a user I want to trigger file download on firefox with file pagemod
- PB-24131 As a developer I should have class files in the correct folder
- PB-24134 As a developer I should be able to run the CI pipeline even if the audit job is failing
- PB-24147 Remove legacy entry point to check if the user is authenticated

## [3.12.1] - 2023-03-29
### Fix
- PB-23930 Fix the removal of the SSO kit on CSRF token error
- PB-23949 Fix as a user I should be able to use uppercase characters for username
- PB-24041 Fix missing import XRegExp
- PB-24065 Fix to prevent the browser extension from crashing if the server is configured with an unsupported SSO provider

## [3.12.0] - 2023-03-15
### Added
- PB-22521 As a signed-in user, I want to export resources in logmeonce csv
- PB-22520 As a signed-in user, I want to export resources in nordpass csv
- PB-22519 As a signed-in user, I want to export resources in dashlane csv
- PB-22518 As a signed-in user, I want to export resources in safari csv format
- PB-22517 As a signed-in user, I want to export resources in mozilla csv
- PB-22515 As a signed-in user, I want to export resources in bitwarden csv
- PB-22516 As a signed-in user, I want to export resources in chromium based browsers csv
- PB-22838 As an administrator I can customise the application email validation

### Improvements
- PB-22896 Improve DUO style

### Fix
- PB-23281 Fix as a user I should see an accurate entropy when a password contain words from a dictionary
- PB-23541 As a user I can use SSO recover when Passbolt is served from a subfolder

### Security
- PB-23706 As an administrator I should be the only one to know which users have enabled MFA


## [3.11.2] - 2023-03-03
### Security
- PB-23328 - PBL-08-001 WP2 Credentials Leakage via Clickjacking - As a signed-in user I should not be able to open the application iframe in an untrusted parent frame
- PB-23327 - PBL-08-001 WP2 Credentials Leakage via Clickjacking - As a signed-in user I should not be able to open the quickaccess in an iframe

## [3.11.1] - 2023-02-27
### Added
- PB-22081 As a signed-in user I can import my passwords from a Mozilla web browsers csv export
- PB-22082 As a signed-in user I can import my passwords from Safari web browser csv export
- PB-22116 As a signed-in user I can import my passwords from a Dashlane csv export
- PB-22117 As a signed-in user I can import my passwords from a Nordpass csv export
- PB-22510 As a signed-in user I can import my passwords from a LogMeOnce csv export
- PB-22866 As a user I want to use passbolt in Italian
- PB-22866 As a user I want to use passbolt in Portuguese (Brazil)
- PB-22866 As a user I want to use passbolt in Korean
- PB-22866 As a user I want to use passbolt in Romanian
- PB-22882 As a user I can use the SSO feature to speed up the extension configuration process

### Improved
- PB-21408 As a logged-in user navigating to the account recovery user settings from the MFA user settings I should not see the screen blinking
- PB-21548 As a signed-in user I can access my MFA settings for a given provider following a dedicated route
- PB-22647 As a signed-in user I want to use my personal google email server as SMTP server
- PB-22699 A a user I want a unified experience using pwned password feature
- PB-22725 As a signed-in user I want to see an introduction screen prior setting up Duo v4
- PB-22835 As an administrator I can define the optional SMTP Settings “client” setting
- PB-22861 As an administrator I want to manage Duo v4 settings

### Fixed
- PB-22387 As an administrator generating an account recovery organization key, I should see the warning banner after submitting the form
- PB-22587 Fix the CSV exports columns presence and order
- PB-22588 As a signed-in user I want to import resources in Lastpass csv export following their conventions
- PB-22701 As a signed-in user I should not see the MFA mandatory dialog if there are no MFA providers enabled for my organization
- PB-22704 As a user with a configured account and SSO, I should be able to recover/setup another account
- PB-23277 As a signed-in user I should not have a 404 error with the flag mfa policy disable

### Security
- PB-21645 As content code application I should be restricted to open ports only for applications I am allowed to open
- PB-21754 As a user I should not see any trace of previously downloaded content in my history
- PB-23279 As a user completing a setup I should not have access to the background page decryption secret capabilities

### Maintenance
- PB-19641 Handle the setup and recover runtime object
- PB-19675 As a signed-in user I want to perform a recover using the browser extension with MV3
- PB-19676 As a signed-in user I want to perform a setup using the browser extension with mv3
- PB-19677 As a signed-in user I want to perform a sign-in using the browser extension with MV3
- PB-19678 As a signed-in user I want to start the application using the browser extension with mv3
- PB-21750 As service worker I should be able to wake up a disconnected application port
- PB-21822 As a signed-in user I want to open quickaccess using the browser extension with MV3
- PB-21823 As a signed-in user I want to see the web integration using the browser extension with MV3
- PB-21824 As a signed-in user I want to see the web public sign in using the browser extension with MV3
- PB-21829 Clean port after a web navigation on the main frame
- PB-21996 As a signed-in user I want to see the in form call to action using the browser extension with MV3
- PB-21997 As a signed-in user I want to see the in form menu using the browser extension with MV3
- PB-22009 Create a service to parse the webIntegration in url
- PB-22076 Handle flush local storage on browser runtime onStartUp for MV3
- PB-22077 Handle config init and post logout on service worker startup
- PB-22078 Create a polyfill to handle browser.action on MV2
- PB-22113 As a signed-in user I should be able to open the quickaccess popup from inform menu with MV3
- PB-22412 As a signed-in user I want to use account recovery process using the browser extension with MV3
- PB-22648 Adapt payload when back return duo settings
- PB-22896 Update styles to adapt to Duo forms updates
- PB-22898 Update login form design styles

## [3.10.0] - 2023-02-09
### Added
- PB-21752 As an anonymous user I can self register if the organization allows my email domain
- PB-21999 As a signed-in administrator I can force users to authenticate with MFA at each sign-in
- PB-22000 As a signed-in administrator I can force users to enable MFA
- PB-22080 As a signed-in user I should be able to import chromium based browsers csv
- PB-21874 As signed-in user I should be able to import bitwarden csv

### Improved
- PB-21910 As a signed-in administrator on the self registration admin settings form I want to see the domain warnings while typing and not after blur event
- PB-22007 As a user finalizing my account recovery I should be able to authenticate with SSO after my first sign out
- PB-22619 As a user authenticating with SSO, I should close the SSO popup when I am navigating away in the main frame
- PB-22617 As a user authentication with SSO, closing the third party popup should not redirect me to the passphrase screen

### Fixed
- PB-18371 Fix contextual menu positioning issue when right clicking at the bottom of the page
- PB-22386 As an administrator I want to know if the weak passphrase I am entering to generate an organization recovery key has been pwned
- PB-22387 As an administrator generating an account recovery organization key, I should see the warning banner after submitting the form
- PB-22388 Fix as a user recovering my account i should not see that the passphrase i entered has been pwned if it is not the valid passphrase
- PB-22084 As a signed-in user I can import my passwords from 1Password csv export with their new header conventions

### Maintenance
- PB-21562 Refactor service worker port and add coverage
- PB-21813 Unit test the private key's passphrase rotation SSO kit regeneration
- PB-21878 Unit test the user stories related to SSO via quickaccess
- PB-21932 Unit test: As AD I want my SSO kit to be generated when saving a new SSO settings
- PB-21933 Create a service to parse the sign in url
- PB-22337 Merge both controller AuthController and AuthSignInController to keep consistency
- PB-22353 Remove redundant toDto function in SsoClientPartEntity
- PB-22403 Instead of using new URL when getting sso url login, use an entity to ensure consistency and that the data is validated
- PB-22478 As a developer I should be sure my changes don’t introduce regression in the build
- PB-22479 As a developer I should be sure my changes don't introduce dependency vulnerabilities
- PB-22614 Avoid telemetries to be sent to Storybook
- PB-22630 Fix the Unit test in the browser extension about  method that shouldn't be called

## [3.9.2] - 2023-01-31
### Fixed
- PB-22557 As LU I should be able to download file on chromium based browsers

## [3.9.0] - 2023-01-18
### Added
- PB-21383 As AD I can save the SSO server settings
- PB-21383 As AD I can disable the SSO server settings
- PB-21393 As a registered user I can use the SSO feature to sign in to passbolt
- PB-21400 As LU I can rotate my private key's passphrase and still be able to sign in via SSO
- PB-21735 As a signed-in administrator in the administrator workspace, I can see the user
self registration settings option in the left-side bar
- PB-21740 As a signed-in administrator I can remove a domain from the user self registration list
- PB-21767 As AN I want to have the SSO login displayed by default when I have an SSO kit available
- PB-21768 As AD I want my SSO kit to be generated when saving a new SSO settings if I don't have already one
- PB-21769 As AN I want to use SSO login from the quickaccess
- PB-21814 As LU When rotating my passphrase I want to clean my SSO kit on the API
- PB-21842 As AN I want to have help if I can't remember my passphrase and SSO login is activated
- PB-21907 As a signed-in on the self registration admin settings form, I want to see the warning message on a row domain even when there are errors on other domains rows
- PB-21908 As a signed-in administrator on the self registration admin settings form, I should not see an error when I enable the settings which previously were containing error
- PB-21909 As a signed-in administrator on the self registration admin settings form, I want to see the new row having focus when I click on the add a new row button
- PB-22006 - As a user finalising my recover I should be able to authenticate with SSO after my first sign out

### Improved
- PB-21920 As a user I want to use the new PwnedPasswords service when I setup an account, recover an account, change my passphrase or generate a organisation recovery key
- PB-19793 As a user I want to see a consistent layout while signing-in to passbolt
- PB-20561 As a user changing my passphrase I would like to see the passphrase field description translated
- PB-21490 As an administrator I shouldn't see the "save required" banner after saving the SMTP settings
- PB-20559 As an administrator I want clearer account recovery email notification descriptions relative to administrators
- PB-21746 As a signed-in user I want to autofill french authentication form using french language as field name
- PB-21612 Refactor fileController into a dedicated service
- PB-19156 Replace setInterval by alarm in worker::waitExists

### Fixed
- PB-19649 As a user sharing a resource/folder, I should be able to see the number of users contained in groups search result
- PB-21443 As a user on the administration section I would like to see the passbolt logo
- PB-21476 As signed-in user, I want to copy content in my clipboard using passbolt over http
- PB-22022 Fix height for the svg Passbolt logo

### Maintenance
- PB-19054 Remove the usage of the soon the soon unavailable global “window” object
- PB-19292 As a user I want file downloads to be compatible with MV3 as well
- PB-19299 Remove the usage of the soon the soon unavailable global “window” object in the unit tests
- PB-19309 Remove the usage of the soon the soon unavailable global “window” object in the “Random” crypto helper
- PB-19586 Refactor administration screen actions components
- PB-19639 Refactor applications port connection bootstrap
- PB-19650 Handle MV3 port re-connection
- PB-19657 Add frameId to the ScriptExecution
- PB-21370 Reduce repository size
- PB-21435 Bootstrap MV3 service worker
- PB-21486 Increase code coverage relative to the SMTP authentication method recently added in the SMTP settings admin screen
- PB-21911 As a developer I want to know the source (author, url, license) of the src/react-extension/lib/Domain/Domains.js list


## [3.8.2] - 2022-11-27
### Fixed
- PB-21565 As a logged-in user, I should decide to keep my session alive until I sign out
- PB-21372 As a logged-in user, I should see folders without caret aligned

## [3.8.0] - 2022-11-04
### Added
- PB-19151 As a logged-in user, I want to be able to use Solarized light and dark themes
- PB-19220 As an administrator, I want to manage the organization SMTP settings in the administration workspace

### Improved
- PB-19229 As an administration, I want to see the passwords I entered in the MFA administration settings forms
- PB-19226 As a logged-in user, I want to move resources to another folder with better performances
- PB-19034 As a group manager I should see if there is more than 3 users in a group I'm editing
- PB-19214 As a logged-in user, I want to see long entities names fitting in dialog

### Fixed
- PB-19228 As a user, I should see a feedback when the password or description fields content is truncated by a field limit
- PB-19216 As a logged-in user, I want to populate a form from the Quick Access after the generation of new credentials
- PB-20978 As a logged-in user, I want to autocomplete using reserved keywords

### Security
- PB-19537 As a user I want my password fields to be hidden in Passbolt forms when the form is being submitted
- PB-18639 Restrict the port connection to our extension only for chrome

### Maintenance
- PB-19237 As a developer, I should see the “change user passphrase” stories in storybook
- PB-18499 [MV3] Bootstrap MV3 build
- PB-18600 [MV3] Migrate passphrase “remember me” code into a service
- PB-18640 [MV3] Use alarms API instead of setTimeout and setInterval
- PB-18641 [MV3] Use ProgressService instead of ProgressController
- PB-18649 Use navigator.clipboard API instead of the copy to clipboard iframe mechanism
- PB-18657 [MV3] Implement a scripting polyfill to ensure scripts and css can be injected with both manifest versions
- PB-19231 Improve “select” styleguide component unit tests coverage
- PB-19232 Implement browser extension app url parser
- PB-19238 Move events create and get to dedicated controllers
- PB-19558 Run storybook test against CI
- PB-19586 Create email notifications actions

## [3.7.3] - 2022-09-24
### Security
- PB-19090 Ensure we are spell-jacking proof for our input password

## [3.7.2] - 2022-09-13
### Fixed
- PB-17158 As LU I want to see an entropy at 0 when the typed passphrase is exposed in a data breach
- PB-18370 As LU I want to see the user settings yubikey form matching the common form style
- PB-18417 As AN I want to see the server key change error with the proper design
- PB-17154 As AD I want to see the input field in user directory UI with the proper design

### Maintenance
- PB-17720 As AD I wish the account recovery setting page not to refresh infinitely
- PB-18498 As a developer I wish to build the background page in manifest version 2 with webpack

### Improved
- PB-16898 As AN I want to the full list of supported browser if I'm not using one
- PB-18495 As LU I want to see effective date as tooltip of calculated relative date
- PB-17152 As LU for a first install with chrome, I wish to see the 'eye catcher' with a good contrast
- PB-18659 As LU I want to be able to give to folder names up to 256 characters
- PB-17062 As a developer I can customize and test new theme on storybook
- PB-16946 As a developer I want to have a new theme in Storybook

## [3.7.1] - 2022-08-11
### Fixed
- PB-18420 As AN completing the setup I should understand what information the account recovery feature will treat

### Maintenance
- PB-18421 As a developer I can build a custom theme

### Security
- PBL-07-004 WP1: Finished account recovery aids future key compromise

## [3.7.0] - 2022-07-26
### Added
- PB-15305 As LU I can access the mobile configuration page from the profile dropdown
- PB-16925 As AN I can access the sign in form of my organization from passbolt.com
- PB-17094 Mark account recovery feature as stable
- PB-17095 As a user I can use passbolt in Spanish
- PB-17095 As a user I can use passbolt in Lituanian

### Improved
- PB-14103 As a user I want to be able to use the autofill on dzb-bank.de
- PB-14865 As LU I should see the warning messages on all dialogs with the same design
- PB-16560 As LU I should be able to read textarea content of dialog without zooming it
- PB-16641 As AD I want to have a clear error message when I import an account recovery organization key having an expiry date
- PB-16665 As a user I should see proper error message when an unexpected error happened in the quickaccess
- PB-16695 As a translator I can provide translation for languages that have multiple plurals
- PB-16937 As group manager I want to see a dialog skeleton when I'm editing a group having a large number of members
- PB-16942 Improve UI performance while adding a user to an existing group
- PB-16944 Improve UI performance while sharing multiple passwords in bulk
- PB-16991 Improve UI performance of the create group dialog
- PB-16995 Improve UI performance while adding a user or group to the list of people to share a password with
- PB-16998 As GM selecting a user to add to a group, I should see the latest member added
- PB-16703 As a user I can autofill my username on ovh.com
- PB-16757 As a user on a screen with low dpi I do not want to have a blur effect on the text
- PB-16759 As a user I want to see a coherent UI on a screen with a large resolution

### Fixed
- PB-15049 As a user I should be able to complete the setup even if my machine and the server do not have a synchronized time
- PB-15247 As a user I should not see passbolt setup/recover starting on pages having similar urls
- PB-16169 As LU I want to see the feedback card call to actions aligned to the left
- PB-16640 As AD I should be able to subscribe to the account recovery program right after configuring it for the organization
- PB-16663 Misc style fixes on account recovery download generated key dialog
- PB-16763  As LU I should be able to change my passphrase and download the new recovery kit
- PB-16769 As LU I should be able to save passwords with an uri greater than 1024 from the in-form integration
- PB-16793 Misc style fixes on account recovery administration page
- PB-16807 As a user I should see the spinner Icon in the Autocomplete component
- PB-16840 As a user I should not get an error if a gpg key is stored in the local storage with a gpg key expiry set to null
- PB-16841 As AD I should not be able to import a public organization key having an expiration date
- PB-16883 As AD I want to be able to select Groups parent group and Users parent group fields in the User Directory interface
- PB-16926 As LU I should be able to see the right 'Modified' date property in the user sidebar
- PB-16928 As a translator I should not have strings with unpredictable variables to translate
- PB-17012 As a user if my domain changed, I should still see the login form after completing a setup, recover or an account recovery
- PB-17013 As LU I should see the pre-loading / skeleton style properly
- PB-17090 As a contributor I want to be able to switch theme in storybook
- PB-17155 As a user I want to see my security token with the chosen colors on the account recovery complete screen

### Maintenance
- PB-13559 CI to report on code coverage
- PB-13887 Prepare theme colors file to welcome the theme customization feature
- PB-14271 Follow-up add className disabled for input text div
- PB-14876 Add test for browser integration scroll parent on iframe
- PB-16770 Update React to version 17
- PB-16994 Remove check extension configured for browser integration bootstrap
- PB-17029 As contributor I want to see a storybook home page
- PB-17032 Remove translatable strings that are duplicated
- PB-17071 Log verify gpg key error on authentication screen

### Security
- PB-15259 As LU sharing a resource/folder I want to see a unified tooltip that informs me about a user fingerprint
- PB-16141 As AN importing a key during the setup, I should be warned when my passphrase is part of a data breach
- PB-16152 As AD I can not generate an account recovery key with a password which is part of a data breach
- PB-16154 As AN I cannot bypass the data breach assertion while completing the setup
- PB-16595 As AD reviewing an account recovery request I should get an error if the domain stored in the encrypted password data is not similar to mine

## [3.6.2] - 2022-06-02
### Improved
- PB-16651 As LU I want to get a clear message if I enroll to a disabled account recovery program
- PB-15677 As LU I want to see openpgp assertions messages translated into my language

### Fixed
- PB-16736 Fix as AN I can accept a new server key

## [3.6.1] - 2022-05-31
### Improved
- PB-16116 Change user creation dialog tips following the introduction of account recovery
- PB-16119 As LU changing my security token I should be able to access documentation about phishing attacks
- PB-16166 Change nested folders icons size
- PB-16206 Change search bar padding
- PB-16207 Change midgar theme hover background colour
- PB-16208 Change midgar inset shadow highlight opacity
- PB-16209 Change inside fields buttons radius
- PB-16210 Change midgar hover/active grid lines backgrounds
- PB-16211 Change midgar active button background
- PB-16212 Change authentication loading spinner padding
- PB-16213 As LU I should see a beta pill next to the account recovery menu entry
- PB-16556 Change midgar sign-in form background
- PB-16559 Change user settings account recovery layout
- PB-16588 As GM editing group memberships, I want to see the tooltip icon aligned with the username
- PB-16589 Change the attention required icon color in the user settings menu
- PB-16592 Change quickaccess connecting state box background
- PB-16603 Change grids font weight
- PB-16605 Reduce letter spacings globally
- PB-16639 As LU enrolling to the account recovery program I should be requested my passphrase

### Fixed
- PB-14278 As LU I should see warning messages on form fields
- PB-16117 As AD I should not see the MFA status in the user sidebar if the user is not active
- PB-16146 As AD I should not be able to copy the public key of a inactive user
- PB-16558 As AN on unauthenticated page I should not see “about us” cta tooltip
- PB-16604 As a LU I should be able to sort the grid by Username and URI
- PB-16661 As a AN I can accept a server key rotation when the server key stored in the local storage cannot be parsed

### Maintenance
- PB-16155 Apply linter on all styleguide src code
- PB-14951 Move common test material

## [3.6.0] - 2022-05-23
### Added
- PB-12965 As AD I can enable account recovery for the organization
- PB-13759 As AD I can rotate the organization account recovery key
- PB-16193 As AD I can see a user account recovery requests history
- PB-13012 As a user who lost its credentials I can request an account recovery
- PB-13025 As AD I can approve or reject an account recovery request
- PB-16117 As AD I can see a user MFA status in the details sidebar
- PB-15033 As a user who lost its credentials I can request help to an administrator
- PB-14672 As a user I should see the new design on the password workspace
- PB-14673 As a user I should see the new design on the user workspace
- PB-14674 As a user I should see the new design on the user settings workspace
- PB-15026  As a user I should see the new design on the administration workspace
- PB-14675 As a user I should see the new design on the authentication screens
- PB-14677 As a user I should see the new design on the quickaccess application
- PB-14960 As a user I should see the new design on the web integration inform menu
- PB-14131 As AN performing a setup, I can import ECC keys

### Improved
- PB-14896 As AN performing a setup, I should not be able to import an already decrypted key
- PB-14816 As AN performing a setup, I should not be able to use a passphrase which is part of a data breach
- PB-14462 As AN on the authentication screens, I should see unexpected errors details
- PB-14203 As LU on the application, I should see unexpected errors details
- PB-13852 Improve encryption/decryption performances

### Security
- PB-13908 As AN performing a setup, I generate key of 3072 bits
- PB-13908 As AN performing a setup, I cannot import keys weaker than 3072 bits

### Fixed
- PB-15241 As a user I can use the web integration inform menu in iframe authentication forms
- PB-13901 As AN performing a sign-in, I should be prompted the server key changed only when the parsed key changed
- PB-14130 As LU I can select multiple passwords filtered by folder
- PB-14405 Fix misc sentences plural

### Maintenance
- PB-14155 Upgrade node to version 16
- PB-13852 Upgrade openpgp.js to version 5
- PB-14672 Increase storybook screens coverage
- PB-14052 Increase browser extension code coverage

## [3.5.2] - 2022-04-12
### Improved
- PB-14880 Debounce/throttle resource workspaces API requests

## [3.5.1] - 2022-03-29
### Fixed
- PB-14378 Tab doesn't always have defined url, title and favIconUrl properties on chrome.tabs.onUpdated event listener callback

## [3.5.0] - 2021-01-12
### Added
- PB-13161 As LU I should be able to passbolt with my Android mobile
- PB-13161 As LU I should be able to passbolt with my IOS mobile
- PB-13321 As a user I can use passbolt in Dutch
- PB-13321 As a user I can use passbolt in Japanese
- PB-13321 As a user I can use passbolt in Polish

### Improved
- PB-9402 As LU I should be able to create and import passwords having a name and username of 255 characters long
- PB-13178 As a user visiting the web stores I should be aware that the application supports multiple languages
- PB-9748 Optimize in-form menu integration performance by avoiding the CTA mutation observer to be called when passbolt manipulates the DOM itself

### Security
- PB-13162 Upgrade QRCode library to v1.5.0

### Fixed
- PB-12819 Fix as LU I should autofill/auto-save on forms having only a password field
- GITHUB-136 Fix as LU I want to see the in-form menu CTA well positioned on pages having no scroll but CSS transformation
- GITHUB-137 Fix as a user I should see the in-form menu CTA on modal having a z-index greater that 1000
- PB-13268 As LU I should be able to put comma in my user names
- PB-12873 As LU I shouldn’t see double escaped characters on the translation of strings including variables

### Maintenance
- PB-12955 Fix error and warning messages in unit test console
- PB-13309 Upgrade dev dependency webpack-dev-server to v4.7.2

## [3.4.0] - 2021-12-01
### Added
- PB-9826 As a user I want to use passbolt natively on Edge
- PB-1743 As LU I want to tag resource using drag and drop
- PB-8372 As LU I want to see the quickaccess application in dark mode
- PB-8371 As LU I want to see the login screen in dark mode
- PB-8371 As AN I want to see the recover & setup screens in dark mode as per my OS preferences

### Improvement
- PB-9374 As LU I want to see the loading text translated in all the setup/recover screens
- PB-9374 As LU I want to see the next button translated in all the setup/recover screens
- PB-8521 As LU I want to preview my passphrase when I sign-in with the quickaccess
- PB-8521 As LU I want to preview the password protecting a kdbx when I import a kdbx protected by password
- PB-9292 As LU I want to see the neat grids checkboxes
- PB-8935 As LU changing my passphrase I want to see my security token when my current passphrase is requested
- PB-9315 As AN I want to see some space between my name and my avatar on the login screen
- PB-9318 As LU already logged in I don't want to see any error when I try to sign-in again

### Fixed
- PB-9316 Fix as LU I don't want to see a padding at the right of the quickaccess right after signing in
- PB-9759 Fix as LU I don't want to see in form menu CTA if the associated input field was removed from the DOM
- PB-9376 Fix as LU I want to see the sub-folders caret aligned with the sub-folders names
- PB-8900 Fix as LU I don't want to see the sub-folders of the last folder displayed on top of the tags section
- PB-9648 Fix as LU I don't want to see in form menu CTA displayed out of its associated input field
- PB-9409 Fix as LU I don't want to see a dead link on the update my passphrase settings screen
- PB-8934 Fix as LU I want to see the key UI in the key inspector screen of the profile instead of my account full name
- PB-9410 Fix as LU changing my passphrase I should see the processing button aligned with the other form button
- PB-9321 Fix spelling mistakes reported by the community
- PB-9287 Fix as LU I want to see the text displayed in the recovery process "check your email" screen will the right size
- PB-8939 Fix as LU I don't want to see the progress dialog current operation details on 2 lines
- PB-9286 Fix as LU I want to see the locale dropdown field of the setup/recover screen well positioned
- PB-8938 Fix as LU previewing a password in the resource details sidebar I don't want to see the password spread over 2 lines
- PB-8937 Fix as LU previewing a password in the grid I don't want to see the password spread over 2 lines
- PB-9285 Fix as LU uploading an invalid avatar I want to see an error having the same style as other form fields errors
- PB-9331 Fix as LU I should not see the in-form menu CTA on the passbolt trusted domain
- PB-9317 Fix theme selection screen does not work when server url is not a TLD

### Security
- SEC-315 fix Upgrade validator dependency

### Maintenance
- PB-8523 Ignore "src/css" folder in styleguide dependency npm package
- PB-8432 Improve the way styles are loaded in storybook
- PB-5897 Add language switch in storybook for all components
- PB-8374 Lint background page source code

## [3.3.1] - 2021-10-26
### Fixed
- PB-9388 Fix unnecessary organization settings API calls

## [3.3.0] - 2021-10-20
### Added
- PB-7608 As LU I should be able to customize the password generator parameters
- PB-7608 As LU I should be able to use emojis in the generated passwords
- PB-7608 As LU I should be able to generate passphrase instead of passwords
- PB-7606 As LU I should be able to see how many credentials are suggested for the page I’m currently on by looking at the passbolt icon in the toolbar
- PB-7649 As LU I should be prompted to save a new credential when I generate a password for a new sign-up form
- PB-7683 As LU I should be able to auto-fill a suggested credential directly from inside an authentication form
- PB-7693 As LU I should be able to generate a password directly from inside a sign-up form
- PB-8189 As a user should be able to use the application in German or Swedish
- PB-6034 As LU I should be able to configure my mobile [experimental]

### Improvement
- PB-7639 As LU I should be able to import folders containing slash in their names
- PB-8256 As LU I should be able to see the username and password fields pre-filled when I create a password with the quickaccess
- PB-8088 As LU I should not see the quickaccess passphrase capture screen shaking when it appears
- PB-7599 As AN installing the extension on chrome I should be able to see instructions regarding how to pin the extension in the toolbar
- PB-7626 As LU I should be able to auto-fill a form by directly clicking on a credential suggested by the browser extension quickaccess without seeing the credential details first
- PB-6132 As LU I should be able to see the role column inside the users grid
- As LU I should be able to see my quickaccess with a larger wi

### Fixed
- PB-7813 Fix as LU I shouldn't be able to export from the folders section label if the exports feature is disabled
- PB-8306 Fix as LU I should see a content skeleton during loading on the share dialog of the application
- PB-8525 Fix as LU signing-in for the first time with the quickaccess I should be able  to see the tags category
- PB-7364 As GM I should not see the group name editable in the group edit dialog

### Security
- PB-8368 Password secret complexity calculation algorithm should take in account graphemes
- PB-8453 Mark password fields that are viewable as not auto-completable
- PB-8455 Update dependencies, remove unused grunt-contrib-concat

### Maintenance
- PB-8367 Add code coverage automation
- PB-8492 Optimize passbolt-styleguide dependency package size
- PB-7575 Remove jQuery dependency
- PB-6057 Remove underscore dependency

## [3.2.3] - 2021-06-07
### Fixed
- PB-7561 Fix as LU I should import CSV containing non latin1 characters
- PB-7563 Update passbolt styleguide dependencies

## [3.2.2] - 2021-05-31
### Fixed
- PB-7569 As AN with an unconfigured extension on chrome I should not get an error clicking on the toolbar passbolt icon

## [3.2.1] - 2021-05-26
### Added
- PB-5054 French internationalization
- PB-5526 As AD I can manage the subscription key from the administration panel

### Fixed
- PB-5366 Fix share autocomplete search results can be invalid
- PB-5498 Fix image version displayed after avatar upload
- PB-5861 Fix serializePlaintextDto should validate secret maxlength if resourceTypeId is set to legacy type, or not set
- PB-5909 Fix as LU aborting a preview operation I should not see an empty preview
- PB-5983 Fix as LU I can import passwords with non latin characters
- PB-6008 Fix as LU I should get a feedback in the quickaccess when I try to autofill credentials on a page, but an error occurred
- PB-6080 Fix add favorites fetch payload error

### Improvement
- PB-5443 As LU I should get a visual feedback when the maximum length of the secret fields is reached so that I do not loose data
- PB-5455 As LU selecting a description order to copy it should not enter the description edit mode
- PB-5496 As LU updating my avatar I should see the error message if an error occurred
- PB-5857 As LU I should be able to change the user role in the create/edit user dialog by clicking on the checkbox label

### Security
- PB-6012 Fix the quickaccess suggestion component should not suggest TLD entries (PB-01-002)

### Maintenance
- PB-5069 Migrate moment to Luxon
- PB-5884 Move quickaccess front end code to the styleguide repository
- PB-5887 Fix semantic gap in naming conventions in styleguide
- PB-5959 Bump webpack to v5

## [3.1.0] - 2021-03-17
### Added
- PB-4924 As LU I should be able to edit my security token
- PB-4917 As LU I should be able to change my passphrase
- PB-3550 As LU I can preview a password in the passwords grid
- PB-3575 As LU I can preview a password in the quick access
- PB-3570 As LU I can preview a password in the password details sidebar

### Fixed
- PB-5437 As LU I should see the group edit dialog when I follow a group edit permalink
- Allow resizing of textarea

## [3.0.7] - 2021-03-04
### Fixed
- GITHUB-156 Fix import/export and legacy API v2

## [3.0.6] - 2021-03-02
### Fixed
- Fix missing chevron image in quickaccess
- Remove EJS from dependencies
- Fix import of keepass file containing entries with undefined field
- Fix import should not throw an error if a resource or a folder cannot be created
- GITHUB-381 Fix quickaccess and custom fields. Lazy load resource types local storage on demand.
- PB-5154 Fix autofill and username field without type property defined

## [3.0.5] - 2021-02-03
### Fixed
- Fix keep session alive

## [3.0.4] - 2021-02-03
### Fixed
- Allow decryption with rsa signing key to work around old openpgpjs bug
- Pre sanitize data prior to collections/entity creation for the following operations: local storage update (resources, groups, users), user and avatar update, group update

## [3.0.3] - 2021-01-28
### Fixed
- Fix do not enforce validation for gpgkey with type property set to null
- Fix do not enforce validation for gpgkey with bits property set to null

## [3.0.2] - 2021-01-27
### Fixed
- Fix allow favorites with non conforming v1 data

## [3.0.1] - 2021-01-27
### Fixed
- Fix do not enforce validation error for tags with slug duplicates
- Fix do not enforce validation for avatar with empty user_id

## [3.0.0] - 2021-01-27
### Added
- Add a new login page and process redesign
- Add a new setup pages and process redesign
- Add a new recovery page and process redesign
- Add request passphrase prior to downloading the private key in user workspace
- Add the ability to sort by favorites
- Add the ability to encrypt description
- Add baseline support for other resource types

### Improved
- Migrate user workspace code previously served by server in the extension
- Migrate password workspace code previously served by server in the extension
- Migrate user profile code previously served by server in the extension
- Migrate the front-end code from CanJS to React
- Improve import export speed and misc compatibility improvements
- Improve server data validation in background page
- Misc update of dependencies
- Misc fixes of small styling issues in user and password workspace

### [2.13.8] - 2020-09-09
### Fixed
- PB-3519 Fix inherited permissions are not updated on share with nested folder and resources

### [2.13.7] - 2020-09-09
### Fixed
- Fix terminate any active session if user starts another account recovery / setup.
- Fix local storage / session should not be flushed when window is closed.

### Added
- Add codeql-analysis.yml for Github code analysis

### [2.13.6] - 2020-08-06
### Fixed
- PB-1416 As LU deleting a folder it should update the resources local storage
- PB-1417 As LU importing resources it should update the resources local storage

### Improved
- PB-1418 As LU deleting resources it should update the resources local storage after each delete (improve the feedback)

## [2.13.5] - 2020-07-22
### Fixed
- Fix autofill should work when input type is not lowercase
- Fix export to CSV should work if export does not include the resource associated folder

## [2.13.4] - 2020-06-23
### Added
- Increase the number of passwords the quickaccess suggests
- PB-1290 As a user I can choose which permission changes strategy to apply on a move
- PB-1326 Add support for signatures on share and import encryption operations

### Improvements
- PB-1348 Performance. Openpgpjs version bump v4.10.4

### Fixed
- Fix CSV import and export should support folders
- Fix progress bar should never be more than 100%
- GITHUB-238: As an administrator I should be able to install passbolt on a domain without a TLD.
- BUGZILLA-1372288: Hide extension URL from page when inserting iframe in a content script

## [2.13.3] - 2020-06-05
### Fixed
- Fix import folders batch issue

## [2.13.2] - 2020-06-03
### Fixed
- Fix resource URI can be null or a string
- Fix folder rename issue
- Fix export with large amount of resources issue
- Fix bulk move large amount of resources with the same folder parent issue
- Fix bulk share with large amount of resources

## [2.13.1] - 2020-05-29
### Fixed
- Fix direct export of resources/folders with a parent not included in export group
- Fix share folder/resource dialog should display item name
- Fix move shared folder cases where the permissions should not change
- Fix move shared resources cases where the permissions should not change
- Fix the response to the event 'passbolt.share.get-folders' should return an array
- Fix transform entity to dto before port.emit
- Fix linting

## [2.13.0] - 2020-05-28
### Added
- PB-658 Add folder create dialog and service
- PB-658 Add rename folder dialog
- PB-658 Add select and scroll to a folder after creation
- PB-658 Add store folder in local storage when logged in
- PB-658 Add create a resource or folder into a folder
- PB-658 Add support for creating resource with parent permissions
- PB-658 Add support for creating folder with parent permission
- PB-658 Add loading state to share dialog
- PB-658 Add folder share recursive
- PB-658 Add folders move in bulk (resources and folders)
- PB-658 Add support for multi resource move with permissions changes
- PB-658 Add folder delete dialog
- PB-658 Add cascading folders delete
- PB-1059 As a user I can import folders from a kdbx file
- PB-1059 As a user I can export resources and folders to a kdbx file

### Fixes
- Fix package-lock.json and rebuild extensions
- Fix share dialog autocomplete search, only the last API query result should be shown.
- Fix file format for export and file download by adding mime type.
- Fix linting
- Fix react app pagemod
- Fix React app to supports theme changes

### Improvements
- PB-799 Migrate share to react
- PB-799 Migrate resource edit dialog to react
- Add support for structured model entities
- Add npm version in package.json
- Do not display the domain the extension is configured for when triggering reconfig on another.
- Fix backward compatibility with v2.12
- PB-1089 Bump dependencies to higher versions
- Styleguide update

## [2.12.3] - 2020-05-18
### Fixed
- Add support to replace server OpenPGP public key when expired or replaced
- Fix error message on Firefox (insert script return value must be structured-clonable)
- Fix quickaccess create password field should be max 4096 characters in length

## [2.12.2] - 2020-04-14
### Fixed
- PB-1209 Bump jQuery to v3.5

## [2.12.1] - 2020-03-04
### Improved
- PB-1089 Bump dependencies to higher versions

## [2.12.0] - 2019-12-05
### Improved
- PB-649 The quickaccess passphrase field text and background colors should remain as default when the field is not focused.

### Fixed
- GROOVE-1610: Fix share operation should not fail silently
- GITHUB-84: Fix high server session timeout setting can lead to constant sessions check in legacy systems
- PB-879 Fix the setup security token validation bug
- PB-883 The quickaccess suggestion should filter passwords by uri protocol and port if provided.
- PB-766 Fix 414 server issues for features that work with batch of resources. Reduce the size of the batches.

## [2.11.3] - 2019-11-28
- GROOVE-1605 Revert to OpenPGP v2.6.2

## [2.11.2] - 2019-11-19
- PB-847 The quickaccess should suggest resources only if the current tab domain matches or is a subdomain of the resource uri.

## [2.11.1] - 2019-09-16
- PB-125 Sessions should be extended by default when user ask to remember passphrase.

## [2.11.0] - 2019-08-08
### Improved
- PB-242 Add local storage resources capabilities to manipulate the resources (add, delete, update)
- GITHUB-79: Improve autofill compatibility, trigger an input event instead a change event while filling forms
- PB-278 #GITHUB-61: Improve autofill compatibility, support Docker and AWS forms
- PB-432 Improve autofill compatibility, support reddit.com
- PB-433 Improve autofill compatibility, support Zoho CRM
- GITHUB-78: Improve autofill compatibility, fill only username if no password fill present
- PB-494 Improve autofill compatibility, ignore hidden fields
- PB-514 Improve autofill compatibility, fill iframe forms

### Fixed
- PB-544 Fix login passphrase remember me and quickaccess
- PB-533 Fix session expired management
- PB-515 Autofill should not fill if the url in the tab have changed between the time the user clicked on the button to fill and the data is sent to the page.

## [2.10.2] - 2019-07-10
- GITHUB-66: The browser extension doesn't build by default on unix system
- GITHUB-70: Fix autofill for self-hosted GitLab instance does not work
- GITHUB-71: Fix autofill for openstack horizon does not work
- PB-449 Fix image url when using non local image storage
- PB-449 Fix auth redirect when passbolt is installed in directory

### Improved
- Update the resources local storage when add, delete or update resources

## [2.10.1] - 2019-05-17
### Fixed
- Fix suggested section typo

## [2.10.0] - 2019-05-17
### Added
- PB-189 Quickaccess: As LU I can browse my passwords with the quickaccess using filters

### Fixed
- PB-40 Quickaccess: Don't hide not sanitized uri in the resource view screen

## [2.9.2] - 2019-04-25
### Fixed
- PB-227 Fix browser extension backward compatibility with API < v2.2.0

## [2.9.1] - 2019-04-25
### Fixed
- PB-3 Quickaccess: Fix resource create screen styleguide

## [2.9.0] - 2019-04-24
### Add
- PB-3 Quickaccess: As LU I can add a password via the quickaccess

## [2.8.3] - 2019-04-17
### Fixed
- GITHUB-58: Use consistent wording to define a gpg private key passphrase
- GITHUB-64: As AP when I am logging in with the quickaccess I should see a relevant error message in any cases
- GITHUB-63: Fix password generation mask
- PB-177 Upgrade Jquery to v3.4
- PB-178 Drop fetch polyfill for chrome
- PB-153 Fix dictionary test result when pwnedpassword is unavailable
- GITHUB-14: As LU I should be able to navigate into the passphrase popup with the keyboard

## [2.8.2] - 2019-04-02
### Fixed
- Fix broken event. Exception has to be serialized before emiting them from addon to content code
- Fix typo in README

## [2.8.1] - 2019-04-02
### Fixed
- PB-97 Fix - As a user I cannot login using the QuickAccess if i'm using MFA

## [2.8.0] - 2019-04-01
### Add
- PB-3 Quickaccess: Simplified app to access passwords from the browser extension

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

[Unreleased]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.6.0...HEAD
[5.6.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.5.1...v5.6.0
[5.5.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.5.0...v5.5.1
[5.5.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.4.1...v5.5.0
[5.4.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.4.0...v5.4.1
[5.4.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.3.3...v5.4.0
[5.3.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.3.0...v5.3.2
[5.3.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.2.0...v5.3.0
[5.2.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.1.1...v5.2.0
[5.1.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.1.0...v5.1.1
[5.1.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.0.1...v5.1.0
[5.0.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.12.0...v5.0.0
[4.12.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.11.0...v4.12.0
[4.11.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.10.2...v4.11.0
[4.10.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.10.0...v4.10.2
[4.10.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.9.4...v4.10.0
[4.9.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.9.3...v4.9.4
[4.9.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.9.2...v4.9.3
[4.9.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.9.1...4.9.2
[4.9.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.9.0...4.9.1
[4.9.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.8.2...4.9.0
[4.8.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.8.1...4.8.2
[4.8.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.8.0...4.8.1
[4.8.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.8...4.8.0
[4.7.8]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.7...v4.7.8
[4.7.7]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.6...v4.7.7
[4.7.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.5...v4.7.6
[4.7.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.4...v4.7.5
[4.7.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.3...v4.7.4
[4.7.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.1...v4.7.3
[4.7.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.7.0...v4.7.1
[4.7.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.6.2...v4.7.0
[4.6.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.6.0...v4.6.2
[4.6.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.5.2...v4.6.0
[4.5.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.5.1...v.4.5.2
[4.5.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.5.0...v.4.5.1
[4.5.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.4.2...v.4.5.0
[4.4.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.4.0...v.4.4.2
[4.4.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.3.1...v.4.4.0
[4.3.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.3.0...v.4.3.1
[4.3.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.2.0...v.4.3.0
[4.2.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.1.2...v.4.2.0
[4.1.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.1.0...v4.1.2
[4.1.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.4...v4.1.0
[4.0.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.3...v4.0.4
[4.0.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.1...v4.0.3
[4.0.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.12.1...v4.0.0
[3.12.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.12.0...v3.12.1
[3.12.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.11.2...v3.12.0
[3.11.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.11.0...v3.11.2
[3.11.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.10.0...v3.11.0
[3.10.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.9.2...v3.10.0
[3.9.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.9.0...v3.9.2
[3.9.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.8.0...v3.9.0
[3.8.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.3...v3.8.0
[3.7.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.2...v3.7.3
[3.7.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.1...v3.7.2
[3.7.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.7.0...v3.7.1
[3.7.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.6.2...v3.7.0
[3.6.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.6.1...v3.6.2
[3.6.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.6.0...v3.6.1
[3.6.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.5.2...v3.6.0
[3.5.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.5.1...v3.5.2
[3.5.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.3.1...v3.4.0
[3.3.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.2.3...v3.3.0
[3.2.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.2.2...v3.2.3
[3.2.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.1.0...v3.2.1
[3.1.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.7...v3.1.0
[3.0.7]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.6...v3.0.7
[3.0.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.5...v3.0.6
[3.0.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.4...v3.0.5
[3.0.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.8...v3.0.0
[2.13.8]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.7...v2.13.8
[2.13.7]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.6...v2.13.7
[2.13.6]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.5...v2.13.6
[2.13.5]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.4...v2.13.5
[2.13.4]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.3...v2.13.4
[2.13.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.2...v2.13.3
[2.13.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.1...v2.13.2
[2.13.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.13.0...v2.13.1
[2.13.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.12.1...v2.13.0
[2.12.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.12.0...v2.12.1
[2.12.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.3...v2.12.0
[2.11.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.2...v2.11.3
[2.11.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.1...v2.11.2
[2.11.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.11.0...v2.11.1
[2.11.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.10.1...v2.11.0
[2.10.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.10.0...v2.10.1
[2.10.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.9.2...v2.10.0
[2.9.2]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.9.1...v2.9.2
[2.9.1]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.9.0...v2.9.1
[2.9.0]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.8.3...v2.9.0
[2.8.3]: https://github.com/passbolt/passbolt_browser_extension/compare/v2.8.2...v2.8.3
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
