Song: https://www.youtube.com/watch?v=hbe3CQamF8k

Passbolt v4.8.0 is a maintenance release focusing on the migration of the browser extension to the latest MV3 architecture and adding tools for administrators to help them manage their instance.

This release marks the introduction of the first version of the MV3 extension for Chrome. The transition to MV3 has been in progress since last year, with changes rolled out progressively until now. The base code between MV2 and MV3 is nearly identical, and both extensions will continue to be maintained in parallel. A detailed blog post explaining our migration process will be coming soon.

A new feature allowing administrators to purge audit logs from the command line was added. This will help reclaim database space for logs that are no longer relevant, improving the performance of long-running instances while keeping necessary logs for forensic and audit activities.

A new command has also been added to help administrators debug issues with their SMTP server. Email functionality is crucial for Passbolt, and diagnosing connection problems is not always straightforward. This new command aims to simplify the process when connecting to a new SMTP server as well as understand errors that could occur on existing integration.

As passbolt moves towards supporting more content types this year, significant work has been done to enhance performance across the entire stack, from the database to the API and the browser extension. This release includes some of these improvements, with more enhancements on the way in the next coming release v4.9.0.

We hope these updates enhance your experience with Passbolt. Your feedback is always valuable to us.

## [4.8.0] - 2024-05-16
### Maintenance
- PB-33541 Chrome Extension Manifest upgrade to version 3
