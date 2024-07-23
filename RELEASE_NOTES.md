Song: https://www.youtube.com/watch?v=zUzd9KyIDrM

Passbolt v4.9.0 is a significant update that addresses long-standing user requests, enhances performance, and adds a new administrative tool to manage your LDAP/AD integration with confidence.

In this release, a highly requested feature was introduced where the passwords workspace now displays the location of resources. This addition provides extra meta information to help users efficiently identify passwords and where they are located. Additionally, the search functionality has been improved to use resource locations as meta information. Users can now retrieve a resource by using the names of its parent folders, which can greatly simplify the process of finding passwords depending on your organisation's classification system.

The team has also focused on various performance improvements to meet the growing needs of organisations managing an increasing number of passwords. These enhancements also prepare the way for the upcoming v5.0.0, which will support more content types and include an additional encryption layer. Both the API and the browser extension have been optimised, resulting in a 50% improvement in retrieving and treating collections of resources, according to our benchmarks.

Moreover, administrators managing their users with LDAP will benefit from a new feature designed to protect against unforeseen deletion of users. This new option allows administrators to choose a suspend strategy, which locks a user's access to Passbolt without deleting any material, providing an extra layer of security.

We extend our gratitude to the community for their feedback and assistance in testing this release. We hope these updates enhance your experience with Passbolt and we look forward to hearing from you.

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
