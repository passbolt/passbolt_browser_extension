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
1. Python v.2.6 or 2.7
2. the Firefox Addon SDK (jetpack)


https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation


Development
=========
- cfx check if cfx is working and options
- cfx run to run a new instance of Firefox with the add-on installed, to try it out
- cfx xpi to package the add-on into an XPI file for distribution


Productivity
--------

While developing you'll frequently need to update your firefox plugin to test
it. Install the firefox "Extension Auto-Installer" which makes the testing process
lighter if you want to reuse an existing firefox instance and profile.


https://addons.mozilla.org/en-us/firefox/addon/autoinstaller/


By default it is disabled, go on the configuration page and activate it.

To udpate your plugin after a change, go on your projet root and execute
the following:

cfx xpi ; wget --post-file=passbolt-firefox-addon.xpi http://localhost:8888/


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
