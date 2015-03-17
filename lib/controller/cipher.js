var openpgp = require("openpgp");
var Keyring = require("../model/keyring");

var encrypt = function(worker, txt) {
  var publicKey = Keyring.getPublic("passbolt@passbolt.com");
  var pgpMessage = openpgp.encryptMessage(publicKey, txt);

  var data = {
    id: openpgp.crypto.hash.md5(txt),
    msg: pgpMessage
  };
  worker.port.emit("passbolt.cipher.encryptSuccess", data);
};
exports.encrypt = encrypt;

var decrypt = function(worker, txt) {
  var privateKey = Keyring.getPrivate("passbolt@passbolt.com");
  var pgpMessage = openpgp.message.readArmored(txt);
  var message = openpgp.decryptMessage(privateKey, pgpMessage);

  var data = {
    id: openpgp.crypto.hash.md5(txt),
    msg: message
  };
  worker.port.emit("passbolt.cipher.decryptSuccess", data);
};
exports.decrypt = decrypt;
