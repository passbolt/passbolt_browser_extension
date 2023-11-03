import storage from "../../sdk/storage";
import {Config} from "../../model/config";
import Log from "../../model/log";
import ToolbarController from "../../controller/toolbarController";
import * as openpgp from "openpgp";
import * as kdbxweb from 'kdbxweb';
import argon2 from "argon2-browser";

const ARGON2_PARALLELISM = 1;
const ARGON2_MEMORY_KB = 15 * 1024;

class SystemRequirementService {
  /**
   * Initialize all requirement for proper operation
   * @return {Promise<void>}
   */
  static async get() {
    // Initialization of the storage
    await storage.init();
    // Initialization of the config
    Config.init();
    // Initialization of the Log
    Log.init();
    // Openpgpjs worker initialization
    kdbxweb.CryptoEngine.setArgon2Impl(SystemRequirementService.argon2Hash);
    /**
     * This option is needed because some secrets were encrypted using non-encryption RSA keys,
     * due to an openpgpjs bug: https://github.com/openpgpjs/openpgpjs/pull/1148
     */
    openpgp.config.allowInsecureDecryptionWithSigningKeys = true;
    // Toolbar controller
    new ToolbarController();
  }

  /**
   * Argon2 hasing proxy function.
   * Recommandation could be found here https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
   * @param {Uint8Array} password the password to be hashed
   * @param {Uint8Array} salt the salt used for the hashing algorithm
   * @returns {Promise<Uint8Array>} the Argon2id hashed password
   * @private
   */
  static async argon2Hash(password, salt) {
    const args = {
      pass: new Uint8Array(password),
      salt: new Uint8Array(salt),
      mem: ARGON2_MEMORY_KB, // should be 15 * 1024 kB minimum
      time: 2, // iteration count (2 recommanded for Argon2id)
      hashLen: 32, // 32 bytes required by kdbxweb (another value produce an bad derived key error)
      parallelism: ARGON2_PARALLELISM, // degree of parallelism (1 recommanded)
      type: argon2.ArgonType.Argon2id, // Argon2id recommanded
    };
    const result = await argon2.hash(args);
    return result.hash;
  }

  static get ARGON2_MEMORY() {
    return ARGON2_MEMORY_KB;
  }

  static get ARGON2_PARALLELISM() {
    return ARGON2_PARALLELISM;
  }
}

export default SystemRequirementService;
