Song: https://www.youtube.com/watch?v=yf1f8zNvR1I

“Even the longest day has its end” goes the old Irish proverb, and here we are at long last announcing the Passbolt 5.x series. This first release v5.0 ships with a complete redesign of the application’s interface, which had remained largely unchanged since Passbolt’s early days and was limiting the addition of new capabilities. The new version offers a more spacious layout that provides room for meaningful information and addresses long-standing ergonomic issues. If you want to know more, check out what changed in this [Passbolt 5, UI Redesign](https://community.passbolt.com/t/passbolt-5-ui-redesign/12717) community post. 

Passbolt v5.0 lays the groundwork for the v5.x series, which will expand the software’s capabilities to handle more sensitive data types that the community has requested, such as key-value pairs, SSH keys, and certificates. The blog article about the passbolt v5.0 release is coming soon.

Of course, with each major version come the inevitable breaking changes, which we strive to minimize as much as possible. With this release, the minimum server requirement has changed to PHP 8.2 or greater, so be sure to check out our latest blog article on [how to upgrade to PHP 8.2](https://www.passbolt.com/blog/preparing-for-passbolt-v5-php-8-2-requirement). Additionally this is a perfect moment to back up your server data and prepare for the unexpected. 

Thank you to the community for all your feedback, testing, and support in making this milestone possible. We hope you’ll enjoy what Passbolt v5.0 has to offer and look forward to hearing from you.


### Added
PB-33425 Allow users to reset resource grid columns to default factory settings through the columns settings dropdown
PB-35232 Add a resource grid filter to display only private resources
PB-37332 Rename encrypted description to note and clearly differentiate between the metadata description and the secret note
PB-37620 Allow users to resize and reorder the users grid
PB-37638 Add a details sidebar for multiple grid resource selections to allow users to review their selection
PB-38938 Redirect administrator to a home page instead of the first available settings page
PB-38940 Organize the administration menu into meaningful sections
PB-39415 Redesign the application
PB-39464 Introduce unified and modular resource creation and editing dialogs to support upcoming resource types
PB-40150 Display a default resource icon in the grid

### Fixed
PB-28280 Display the complete resource path in sidebar details
PB-33618 Disable the "select all" dropdown in the users grid until bulk operations are supported
PB-39994 Display a pending changes banner after modifying administration email notification settings
PB-39995 Ease identification of generated organization recovery key file name by including the GPG key identifier
PB-40268 Display a pending changes banner after modifying administration internationalization settings
PB-40270 Display a pending changes banner after modifying administration email server settings
PB-40271 Display a pending changes banner after modifying administration RBAC settings
PB-40272 Display a pending changes banner after modifying administration users directory settings
PB-40273 Display a pending changes banner after modifying administration SSO settings
PB-40669 Display loading feedback in the folder navigation tree during folder loading
PB-40186 WP6-7.5 Validate the object_type property of v5 secrets to mitigate unwanted content decryption attacks
PB-40576 Reposition the expiry item in resources grid column settings to reflect its lower display priority in the grid
PB-41275 Display the complete folder path in sidebar details

### Maintenance
PB-40117 Upgrade browser extensions repositories to node 22
PB-40687 Upgrade vulnerable library babel and relative
PB-40688 Upgrade vulnerable library i18next-parser and relative
