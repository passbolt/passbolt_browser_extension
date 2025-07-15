Release song: https://www.youtube.com/watch?v=-GxmblM_jss

Passbolt v5.3.2 is a security release designed to strengthen the security posture of your organization. It introduces a clipboard flushing feature, adds safeguards around SSO settings, and addresses issues related to encrypted metadata.

The new clipboard flush timer lets you copy secrets just long enough to use them; clipboard data is automatically cleared when the countdown (30s) expires, significantly reducing the risk of accidental exposure or leaks from forgotten clipboard content.

Additionally, SSO admin-settings edit endpoints of self-hosted instances can now be locked, reducing potential exposure to scans if an administrator account is compromised. You can verify if this protection is active, and get instructions on how to set it up, by running the health check via the server command line.

This update also resolves several encrypted metadata issues, moving the feature closer to general availability. Organizations can now enable encrypted metadata even if users have imported their own more complex keys (e.g. keys that were set to expire at some point), streamlining adoption for advanced users. Admin changes are smoother too: if the original metadata-enabling administrator leaves, newly invited users will still receive the metadata key automatically, removing the need for manual distribution. Lastly, users who owned shared resources using the new encrypted metadata format can now be deleted without issue, as ownership transfer is now handled correctly during the deletion process.

A big thank you to all testers who helped refine these features. If you’re new to any of them, we welcome your feedback on the community forum or through your usual support channels!

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