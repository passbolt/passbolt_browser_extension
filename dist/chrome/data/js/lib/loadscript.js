/**
 * Load scripts using promises resolved once state is marked as complete
 * Allow to ensure one script initialization is performed before inserting the next one
 *
 * @credit http://stackoverflow.com/users/3761179/matt
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
/**
 * Loads an individual script
 * @param {string} path
 * @return {Promise}
 */
var loadScript = function (path) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState == 'complete') {
        resolve(this);
      }
    };
    script.src = path;
    document.getElementsByTagName('head')[0].appendChild(script);
  });
};

/**
 * Load an array of script path
 * @param {array} scripts
 * @return {Promise}
 */
var loadScripts = function (scripts) {
  return scripts.reduce(function (queue, path) {
    return queue.then(function () {
      return loadScript(path);
    });
  }, Promise.resolve());
};
