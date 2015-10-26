/**
 * This page mod drives a convenience config page for debug
 * This allows to not have to go through the setup process steps
 * and perform changes useful for testing that would otherwise break things
 * Like for example changing the public key only on the client but not the server
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');

var configDebug = pageMod.PageMod({
    include: self.data.url('config-debug.html'),
    contentScriptWhen: 'end',
    contentStyleFile: [
        self.data.url('css/config_debug_ff.css')
    ],
    contentScriptFile: [
        self.data.url('js/vendors/jquery-2.1.1.min.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/config-debug.js')
    ],
    onAttach: function (worker) {
        app.workers['ConfigDebug'] = worker;
        app.events.config.listen(worker);
        app.events.dispatch.listen(worker);
        app.events.file.listen(worker);
        app.events.keyring.listen(worker);
        app.events.template.listen(worker);
        app.events.user.listen(worker);
    }
});
exports.configDebug = configDebug;
