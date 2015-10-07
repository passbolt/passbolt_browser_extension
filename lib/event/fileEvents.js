/**
 * File Listeners
 * Event related to file like open and save
 */
var fileIO = require("sdk/io/file");
var filepickerController = require("../controller/filepickerController");

var listen = function (worker) {
    // Listen to request to prompt a file.
    worker.port.on("passbolt.file.prompt", function (token) {
        var path = filepickerController.openFilePrompt();
        if (fileIO.isFile(path)) {
            var fileContent = fileIO.read(path);
            worker.port.emit("passbolt.file.prompt.complete", token, 'SUCCESS', fileContent);
        }
    });
};
exports.listen = listen;