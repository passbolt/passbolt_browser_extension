var self = require('sdk/self');
var tabs = require('sdk/tabs');
var buttons = require('sdk/ui/button/action');
var Config = require('../model/config').Config;
var Settings = require('../model/settings').Settings;

// Add a passbolt button on browser toolbar
var button = buttons.ActionButton({
    id: 'passbolt-link',
    label: 'Passbolt',
    icon: {
        '16': './img/logo/icon-16.png',
        '32': './img/logo/icon-32.png',
        '64': './img/logo/icon-64.png'
    },
    onClick: function (state) {
        var settings = new Settings();
        try {
            tabs.open(settings.getDomain() + '/debug');
        } catch (e) {
            console.log(e.message);
            tabs.open('http://www.passbolt.com');
        }

    }
});
//tabs.open('http://passbolt.dev');