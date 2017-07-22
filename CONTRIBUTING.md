# Contributing to passbolt

## Introduction

Thank you for your interest in passbolt. We welcome contributions from everyone, this guide is here to help you get started!

### How can you help?

There are several ways you can help out:

* Create an [issue](https://github.com/passbolt/passbolt/issues) on GitHub, if you have found a bug or want to propose a new feature or a change request.
* Review [enhancement or new feature requests](https://github.com/passbolt/passbolt/issues) and contribute to the functional or technical specifications in the issues.
* Write patches for open bug/feature issues, preferably with test cases included
* Contribute to the [documentation](https://passbolt.com/help).
* Help design the proposed changes by editing the [styleguide](https://github.com/passbolt/passbolt_styleguide) or by submitting changes in the [wireframes](https://github.com/passbolt/passbolt_wireframes).
* Write unit test cases to help increase [test coverage](https://coveralls.io/github/passbolt/passbolt).
* Extend the [selenium test suite](https://github.com/passbolt/passbolt_selenium) for any open bug or change requests

If you have any suggestions or want to get involved in other ways feel free to get in touch with us at [contact@passbolt.com](mailto:contact@passbolt.com)!

### Code of Conduct

First things first, please read our [Code of Conduct](https://www.passbolt.com/code_of_conduct).
Help us keep Passbolt open and inclusive!

## High level guidelines

There are a few guidelines that we need contributors to follow so that we have a chance of keeping on top of things.

### Reporting a security Issue

If you've found a security related issue in Passbolt, please don't open an issue in GitHub.
Instead contact us at security@passbolt.com. In the spirit of responsible disclosure we ask that the reporter keep the
issue confidential until we announce it.

The passbolt team will take the following actions:
- Try to first reproduce the issue and confirm the vulnerability.
- Acknowledge to the reporter that we’ve received the issue and are working on a fix.
- Get a fix/patch prepared and create associated automated tests.
- Prepare a post describing the vulnerability, and the possible exploits.
- Release new versions of all affected major versions.
- Prominently feature the problem in the release announcement.
- Provide credits in the release announcement to the reporter if they so desire.

### Reporting regular issues

* Make sure you have a [GitHub account](https://github.com/signup/free).
* If you are planning to start a new functionality or create a major change request, write down the functional and technical specifications first.
  * Create a document that is viewable by everyone
  * Define the problem you are trying to solve, who is impacted, why it is important, etc.
  * Present a solution. Explaining your approach gives an opportunity for other people to contribute and avoid frictions down the line.
* Submit an [issue](https://github.com/passbolt/passbolt/issues)
  * Check first that a similar issue does not already exist.
  * Make sure you fill in the earliest version that you know has the issue if it is a bug.
  * Clearly describe the issue including steps to reproduce when it is a bug and/or a link to the specification document
  * If applicable, allow people to visualize your proposed changes via changes to the [styleguide](https://github.com/passbolt/passbolt_styleguide)

### Making code changes

#### Which branch to base the work?

* Bugfix branches will be based on master.
* New features that are backwards compatible will be based on next minor release branch.
* New features or other non backwards compatible changes will go in the next major release branch.

#### Make changes locally first
* Fork the repository on GitHub.
* Create a feature branch from where you want to base your work.
  * This is usually the master branch.
  * Only target release branches if you are certain your fix must be on that
    branch.
  * To quickly create a feature branch based on master; `git branch
    feature/ID_feature_description master` then checkout the new branch with `git
    checkout feature/ID_feature_description`. Better avoid working directly on the
    `master` branch, to avoid conflicts if you pull in updates from origin.
* Make commits of logical units.

#### Before submiting changes
* Check for unnecessary whitespace with `git diff --check` before committing.
* Use descriptive commit messages and reference the #issue number.
* Browser extension unit test cases should continue to pass.
* Selenium tests should continue to pass. See [passbolt selenium test suite](https://github.com/passbolt/passbolt_selenium) (see faq bellow).

## How to edit the CSS files?

All the less and css files of passbolt are managed through a styleguide.
https://github.com/passbolt/passbolt_styleguide

You can also develop an alternative stylesheet and include it manually if you only want some styling changes for your own version of the browser add-on.
If you want your changes to be included in an official release, you will have to submit the changes in the official styleguide.
