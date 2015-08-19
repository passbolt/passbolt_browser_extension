/**
 * @deprecated @see model:Gpgkey
 */

var openpgp = require("../openpgp");
var keyring = new openpgp.Keyring();

var PUBLIC_HEADER ='-----BEGIN PGP PUBLIC KEY BLOCK-----';
exports.PUBLIC_HEADER = PUBLIC_HEADER;
var PUBLIC_FOOTER = '-----END PGP PUBLIC KEY BLOCK-----';
exports.PUBLIC_FOOTER = PUBLIC_FOOTER;
var PRIVATE_HEADER = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
exports.PRIVATE_HEADER = PRIVATE_HEADER;
var PRIVATE_FOOTER = '-----END PGP PRIVATE KEY BLOCK-----';
exports.PRIVATE_FOOTER = PRIVATE_FOOTER;
var PUBLIC = 'PUBLIC';
exports.PUBLIC = PUBLIC;
var PRIVATE = 'PRIVATE';
exports.PRIVATE = PRIVATE;

/**
 * Get a public key by its fingerprint.
 * @param fingerprint The fingerprint of the key to get.
 * @returns {OpenPgpKey}
 */
var getPublic = function(fingerprint) {
  return keyring.publicKeys.getForId(fingerprint);
};
exports.getPublic = getPublic;

/**
 * Get a private key by its fingerprint.
 * @param fingerprint The fingerprint of the key to get.
 * @returns {OpenPgpKey}
 */
var getPrivate = function(fingerprint) {
  return keyring.privateKeys.getForId(fingerprint);
};
exports.getPrivate = getPrivate;

/**
 * Get private key information.
 * @param key
 * @returns {{fingerprint: (*|String), expirationTime: (*|Date|null), algorithm: *, created: Date}}
 */
var getPrivateKeyInfo = function(key) {
  return data = {
    fingerprint: key.primaryKey.getFingerprint(),
    expirationTime: key.getExpirationTime(),
    algorithm: key.primaryKey.algorithm,
    created: new Date(key.primaryKey.created.getTime())
  };
};
exports.getPrivateKeyInfo = getPrivateKeyInfo;

var parseKeys = function(txt, type) {
  // The type of key to parse. By default the PRIVATE.
  var type = type || PRIVATE;
  // The parsed key. If no header found the output will be the input.
  var key = txt || '';

  if (type == PUBLIC) {
    // Check if we find the public header & footer.
    var pubHeaderPos = txt.indexOf(PUBLIC_HEADER);
    if (pubHeaderPos != -1) {
      var pubFooterPos = txt.indexOf(PUBLIC_FOOTER);
      if (pubFooterPos != -1) {
        key = txt.substr(pubHeaderPos, pubFooterPos + PUBLIC_FOOTER.length);
      }
    }
  } else if (type == PRIVATE) {
    // Check if we find the private header & footer.
    var privHeaderPos = txt.indexOf(PRIVATE_HEADER);
    if (privHeaderPos != -1) {
      var privFooterPos = txt.indexOf(PRIVATE_FOOTER);
      if (privFooterPos != -1) {
        key = txt.substr(privHeaderPos, privFooterPos + PRIVATE_HEADER.length);
      }
    }
  }

  return key;
};
exports.parseKeys = parseKeys;

/**
 * Flush the opengpp Keyring.
 * @todo done for private keys.
 * @param type The type of keys to flush (PUBLIC/PRIVATE). Default PUBLIC.
 */
var flush = function(type) {
  // The type of key to parse. By default the PUBLIC.
  var type = type || PUBLIC;

  if (type == PUBLIC) {
    // Remove all the public keys from the keyring.
    while(keyring.publicKeys.keys.length > 0) {
      var fingerprint = keyring.publicKeys.keys[0].primaryKey.getFingerprint();
      var res = keyring.publicKeys.removeForId(fingerprint);
    }
  } else if (type == PRIVATE) {
    // Remove all the private keys from the keyring.
    while(keyring.privateKeys.keys.length > 0) {
      var fingerprint = keyring.privateKeys.keys[0].primaryKey.getFingerprint();
      keyring.privateKeys.removeForId(fingerprint);
    }
  }

  // Update the keyring local storage.
  keyring.store();
};
exports.flush = flush;

/**
 * Import a private key into the Keyring.
 * @param txt The key to import.
 * @returns {Object|string} Return the openpgp key if imported with success.
 * Otherwise return an error string message.
 */
var importPrivate = function (txt) {
  // Flush any existing private key.
  // @todo Less violence.
  flush(PRIVATE);

  // Parse the keys. If standard format given with a text containing
  // public/private. It will extract only the private.
  var txt = parseKeys(txt, PRIVATE);

  // Is the given key a valid pgp key ?
  var openpgpRes = openpgp.key.readArmored(txt);

  // Return the error in any case
  if (openpgpRes.err) {
    return openpgpRes.err[0].message;
  }
  var key = openpgpRes.keys[0];
  // If the key is not private, return an error.
  if (!key.isPrivate()) {
    return 'Public key given';
  }

  // Import the key into the openpgp keyring.
  keyring.privateKeys.importKey(txt);
  // Update the keyring local storage.
  keyring.store();

  return openpgpRes.keys[0];
}
exports.importPrivate = importPrivate;


/**
 * Import a public key into the Keyring.
 * @param txt The key to import.
 * @returns {Object|string} Return the openpgp key if imported with success.
 * Otherwise return an error string message.
 */
var importPublic = function (txt) {
  // Parse the keys. If standard format given with a text containing
  // public/private. It will extract only the public.
  var txt = parseKeys(txt, PUBLIC);

  // Is the given key a valid pgp key ?
  var openpgpRes = openpgp.key.readArmored(txt);

  // Return the error in any case
  if (openpgpRes.err) {
    return openpgpRes.err[0].message;
  }
  var key = openpgpRes.keys[0];
  // If the key is not public, return an error.
  if (!key.isPublic()) {
    return 'Private key given';
  }

  // Import the key into the openpgp keyring.
  keyring.publicKeys.importKey(txt);
  // Update the keyring local storage.
  keyring.store();

  return openpgpRes.keys[0];
}
exports.importPublic = importPublic;
