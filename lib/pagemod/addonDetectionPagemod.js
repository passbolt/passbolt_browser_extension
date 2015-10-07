/*
 * This pagemod allow inserting classes to help any page
 * to know about the status of the extension, in a modernizr fashion
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');

var addonDetection = pageMod.PageMod({
    include: '*',
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
        self.data.url('js/lib/jquery-2.1.1.min.js'),
        self.data.url('js/inc/request.js'),
        self.data.url('js/addon-detection.js')
    ],
    onAttach: function (worker) {
        app.workers['AddonDetection'] = worker;
        app.events.config.listen(worker);
    }
});
exports.addonDetection = addonDetection;