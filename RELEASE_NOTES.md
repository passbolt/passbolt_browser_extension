Release song: https://www.youtube.com/watch?v=F5uXomY94w8

Passbolt 5.8.0 introduces dynamic role management, allowing organizations to define additional roles that better align with internal policies, compliance requirements, and operational needs. This release also adds drag & drop user assignment to groups, simplifying day-to-day user and group management.

**Warning**: Ensure that all users have updated their browser extension to at least version 5.8 before assigning new roles. Otherwise, they will not be able to connect to Passbolt.

## Dynamic role management

As was already the case with the default User role, Passbolt allows administrators to restrict what users can do by limiting access to specific capabilities. With version 5.8, this model is extended beyond the default Admin and User roles, making it possible to create additional roles and assign them to users for more granular control.Default roles cannot be modified or deleted, while newly created roles (up to two per instance)  can copy permissions from existing roles and can be renamed or deleted.

Dynamic roles also enable the delegation of administrative responsibilities. Rather than granting full administrative access, administrators can now assign selected capabilities to custom roles and distribute operational tasks across multiple users. Initial support covers group creation, as well as handling account recovery requests in Passbolt Pro.

At this stage, dynamic role management comes with a defined scope and set of constraints.

- The default Admin and User roles keep fixed names and cannot be renamed or deleted.
- As before, the User role can be restricted, but it cannot be assigned delegated administrative responsibilities.
- The Admin role, by contrast, always retains access to all capabilities and cannot be restricted.
- Custom roles are currently limited to two per instance and support a first set of administrative capabilities.

This scope will be expanded progressively as additional needs and use cases are identified by the community.

## Drag & drop users to groups

Managing group membership often requires repetitive actions when working with large teams or frequently changing group structures. With Passbolt 5.8, administrators can now add users to a group by dragging them directly onto it from the Users & Groups workspace. This removes the need to open and edit each group individually and makes day-to-day group management faster and more fluid.

## Miscellaneous improvements

As usual, this release includes fixes and smaller improvements intended to improve the overall experience. For the full list of changes, please refer to the changelog.

Many thanks to everyone who provided feedback and helped refine these features.

### Added
- PB-46646 Reduce accidental destructive actions by moving Delete user and Disable MFA into a More menu in Users and groups
- PB-28298 Add users to groups by dragging and dropping
- PB-47198 Add exception to allow users to autofill workbench.cisecurity.org
- PB-46997 DR - WP1.1 Update RbacsCollection to EntityV2Collection and add new methods
- PB-46999 DR - WP1.2 Update RoleEntity schema and add new methods
- PB-47000 DR - WP1.3 Update RolesCollection to EntityV2Collection and add new methods
- PB-47002 DR - WP2.1 Update of RoleService to a RoleApiService
- PB-47003 DR - WP2.2 Update of RoleModel to a RoleService
- PB-47003 DR - WP2.3 Update of RbacService to a RbacApiService
- PB-47014 DR - WP2.4 Update of RbacModel to a RbacService
- PB-47015 DR - WP3.1 Create the FindAllRolesController and update the event
- PB-47015 DR - WP3.1 Create the FindAllRolesController and update the event
- PB-47017 DR - WP3.2 Update the FindMeController into a FindMeRbacController
- PB-47088 DR - WP3.3 Create the FindAndUpdateRolesLocalStorageController
- PB-47018 DR - WP4.1 Create RoleServiceWorkerService to get the roles
- PB-47019 DR - WP4.2 Create RbacServiceWorkerService to get the RBAC permissions of a signed-in user
- PB-47021 DR - WP4.3 Add the method canRoleUseAction in CanUseService
- PB-47089 DR - WP4.4 Add a method to find and update roles in local storage
- PB-47022 DR - WP5.1 Add the method canIUseAction in RbacContext
- PB-47023 DR - WP5.2 Verify the signed-in user's RBAC privileges before allowing access to the FilterUsersByGroup functionality
- PB-47024 DR - WP5.3 Verify the signed-in user's RBAC privileges before allowing access to the DisplayUserWorkspaceMainActions functionality

