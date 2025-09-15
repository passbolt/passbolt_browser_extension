Release song: https://youtu.be/n42zzaot8dQ

Passbolt 5.5.1 resolves an issue introduced in the previous version that affected the activation of encrypted metadata and new resource types during the first admin setup. The issue displayed an error message and blocked the setup flow, although the user could restore the expected configuration manually via the administration workspace later (as described in this [topic](https://community.passbolt.com/t/issue-with-new-installations-with-passbolt-extension-v5-5-0/13660)).

With this fix, the first admin setup process now behaves as expected and completes the configuration without errors.

### Fixed
- PB-45290 Fix password missing crash on metadata activation in first admin setup
