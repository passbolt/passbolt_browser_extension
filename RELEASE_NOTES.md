Release song: https://www.youtube.com/watch?v=bu50DtPF1Ac

Passbolt 5.6.0 is a feature release that brings standalone notes, shared metadata key rotation and resizable sidebars. This release comes as usual with security reinforcement by updating 3rd party libraries and other bug fixes.

## Standalone notes

This new resource type allows user to create notes without any other attached elements (i.e. password). Import and export are updated to take into account this new resource type.
Thus, imported resource with only a description will be set as standalone note.

## Shared metadata key rotation

Now shared metadata key can be rotated. This marks one of the final steps in the metadata encryption requirements. Administrators can, at anytime, rotate this key through the organisation settings while maintaining the Passbolt instance in a working state.

## Resiable sidebars

On the resource workspance and the user workspace, the 2 sidebars are now resisable. This brings more customisation for users and helps readability (i.e for long folder names or folders in deep folder tree).
After resizing a sidebar, a simple double click on the handle brings the sidebar to its default width.

## Miscellaneous

Different bug fixes and maintainence update are into the party:
- export of account kit is compatible with bigger private keys
- group membership update process is updated to reduce request size and avoid some size limitations
- folders name sort includes now natural number counting

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
