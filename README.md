	      ____                  __          ____
	     / __ \____  _____ ____/ /_  ____  / / /_
	    / /_/ / __ `/ ___/ ___/ __ \/ __ \/ / __/
	   / ____/ /_/ (__  |__  ) /_/ / /_/ / / /_
	  /_/    \__,_/____/____/_.___/\____/_/\__/
	
	The password management solution
	(c) 2012-2015 passbolt.com

Development
=========

While developing you'll frequently need to update your firefox plugin to test
it.

Install the firefox "Extension Auto-Installer" which makes the testing process
lighter.

```
https://addons.mozilla.org/en-us/firefox/addon/autoinstaller/
```

By default it is disabled, go on the configuration page and activate it.

To udpate your plugin after a change, go on your projet root and execute
the following :
```
cfx xpi --output-file=bin/passbolt-firefox-addon.xpi; wget --post-file=bin/passbolt-firefox-addon.xpi http://localhost:8888/
```
