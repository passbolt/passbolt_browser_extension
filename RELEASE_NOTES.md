Release song: https://youtu.be/6JNwqRF32ZI

Passbolt version 4.4.2 has been released, primarily as a maintenance update to address specific issues reported by users. This version includes two main fixes.

The first fix concerns the Time-based One-Time Password (TOTP) feature. In the previous version, there was an issue where users could accidentally delete the TOTP secret for a resource while editing its description from the sidebar. This has been corrected in the latest update.

The second fix improves the performance of the application, specifically when users are retrieving their resources. This update is part of an ongoing effort to enhance the overall performance of the application, with further improvements planned for future releases.

We extend our gratitude to the community member who reported [this issue](https://github.com/passbolt/passbolt_docker/issues/219).

## [4.4.2] - 2023-11-06
### Fixed
- PB-28880 Fix resource with TOTP when description is updated from information panel
