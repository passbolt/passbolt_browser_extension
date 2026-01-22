Release song: https://www.youtube.com/watch?v=QNa5o85Q-FE

Passbolt 5.9 is designed to keep upgrades predictable and everyday use reliable. It expands runtime compatibility with PHP 8.5, makes environment risks easier to spot earlier through health checks, and closes a couple of security gaps that could otherwise be used to probe accounts or mislead users during navigation.

**Warning**: If you run MariaDB 10.3 or 10.5, or MySQL 5, pay particular attention to the environment section below. Support for these versions is planned to stop in January 2027, and this release starts flagging them proactively so you can schedule upgrades before they become urgent.

### Environment support and deprecation signals you can act on early

Passbolt 5.9 adds PHP 8.5 support, helping administrators and platform teams validate upcoming runtime upgrades in advance. Moreover, while PHP 8.2 is still supported until 2027, it has entered security maintenance, and administrators should plan its upgrade this year.

At the same time, this release improves environment health checks to surface database versions that have reached end of life. MariaDB 10.3 and 10.5, and MySQL 5, are now flagged as deprecated allowing administrators to identify risky deployments during routine maintenance rather than responding under time pressure. These notices are explicitly tied to a planned end of support in January 2027, giving teams  a clear runway to align database upgrades with regular change windows and internal upgrade policies.

### Safer account recovery responses to reduce email enumeration risk

Account recovery endpoints can unintentionally reveal whether a user exists, which makes targeted attacks easier. In Passbolt 5.9, the recover endpoint no longer leaks information when a user does not exist in the database, reducing the signal attackers rely on for email or username enumeration.

### Stronger protection against clickjacking and deceptive overlays

Clickjacking and overlay techniques aim to trick users into clicking something different from what they believe they are interacting with. Passbolt 5.9 reinforces defenses against these UI-level attacks in edge-case conditions, including scenarios where a compromised website tries to influence user interactions when a password could be suggested.

In practice, this extra hardening helps ensure users cannot be guided into interacting with sensitive Passbolt components when those components are not fully visible and clearly presented to them.

### Better visibility and efficiency around email digest operations

Large folder operations can generate a lot of email activity and can be difficult  to reason about as  queues grow. Passbolt 5.9 improves digest handling related to folder operations, helping reduce unnecessary mail churn in workspaces where folder structure and permissions evolve frequently.

In addition, the passbolt *email_digest* command now reports how many emails were sent and how many remain in the queue. This makes it easier for administrators to confirm progress, anticipate bursts, and troubleshoot queue behavior using logs.

### Maintenance work that improves stability over time

Passbolt 5.9 continues the migration work of its UI framework for authentication-related applications. The first applications have been migrated as  part of a larger foundation effort aimed at improving stability and long-term performance as more areas move to the new framework.

### Conclusion
This release also includes additional fixes and improvements beyond the highlights above. Check out the changelogs to learn more. Thanks to the community members and teams who reported issues and helped validate fixes.


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