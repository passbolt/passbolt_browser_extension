/**
 * The passbolt security token is a part of the security layer.
 * It has for aim to guarantee the integrity of critical information displayed
 * to the user.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.security = passbolt.security || {};

(function (passbolt) {

  /**
   * Retrieve the user security token information and init it.
   *
   * @param protectedFieldSelector {string} Selector to retrieve the field to
   *  secure
   * @param securityTokenSelector {string} Selector to retrieve the security
   *  token field
   * @returns {promise}
   */
  var initSecurityToken = function (protectedFieldSelector, securityTokenSelector) {
    return passbolt.request('passbolt.user.settings.get.securityToken')
      .then(function (securityToken) {
        $(securityTokenSelector).text(securityToken.code);
        securityToken.id = protectedFieldSelector;
        return passbolt.html.loadTemplate('head', 'data/tpl/secret/securitytoken-style.ejs', 'append', securityToken);
      });
  };
  passbolt.security.initSecurityToken = initSecurityToken;

})(passbolt);