- PB-47023 DR - WP5.4 Verify the signed-in user's RBAC privileges before allowing access to the DisplayUserWorkspaceActions functionality
- PB-47036 DR - WP5.5 Verify the signed-in user's RBAC privileges before allowing access to the DisplayUsersWorkspaceFilterBar functionality
- PB-47037 DR - WP5.6 Verify the signed-in user's RBAC privileges before allowing access to the DisplayUsers functionality
- PB-47039 DR - WP5.7 Update CreateUser to select role in a dropdown component
- PB-47042 DR - WP5.8 Update EditUser to select role in a dropdown component
- PB-47027 DR - WP5.9 Create the component CreateRoleDialog
- PB-47028 DR - WP5.10 Create the component EditRoleDialog
- PB-47029 DR - WP5.11 Create the component DeleteRoleDialog
- PB-47030 DR - WP5.12 Update the style of DisplayRbacAdministration to match current design
- PB-47031 DR - WP5.13 Add create role in DisplayRbacAdministration
- PB-47032 DR - WP5.14 Display all roles in DisplayRbacAdministration
- PB-47033 DR - WP5.15 Add menu item to update the name of new role
- PB-47016 DR - WP5.16 Add menu item to delete new role
- PB-47090 DR - WP5.17 Update ManageAccountRecoveryUserSettings to use roles from context
- PB-47091 DR - WP5.18 Update ReviewAccountRecoveryRequest to use roles from context
- PB-47092 DR - WP5.19 Update DisplayScimSettingsAdministration to use roles from context
- PB-47093 DR - WP5.20 Update DisplayUserDetailsInformation to use roles from context
- PB-47094 DR - WP5.21 Update DisplayAccountRecoveryUserSettings to use roles from context
- PB-47095 DR - WP5.22 Update UserWorkspaceContext to use roles from context
- PB-47096 DR - WP5.23 Create the RoleContextProvider and add it on ExtAppContext
- PB-47214 DR - WP5.24 Update the RoleEntity to avoid name bypass
- PB-47215 DR - WP5.25 Update RolesCollection to filter out Guest role
- PB-47216 DR - WP5.26 Update FindRolesService to filter out guest role
- PB-47231 DR - WP5.27 Create component DeleteRoleNotAllowed

### Fixed
- PB-46180 Incorrect folder name encoding in sharing progress dialog
- PB-46612 Add missing border radius to secret history selected revision
- PB-45978 Resize bar continues dragging after mouse release
- PB-46905 Display the "Remove from group" action button to group managers
- PB-46627 Fix missing space in the “Advanced settings” of the password generator tabs between the last component and the CTA
- PB-46930 Secret history review should display an unknown user when creator does not exists
- PB-47298 KDBX not set expiry if never is set

### Maintenance
- PB-46636 Remove eslint v8 compatibility
- PB-46890 Small upgrade for js-yaml (Medium)
- PB-46831 Increase coverage of passbolt-styleguide DisplayUserTheme to 100%, and verify no change occurs when the user selects the already-selected theme
- PB-29338 React 18: upgrade changes with Legacy DOM renderer
- PB-47057 React 18: Remove unused dev dependency jest-dom
- PB-47069 DisplayResourceDetailsInformation Test Cases for Expired Passwords
- PB-46831 Increase coverage of passbolt-styleguide DisplayUserTheme to 100%
- PB-47069 DisplayResourceDetailsInformation Test Cases for Expired Passwords
- PB-47311 Major upgrade for serialize-javascript (Medium)
- PB-46832 Increase coverage of ThemeEntity
- PB-46833 Increase coverage of AccountSettingsService
- PB-46834 Increase coverage of ThemeModel
- PB-47011 ESLINT - WP1.1 Install phantom dependencies