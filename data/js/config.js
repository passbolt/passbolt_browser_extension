$(function() {

  // Listen on import private key failure event.
  self.port.on("passbolt.keyring.status", function() {
  });

  /**
   * Import a new private key.
   * @param armored
   */
  function importPrivate(txt) {
    self.port.emit("passbolt.keyring.importPrivate", txt);
  }

  /* ************************************************************** */
  /* LISTEN TO ADD ON EVENTS */
  /* ************************************************************** */

  // Listen on import private key failure event.
  self.port.on("passbolt.keyring.importPrivateError", function(error) {
    console.log("An error occured during the import of the private key : " + error);
  });

  // Listen on import private key success event.
  self.port.on("passbolt.keyring.importPrivateSuccess", function() {
    console.log("The private key has been inserted with success");
  });

  // A file has been choosed as new private key.
  self.port.on('passbolt.keyring.promptPvtFileSuccess', function(data) {
    $('#keyAscii').val(data);
  });

  /* ************************************************************** */
  /* LISTEN TO THE DOM EVENTS */
  /* ************************************************************** */

  // The user requests a private key import from file.
  $('#keyFilepicker').click(function(){
    console.log('open file picker');
    self.port.emit("passbolt.keyring.promptPvtFile", {});
  });

  // when user click on save key
  $('#saveKey').click(function(){
    var key = $('#keyAscii').val();
    if(key === '') {
      //alert('Sorry, the key cannot be empty');
    }
    else {
      //publicKey = openpgp.key.readArmored(key);
      //if (publicKey.keys.length != 0) {
      //  //console.log('key details :');
      //  //console.log(publicKey.keys[0].isPrivate());
      //  //console.log(publicKey.keys[0].isPublic());
      //  //console.log(publicKey.keys[0].getKeyIds());
      //  //console.log(publicKey.keys[0].getUserIds());
      //  //console.log(publicKey.keys[0].getExpirationTime());
      //  //console.log('key loaded with sucess');
      //} else {
      //  alert('Sorry, the key hasn\'t been loaded with success');
      //}
    }
    console.log('import private key');
    var result = importPrivate(key);
//console.log('debug private key');
//    debugPrivateKey();
  });

  //function importPrivateKey(armored) {
  //  var result = [];
  //  var imported = openpgp.key.readArmored(armored);
  //  if (imported.err) {
  //    console.log('error, loop on import error');
  //    imported.err.forEach(function(error) {
  //      console.log('Error on key.readArmored', error);
  //      result.push({
  //        type: 'error',
  //        message: 'Unable to read one private key: ' + error.message
  //      });
  //    });
  //  }
  //  imported.keys.forEach(function(privKey) {
  //    console.log('finger print');
  //    console.log(privKey.primaryKey.getFingerprint());
  //    // check for existing keys
  //    var key = keyring.getKeysForId(privKey.primaryKey.getFingerprint());
  //    console.log('a key already exists');
  //    console.log(key);
  //    var keyid = privKey.primaryKey.getKeyId().toHex().toUpperCase();
  //
  //    // A key has already been stored.
  //    if (key) {
  //      console.log('A key has already been stored');
  //      key = key[0];
  //      if (key.isPublic()) {
  //        console.log('key is well public');
  //        privKey.update(key);
  //        keyring.publicKeys.removeForId(privKey.primaryKey.getFingerprint());
  //        keyring.privateKeys.push(privKey);
  //        //result.push({
  //        //  type: 'success',
  //        //  message: 'Private key of existing public key' + keyid + ' of user ' + getUserId(privKey) + ' imported into key ring'
  //        //});
  //      } else {
  //        console.log('key is well private');
  //        key.update(privKey);
  //        //result.push({
  //        //  type: 'success',
  //        //  message: 'Private key ' + keyid + ' of user ' + getUserId(privKey) + ' updated'
  //        //});
  //      }
  //    } else {
  //      console.log('Store a new key');
  //      keyring.privateKeys.push(privKey);
  //    }
  //
  //  });
  //  return result;
  //}
  //
  //function getArmoredKeys(keyids, options) {
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
  //      armored.armoredPrivate = key.armor();
  //    //}
  //    console.log('armored');
  //    result.push(armored);
  //  });
  //  return result;
  //}
});
