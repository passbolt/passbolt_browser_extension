import storage from "../../../all/background_page/sdk/storage";
import {Config} from "../../../all/background_page/model/config";
import Log from "../../../all/background_page/model/log";
import ToolbarController from "../../../all/background_page/controller/toolbarController";

class SystemRequirementService {
  static async get() {
    await storage.init();
    Config.init();
    Log.init();
    new ToolbarController();
  }
}

export default SystemRequirementService;
