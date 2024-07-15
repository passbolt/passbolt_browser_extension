import storage from "../../sdk/storage";
import {Config} from "../../model/config";
import Log from "../../model/log";
import * as openpgp from "openpgp";

class SystemRequirementService {
  /**
   * @deprecated
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
    /**
     * This option is needed because some secrets were encrypted using non-encryption RSA keys,
     * due to an openpgpjs bug: https://github.com/openpgpjs/openpgpjs/pull/1148
     */
    openpgp.config.allowInsecureDecryptionWithSigningKeys = true;
  }
}

export default SystemRequirementService;
