Release song: https://www.youtube.com/watch?v=ubWL8VAPoYw

Passbolt 5.3 adds custom fields, one of the five most‑requested features from the community. Built on top of encrypted‑metadata introduced earlier this year, custom fields let users attach additional key‑value pairs to a resource or as a standalone one. Typical use‑cases include centralising CI/CD job variables and storing environment‑specific configuration values that need more structure than a general note.

Custom fields rely on encrypted metadata, therefore the feature is still in beta and is not yet available on Passbolt Cloud. A step‑by‑step guide on how to enable the encrypted metadata  on a self‑hosted instance will be available in a blog post that will be published soon. The encrypted‑metadata feature is scheduled to be marked as stable in Passbolt 5.4, planned for August 2025.

As part of our continuous performance work, this release concentrates on folder browsing. Loading folders and their resources is now faster and reduces the load on API and client, improving day-to-day usability for organizations having thousands of credentials under management.

Several bugs reported by the community have also been fixed. As always, thank you to everyone who took the time to file issues, test patches and suggest improvements. For a complete list of changes, consult the changelog.

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
