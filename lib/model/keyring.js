/**
 * @deprecated @see model:Gpgkey
 */

var openpgp = require("openpgp");
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

var getFakeKey = function() {
  return "-----BEGIN PGP PUBLIC KEY BLOCK-----\n"
    +"Version: GnuPG/MacGPG2 v2.0.22 (Darwin)\n"
    +"Comment: GPGTools - https://gpgtools.org\n"
    +"\n"
    +"mQENBFRso0cBCAC+J/b4LoML0L9/xlIs3/TZKC9CSVTQ2xljs3hdawvGi/+p210M\n"
    +"doXev6optgaDPj0q61HaCR1XhrCa7gK9jEC54M91LwrRzm5nBT9Fez/wezXn2I0v\n"
    +"56RIAn42k3OcDwWUDdPenzZS+/4/efJPyb/XO7sZMiD+OjjpXwNNu9ezqSvNZ1uo\n"
    +"/VcMHBTkQ0NqETO5Yt5KX9JkrKP2Q0BR2BVHGHp7K/PJiWnN+T8dTFr6RsiZsVWs\n"
    +"dD/5IPSkNAsi8E8fguuWecQtMftled/36QjlaXYgZ/U1kVi2mDUebd6oxTvB85fm\n"
    +"pCvIekFRNqs6TAd4de+pDBsbYY+vsE1tCsxvABEBAAG0JFBhc3Nib2x0IFBHUCA8\n"
    +"cGFzc2JvbHRAcGFzc2JvbHQuY29tPokBPQQTAQoAJwUCVGyjRwIbAwUJB4YfgAUL\n"
    +"CQgHAwUVCgkICwUWAgMBAAIeAQIXgAAKCRBPgZQCX9LZLAk6CACop+n6hgaCrFWU\n"
    +"m5EaT2+XBBw9rEbcISCH8Zeh2Xk1RmLOiTLSYRka8qnUcEBbSq8EOoJsfNdWEK8d\n"
    +"QwhearHZjRCUjrQMPsMwwKhKrkG7RR7VI+hN+7H7Joyq3UDE7S+55vvWd7hSZbPl\n"
    +"buhPWBirviN1Lovk2tZbI7ClW1+Cx9uK3lad1LywlPsxkCKbRfDcWrnLFKk1UnYi\n"
    +"229ZXCYjuJbzfPRWx039nVVt6IoOZnLCil5G9d5AFt5Ro7WFdormTsfP+EehLI7q\n"
    +"szrEVD2ZQgn+rSF8P97DLABDa28+JfTsnivVQn5cyLR6x+XTJp96SSprm5nY0C3+\n"
    +"ybog/dDFuQENBFRso0cBCAC50ryBhhesYxrJEPDvlK8R0E8zCxv7I6fXXgORNyAW\n"
    +"PAsZBUsaQizTUsP9VpO6Y0gOPGxvcGP9xSc+01n1stM9S7/+utCfm8yD4UtP9Ric\n"
    +"mkq/T/w/l9iLFypo6al47HW28mQlMvbUWSkMoK9JXRpB2c2VPmN8UXVQX4cQ++ad\n"
    +"YQNnRgSo3n+VdvIKgSW3rkcQIriGX3P79cciqAA/NzkivNyZSQaVBLJioO+kDkYu\n"
    +"Q+oIstvEusmHIon0Ltggi8B6LM5vAQpBRwQ9dfUgAbpQpfzm8VUkCGmsUr5hnOO3\n"
    +"tmaWOTKZcpXiF5+rW2NrqiAhRhm44s+JipmTE++u/6X9ABEBAAGJASUEGAEKAA8F\n"
    +"AlRso0cCGwwFCQeGH4AACgkQT4GUAl/S2Sx2LQgAoXOxfA5pOCm9UP2f2pQA7hyv\n"
    +"DEppROxkBLVcnZdpVFw4yrVQh/IWHSxcX0rcrTPlBjjFpTos+ACOZ5EKSRCHjIqF\n"
    +"biraG5/2YjKa5cqc7z/W9bSuhmWizPBpXlQk6MohG6jXlw7OyVosisbHGobFa5CW\n"
    +"hF+Kc8tb0mvk9vmqn/eDYnGYcSftapyGB3lq7w4qtKzlvn2g2FlnxJCdnrG3zGtO\n"
    +"Kqusl1GcnrNFuDDtDwZS1G+3T8Y8ZH8tRnTwrSeO3I7hw/cdzCEDg4isqFw371vz\n"
    +"UghWsISL244Umc6ZmTufAs+7/6sNNzFAb5SzwVmpLla1x3jth4bwLcJTGFq/vw==\n"
    +"=GG/Z\n"
    +"-----END PGP PUBLIC KEY BLOCK-----\n"
    +"-----BEGIN PGP PRIVATE KEY BLOCK-----\n"
    +"Version: GnuPG/MacGPG2 v2.0.22 (Darwin)\n"
    +"Comment: GPGTools - https://gpgtools.org\n"
    +"\n"
    +"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\n"
    +"GFq/vw==\n"
    +"=YcG9\n"
    +"-----END PGP PRIVATE KEY BLOCK-----\n";
};
exports.getFakeKey = getFakeKey;

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
