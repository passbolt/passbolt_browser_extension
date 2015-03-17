var openpgp = require("openpgp");
var Keyring = require("../model/keyring");

var importPrivate = function(worker, txt) {

  // @todo Rething the architecture of the Keyring model.
  var key = Keyring.importPrivate(txt);

  // An error occured.
  if (typeof key == 'string') {
    worker.port.emit("passbolt.keyring.importPrivateError", key);
  }
  // An object should have been returned.
  else {
    worker.port.emit("passbolt.keyring.importPrivateSuccess");
  }

  return;
  imported.keys.forEach(function(privKey) {
    console.log('finger print');
    console.log(privKey.primaryKey.getFingerprint());
    // check for existing keys
    var key = keyring.getKeysForId(privKey.primaryKey.getFingerprint());
    console.log('a key already exists');
    console.log(key);
    var keyid = privKey.primaryKey.getKeyId().toHex().toUpperCase();

    // A key has already been stored.
    if (key) {
      console.log('A key has already been stored');
      key = key[0];
      if (key.isPublic()) {
        console.log('key is well public');
        privKey.update(key);
        keyring.publicKeys.removeForId(privKey.primaryKey.getFingerprint());
        keyring.privateKeys.push(privKey);
        //result.push({
        //  type: 'success',
        //  message: 'Private key of existing public key' + keyid + ' of user ' + getUserId(privKey) + ' imported into key ring'
        //});
      } else {
        console.log('key is well private');
        key.update(privKey);
        //result.push({
        //  type: 'success',
        //  message: 'Private key ' + keyid + ' of user ' + getUserId(privKey) + ' updated'
        //});
      }
    } else {
      console.log('Store a new key');
      keyring.privateKeys.push(privKey);
    }

  });
  return result;
}
exports.importPrivate = importPrivate;

//
//exports.debugPrivateKey = function() {
//  var keys = getArmoredKeys(null, {'all':true});
//}
//
//exports.getArmoredKeys = function(keyids, options) {
//  var result = [];
//  var keys = null;
//  if (options.all) {
//    keys = keyring.getAllKeys();
//  } else {
//    keys = keyids.map(function(keyid) {
//      return keyring.getKeysForId(keyid)[0];
//    });
//  }
//  keys.forEach(function(key) {
//    var armored = {};
//    //if (options.pub) {
//    //  armored.armoredPublic = key.toPublic().armor();
//    //}
//    //if (options.priv && key.isPrivate()) {
//    armored.armoredPrivate = key.armor();
//    //}
//    console.log('armored');
//    result.push(armored);
//  });
//  return result;
//}
