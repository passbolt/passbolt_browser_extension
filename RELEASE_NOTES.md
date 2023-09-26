Release song: https://youtu.be/s88r_q7oufE

The latest version is here – take a look at what’s new in 4.3.

One enhancement is improved portability of TOTP (Time Based One Time Password). TOTP can now be conveniently viewed across both the web and mobile applications. Although the creation of TOTP remains mobile-centric, version 4.3 provides convenient access to reading and retrieving TOTP content in the browser, resulting in greater usability.

Improvements have also been made to grid customisation. Any changes made to the grid are now persistent, meaning your tailored experience is saved from session to session. And to make the new TOTP portability even more accessible, an option has been added to display a column for your TOTP content.

Admins of the PRO can now manage passphrase policies alongside their password policies. These policies include: setting minimal entropy and managing access to external tools for monitoring if a passphrase has been compromised.

Other updates include improvements to SQL query performance (retrieving resource tags and system tags), restricting LDAP-related settings, some bug fixes, and a number of performance improvements.

Thank you for choosing passbolt and for your continued support.

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