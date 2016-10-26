	      ____                  __          ____
	     / __ \____  _____ ____/ /_  ____  / / /_
	    / /_/ / __ `/ ___/ ___/ __ \/ __ \/ / __/
	   / ____/ /_/ (__  |__  ) /_/ / /_/ / / /_
	  /_/    \__,_/____/____/_.___/\____/_/\__/
	
	Open source password manager for teams
	(c) 2016 Bolt Softwares Pvt Ltd
	https://www.passbolt.com


## Licence

Passbolt is distributed under [Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.html)

## About passbolt

Passbolt is an open source password manager for teams. It allows to securely share and store credentials.
For instance, the wifi password of your office, or the administrator password of a router, or your organisation social media account password,
all of them can be secured using Passbolt.

You can try a demo of passbolt at [https://demo.passbolt.com](https://demo.passbolt.com).

You will need to install a plugin, you can find a step by step guide in the website
[help section](https://www.passbolt.com/help/start/firefox)

Or, of course, you can use the code in this repository to build it yourself and run it!

## About passbolt browser extension

A browser extension is needed to maintain a higher level of security, e.g. to ensure the integrity of the
cryptographic code and provide a secure random number generator. In the future it will also be used to provide feature such as
auto filling your passwords when visiting known websites.

### How does it look like?

[![Login](https://raw.githubusercontent.com/passbolt/passbolt_styleguide/master/src/img/screenshots/teaser-screenshot-login-275.png)](https://raw.githubusercontent.com/passbolt/passbolt_styleguide/master/src/img/screenshots/teaser-screenshot-login.png)
[![Browse passwords](https://raw.githubusercontent.com/passbolt/passbolt_styleguide/master/src/img/screenshots/teaser-screenshot4-275.png)](https://raw.githubusercontent.com/passbolt/passbolt_styleguide/master/src/img/screenshots/teaser-screenshot4.png)
[![Share passwords](https://raw.githubusercontent.com/passbolt/passbolt_styleguide/master/src/img/screenshots/teaser-screenshot-share-275.png)](https://raw.githubusercontent.com/passbolt/passbolt_styleguide/master/src/img/screenshots/teaser-screenshot-share.png)

# Contributing
Please check CONTRIBUTING.md for more information about how to get involved.

# Quick how-to for developers
This is just a quick getting started guide, for more information and productivity tips checkout CONTRIBUTING.md

## Prerequisite

You will need:
1. Nodejs
2. JPM the Node base Firefox Addon SDK (jetpack), see. [Official documentation](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation)
3. This code
```
git clone git@github.com:passbolt/passbolt_firefox.git
sudo npm install jpm -g
```

## Test a local version of the plugin

To launch an instance of Firefox with your local version of the add-on installed,
you will need make sure you run an instance that allowed unsigned extension (the developer edition for example)
```
jpm run -b /path/to/FirefoxAllowingUnsignedExtension
```
On MacOS that will be something like this:
```
jpm run -b /Applications/FirefoxDeveloperEdition.app
```

# Credits

https://www.passbolt.com/credits
