Passbolt 5.11.1 fixes an issue where the browser extension could become unresponsive after navigating within the application or signing out on Chromium 147+. This was caused by a change in how Chromium handles page caching (BFCache). A fix is included in both the API and the browser extension. Users who cannot update the API immediately will still benefit from a partial fix in the browser extension covering the sign out scenario.

### Fixed
-  PB-50644 - Fix browser extension port messaging failure after logout caused by Chrome 147 BFCache changes
