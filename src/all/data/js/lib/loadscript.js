/**
 * Load scripts using promises resolved once state is marked as complete
 * Allow to ensure one script initialization is performed before inserting the next one
 *
 * @credit http://stackoverflow.com/users/3761179/matt
 * @copyright (c) 2017 Passbolt SARL
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
      if (!script.readyState || script.readyState == 'complete') {
        resolve(script);
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
