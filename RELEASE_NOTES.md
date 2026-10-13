Release song - https://www.youtube.com/watch?v=gI6fQ2IXMjE

# v5.16.2
## Move to Manifest V3 without disrupting Edge access

Passbolt’s Microsoft Edge extension now uses Manifest V3, helping organisations maintain uninterrupted credentials access as Microsoft phases out Manifest V2. 
Available in both Passbolt Community Edition and Pro Edition, the updated extension is built from the same codebase and manifest as Chrome MV3, keeping maintenance and fixes consistent across Chromium-based browsers.
Once Manifest V3 extension is approved for publication in the Microsoft Edge Add-ons store, the current non-compliance notice on the Passbolt listing will be removed, restoring its compliant store status.
No action is required from users as the update installs automatically, with existing accounts and settings preserved.

## Changelogs
## Added
- PB-55198 - EDGE - WP1.1 - Create emitOnWorker in workerService
- PB-55199 - EDGE - WP1.2 - Improve postLogoutService
- PB-55200 - EDGE - WP1.3 - Update postLoginService
- PB-55201 - EDGE - WP1.4 - Update ResourceCreatePage to handle Edge new tab page
