/**
 * Bootstrap.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};

$(function () {

  /**
   * Init the passbolt bootstrap.
   */
  const Bootstrap = function () {
    // Init the quickaccess.
    passbolt.quickaccess.bootstrap();
  };

  // Boostrap passbolt.
  new Bootstrap();
});
// result must be structured-clonable data
undefined;