/*
 * This pagemod allow inserting classes to help any page
 * to know about the status of the extension, in a modernizr fashion
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Config = require('../model/config');

var appBootstrap = pageMod.PageMod({
    include: '*',
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
        self.data.url('js/lib/jquery-2.1.1.min.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/inc/port.js'),
        self.data.url('js/bootstrap.js')
    ],
    onAttach: function (worker) {
        app.workers['appBootstrap'] = worker;
        app.events.config.listen(worker);
        app.events.auth.listen(worker);
    }
});
exports.appBootstrap = appBootstrap;