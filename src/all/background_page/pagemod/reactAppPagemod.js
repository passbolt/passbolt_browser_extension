/**
 * React application pagemod.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const app = require('../app');
const Worker = require('../sdk/worker').Worker;
const WorkersCollection = require('../model/worker');

/*
 * This page mod drives the react application iframe.
 */
class ReactApp {

  static init() {
    chrome.runtime.onConnect.addListener(port => {
      if (port.name != "react-app") {
        return;
      }

      const worker = new Worker(port, port.sender.tab);

      // Destroy the worker when the port is destroyed.
      port.onDisconnect.addListener(() => {
        worker.destroy('React App pagemod port got disconnected');
      });

      // Initialize the events listeners.
      app.events.folder.listen(worker);
      app.events.resource.listen(worker);
      app.events.keyring.listen(worker);
      app.events.reactApp.listen(worker);
      app.events.secret.listen(worker);
      app.events.siteSettings.listen(worker);
      app.events.share.listen(worker);
      app.events.user.listen(worker);

      WorkersCollection.add('ReactApp', worker);
    });
  }
}

exports.ReactApp = ReactApp;
