Song: https://youtu.be/BGHlZwMYO9g?si=LhUEanqg7q9j-nxv

Passbolt v4.9.3 Release Candidate is a maintenance update that addresses issues related to the deletion of users. Specifically, it fixes problems that occurred when trying to delete a user who is either the sole owner of resources or the sole group manager. Under these conditions, the deletion process did not work as expected, and this update resolves those issues.

Thank you to the community for reporting this issue.

## [4.9.6] - 2024-09-03
### Fixed
- PB-35185 Administrator should be able to delete users who are sole owners of resources or sole group manager
