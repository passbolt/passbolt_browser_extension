/**
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Config = require('../model/config');

// @TODO make sure we load the pagemod only if the plugin is not already configured
// @TODO delete the pagemod if the config is complete
var setupBootstrap = pageMod.PageMod({
    include: new RegExp(Config.read('setupBootstrapRegex') + '.*'),
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/setup-bootstrap.js')
    ],
    contentScriptOptions: {
        //config: Config.getContentScriptConfig('setup')
        setupBootstrapRegex : Config.read('setupBootstrapRegex')
    },
    onAttach: function (worker) {
        app.workers['SetupBootstrap'] = worker;
        app.events.setupbootstrap.listen(worker);
    }
});
exports.setupBootstrap = setupBootstrap;