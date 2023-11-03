Release song: https://www.youtube.com/watch?v=6Ejga4kJUts

Version 4.4 (Release Candidate) of Passbolt is now available, packed full of improvements and new functionalities.

With this release, users are able to manage TOTPs directly from the browser, providing an extended TOTP experience across all their devices. They can now be created, deleted, organised and shared with others just like any other resource type.

Another highlight of this release, administrators now have the ability to suspend/unsuspend users. This new feature will offer administrators with more control over access management of their instance. By example, they will be able to prevent access to the passbolt instance for users in temporary leave, therefore enforce company policies.

Admins of the PRO have an additional option for SSO: a generic OAuth 2.0 provider is now available, expanding your authentication options and providing even more versatility.

And that's not all – a number of fixes and enhancements have been implemented to improve user experience. Among them, notification emails are now aggregated in certain cases, including limiting emails when a user imports a large amount of passwords.

Upgrade to version 4.4 to take advantage of these improvements. Thank you for using and supporting passbolt!

## [4.4.0-rc.0] - 2023-11-03
## Browser extension
### Added
- PB-25204 As a signed-in user I can create a standalone TOTP
- PB-25206 As a signed-in user I can add a TOTP to an existing password resource
- PB-25210 As a signed-in user I can edit a standalone TOTP
- PB-25224 As a signed-in user I can copy a TOTP
- PB-26088 As a signed-in user I can see standalone TOTP in the quickaccess
- PB-27600 As an administrator I want to suspend or unsuspend a user
- PB-27601 As a sign in user I should see who is suspended in the ui
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
