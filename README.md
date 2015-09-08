	      ____                  __          ____
	     / __ \____  _____ ____/ /_  ____  / / /_
	    / /_/ / __ `/ ___/ ___/ __ \/ __ \/ / __/
	   / ____/ /_/ (__  |__  ) /_/ / /_/ / / /_
	  /_/    \__,_/____/____/_.___/\____/_/\__/
	
	The password management solution
	(c) 2012-2015 passbolt.com

Prerequisite
=========

You will need:
1. Nodejs
2. JPM the Node base Firefox Addon SDK (jetpack)

```
	sudo npm install jpm -g
```

See https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation


Development
=========

Launch an instance of Firefox with your add-on installed.
```
	jpm run
```
Runs the add-on's unit tests.
```
	jpm test
```
Package your add-on as an XPI file, which is the install file format for Firefox add-ons.
```
	jpm xpi
```
Package your add-on as an XPI file, then post it to some url.
```
	jpm post
```
Package your add-on as an XPI file whenever there is a file changed, and post that to some url.
```
	jpm watchpost
```
Productivity
--------

While developing you'll frequently need to update your firefox plugin to test
it. Install the firefox "Extension Auto-Installer" which makes the testing process
lighter if you want to reuse an existing firefox instance and profile.


https://addons.mozilla.org/en-us/firefox/addon/autoinstaller/

By default it is disabled, go on the configuration page and activate it.

To udpate your plugin after a change, go on your projet root and execute
the following:

jpm xpi ; wget --post-file=passbolt-firefox-addon.xpi http://localhost:8888/


How to edit the LESS/CSS files?
===============================

Install grunt and grunt
```
	npm install -g grunt-cli
```
Install the needed modules defined in the grunt config
```
	npm install
```
Install the styleguide
```
	bower install
	grunt styleguide-deploy
```
Make sure Grunt watch for less changes and compile them into CSS
```
	grunt watch
```
Edit one LESS file to see if it works!
Make sure that if you need to make change the styleguide to request changes upstream.
