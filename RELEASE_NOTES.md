Release song: https://www.youtube.com/watch?v=fMnh5Tn8aeM

Passbolt 5.7.0 introduces secret history, a highly demanded feature that gives users visibility and control over previous versions of their secrets. This release also includes several usability improvements requested and bug fixes reported by the community.

## Secret history

It is now possible to access previous revisions of a secret directly from Passbolt.

Secret history helps reduce the impact of human error and offers a safer way to manage evolving secrets. For instance, this enables users to undo an accidental update on the spot. Note that the feature is disabled by default and requires an administrator to enable it from the administration workspace.

## User and group workspace improvements

A new “Remove from group” action has been added to the user and group workspaces. This addition eliminates the confusion between permanently deleting a user and simply removing them from a specific group.

Moreover, administrators can now instantly filter users that require attention via the “Attention Required” filter in the workspace. For instance: identifying users with a pending account recovery request to review, or missing metadata keys.

## Import report

The application now displays a summary dialog after an import, offering accurate and actionable information. The report precisely categorises alerts into successes, warnings and errors, providing end users with additional logs.

## Miscellaneous improvements
As usual this release is packed with improvements and bug fixes reported by the community. Notably, the reliability of autofill has been improved across a wider range of websites. If you find that autofill does not work on a particular website, feel free to open a bug report including the website details to help us identify the custom selector. For more, check out the changelog below.

Many thanks to everyone who provided feedback, reported issues, and helped refine these new features.

### Added
- PB-17712 Focus should be put in the passphrase field when importing keepass file protected by passphrase
- PB-33599 Allow users to access previous revisions of a resource’s secret
- PB-33599 Allow administrators to configure how many secret revisions are retained
- PB-44420 Allow administrators to download the Users Directory sync report for follow-up actions
- PB-44434 As an administrator I can see encrypted metadata healthchecks from the administration workspace
- PB-45249 Add “Attention required” filter in the “Users & groups” workspace to filter users by attention required
- PB-45842 Add link to SCIM admin guide in the product
- PB-46427 Add remove from group button in User & Group Workspace page

### Fixed
- PB-18497 Add loading spinner when submitting imported GPG key during account extension association (activation/recover)
- PB-36183 Display UTC date in tooltip for relative “X days ago” timestamps
- PB-42032 Fix: update passphrase help section link goes to the former help site
- PB-43950 Add padding between fields and their description on the Users Directory administration page
- PB-44603 Help link in administration internationalization page should target the contribute page of the help site
- PB-44949 GITHUB#240 Inform menu crash on suggested resource icon
- PB-45263 Enforce password expiry on imported resources when a password policy requires it
- PB-45588 Extend metadata description textarea in resource creation dialog to use full available height
- PB-45699 User without groups is not display correctly on the right sidebar
- PB-45723 The in-form CTA is not visible since v5.5 for some web application
- PB-45797 Fix typos in BExt
- PB-45917 I can autofill my username in the login form of cryptpad in French
- PB-45992 Keep selection of resources when collapsing the Workspace section
- PB-46013 Empty Full Report textarea displayed in Users Directory dialogs when there are no resources to synchronize
- PB-46065 Prevent re-encryption of metadata with personal user key when a resource is shared with a group
- PB-46118 Import unexpected error handling on import
- PB-46191 Update UserSettings validateDomain to make sure the issue cannot be exploited
- PB-46372 As LU, I should see the content share dialog within the boundaries of the dialog
- PB-46385 Fix auto-fill on OVH with custom selector field on username

### Maintenance
- PB-30373 Remove unused event passbolt.app-bootstrap.navigate-to-logout
- PB-45099 Update: Regular expression on private key metadata validation
- PB-45100 Update: Regular expression on GPG Message validation
- PB-45585 Fix SCIM styleguide related unit tests error
- PB-45589 Refactor resource favorite capability to use FavoriteServiceWorkerService instead of direct port requests
- PB-45590 Migrate favorite logic from FavoriteModel to FavoriteResourceService and remove legacy model
- PB-45591 Route passbolt.favorite.add/delete events through controllers instead of calling services directly
- PB-45593 Add test coverage for FavoriteService API and rename class to align with Passbolt standard
- PB-45678 Upgrade ESLint dependencies across both repositories
- PB-45835 Migrate group (partially) related code to new architecture
- PB-45894 Rename leftSideBar and rightSideBar classes to respect naming convention
- PB-45963 Replace find-all with find-my-groups Port Requests
- PB-45965 Rename groupService to groupApiService
- PB-46127 Update i18next dependency
- PB-46190 Update themeEntity to remove preview unused field
