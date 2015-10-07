/**
 * Generic template events
 * Used when a template is requested by the content code and returned by the addon
 */
var data = require("sdk/self").data;

var listen = function(worker) {
    // A template is requested.
    worker.port.on('passbolt.template.get', function (tplPath, token) {
        var tpl = data.load(tplPath);
        worker.port.emit('passbolt.template.send', tpl, token);
    });
};
exports.listen = listen;