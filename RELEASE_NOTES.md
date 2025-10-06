Release song: https://www.youtube.com/watch?v=bu50DtPF1Ac

Passbolt 5.6.0 introduces standalone notes, shared metadata key rotation, and resizable sidebars. As usual, this version also brings important security hardening through dependency updates as well as a series of bug fixes and maintenance improvements.

## Standalone notes

It is now possible to create notes as a standalone resource type, without attaching them to credentials or other elements. Import and export processes have been updated to recognize and support this new type. Any imported resources that contain only a description will now be created as standalone notes.

## Shared metadata key rotation

Administrators can now rotate the shared metadata key at any time from the organization settings. This improvement marks one of the final steps in meeting metadata encryption requirements. The rotation process can be performed while the instance remains operational, so availability is not disrupted.

## Resizable sidebars

Both main workspace and Users & Groups workspace now feature sidebars that can be resized. This allows users to improve readability when working with long folder names or deeply nested folder structures. After resizing, a double-click on the sidebar handle resets it to its default width.

## Miscellaneous Improvements

The export of account kits is now compatible with larger private keys. The group membership update process has been optimized to reduce request payload size and to avoid certain size limitations. Sorting of folder names has also been improved with natural number ordering, meaning for example that “folder2” now correctly appears before “folder10.”

Many thanks to everyone who shared feedback, reported issues, and helped refine these features.

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
- PB-45733 Fix quickaccess resource creation with encrypted metadata

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
