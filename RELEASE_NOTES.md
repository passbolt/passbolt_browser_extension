Release song: https://www.youtube.com/watch?v=QNa5o85Q-FE

Passbolt 5.9 RC is a maintenance release that adds the migration work of its UI framework for authentication-related applications. The first applications have moved, and this is part of a larger foundation effort expected to improve stability and long-term performance as more areas are migrated.

This release also includes additional fixes and improvements.

Check out the changelogs to learn more.

Thanks to the community members and teams who reported issues and helped validate fixes

### Fixed
- PB-43511 Display the "Migrate metadata" admin home page card icon with a 2px stroke width

### Maintenance
- PB-6069 Moving folders should not send unnecessary data to the API
- PB-44598 Replaced links from old help site with new docs links
- PB-46314 REACT18 Implement migration for Login Content Script
- PB-46361 REACT18 Implement migration for Login WAR file
- PB-46364 REACT18 Implement migration for Account Recovery
- PB-46664 First browser extension build has missing dist folder for browsers that cause issue
- PB-46665 Browser extension build should add chrome-mv3 in the global build command
- PB-47012 Add prettier to replace ESLINT styling rules
- PB-47073 Add SubscriptionKeyServiceWorkerService
- PB-47074 Rename subscriptionService to subscriptionApiService
- PB-47075 Migrate subscription key finder business logic
- PB-47100 Move find controller logic from SubscriptionController
- PB-47101 Migrate subscription logic from SubscriptionController to UpdateSubscriptionKeyController
- PB-47103 Remove grunt-contrib-clean dependency
- PB-47351 Chrome Bext is killed and not restarted on upgrade
- PB-47606 Add eslint-plugin-security
- PB-47607 Add eslint-plugin-n
- PB-47608 Add eslint-plugin-regexp
- PB-47609 Add eslint-plugin-promise
- PB-47621 Move SubscriptionEntity from browser extension to styleguide
- PB-47692 Fix prettier warning
- PB-47707 REACT18 Implement migration for Recover
- PB-47711 REACT18 Implement migration for Setup
- PB-47719 REACT18 Implement migration for Inform Menu
- PB-47783 REACT18 Implement migration for API Triage Feedback
- PB-47785 REACT18 Implement migration for Setup/Recover Account recovery
- PB-47867 Align dynamic roles to work with the windows application
- PB-47902 Add a ResponseEntity factory for the unit tests
- PB-47905 Refactor test mock for subscription refactoring
- PB-47931 Cleanup ResourceModel
- PB-47955 Update overlay calculation detection on inform
- PB-48014 Remove dead code from Google Closure library
- PB-48038 Small upgrade for validator

### Security
- PB-46637 Prevent in-form menu to be displayed when overlaid by other components