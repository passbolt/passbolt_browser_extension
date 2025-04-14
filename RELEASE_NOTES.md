Song: https://www.youtube.com/watch?v=vdunmVWTxMI

Passbolt v5.0.1 is a maintenance release addressing issues introduced in the major v5.0.0 update, specifically a regression related to the migration of encrypted notes into cleartext descriptions. This behavior has been reverted to align with the v4 approach, as it could reduce the confidentiality of existing resources. Looking ahead, v5.2 will introduce support for having both a secure note and a searchable description, hang tight, we’re almost there.

As always, thank you to the community for your feedback.

### Fixed
- PB-41438 Prevent users from migrating encrypted notes to cleartext descriptions when editing a resource
- PB-41540 Display the v5 redesign skeleton while the application is loading
- PB-41541 Display an ellipsis for long names and usernames on the user badge
