/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */

import XRegExp from "xregexp";
import ipRegex from "ip-regex";

/**
 * Check if an url can be suggested for a given one.
 * The urls can be suggested if:
 * - The urls hostname match;
 * - The suggested url is a parent of the url;
 * - (optional check) If the suggested url contains a protocol, then it has to match the url.
 * - (optional check) If the suggested url contains a port, then it has to match the url.
 *
 * Note that this function does not take in account any urls path, parameters or hash.
 *
 * @param {string} url The url.
 * @param {string} suggestedUrl The potential url to suggest
 * @returns {boolean}
 */


function canSuggestUrl(url, suggestedUrl) {
  let urlObject;

  try {
    urlObject = new URL(url);
  } catch (error) {
    /*
     * Only valid url are accepted by this function.
     * This information should come from the browser tab url, and so should be valid.
     */
    return false;
  }

  const suggestedUrlObject = parseSuggestedUrl(suggestedUrl);

  // Unable to parse the hostname of the url
  if (!urlObject || !urlObject.hostname) {
    return false;
  }

  // Unable to parse the suggested url or the suggested url has no hostname.
  if (!suggestedUrlObject || !suggestedUrlObject.hostname) {
    return false;
  }

  // Check the protocol, if the suggest url has defined it.
  if (suggestedUrlObject.protocol) {
    if (urlObject.protocol !== suggestedUrlObject.protocol) {
      return false;
    }
  }

  // Check the port, if the suggest url has defined it.
  if (suggestedUrlObject.port) {
    if (urlObject.port !== suggestedUrlObject.port) {
      return false;
    }
  }

  // Check the hostname, if the suggest url has defined it. Perfect match
  if (urlObject.hostname === suggestedUrlObject.hostname) {
    return true;
  }

  // If IPs, make a strict comparison.
  const urlIsIpAddress = ipRegex({exact: true}).test(urlObject.hostname);
  const suggestUrlIsIpAddress = ipRegex({exact: true}).test(suggestedUrlObject.hostname);
  if (urlIsIpAddress || suggestUrlIsIpAddress) {
    return urlObject.hostname === suggestedUrlObject.hostname;
  }

  // Otherwise check if the suggested url hostname contain a dot and is a parent host of the url hostname
  if (suggestedUrlObject.hostname.indexOf(".") !== -1) {
    return isParentHostname(suggestedUrlObject.hostname, urlObject.hostname);
  }

  return false;
}

/**
 * Parse a suggested url.
 * @param {string} suggestedUrl The url.
 * @returns {object}
 * {
 *   protocol: {string},
 *   hostname: {string},
 *   port: {integer}
 * }
 */
const parseSuggestedUrl = function(suggestedUrl) {
  let suggestedUrlObject;
  let protocol = "";
  let hostname = "";
  let port = "";
  let enforceProtocol = false;

  /*
   * The browser URL primitive does not work with relative urls.
   * Enforce a protocol to the suggested url, if none has been defined. A fake protocol is used in order to preserve
   * the port information that can be altered by the parsing. By instance, when the https is enforced to the url
   * www.passbolt.com:443, then the port information is deleted after the parsing.
   */
  if (!/^[a-zA-Z\-]*:\/\//.test(suggestedUrl)) {
    enforceProtocol = true;
    suggestedUrl = `fake://${suggestedUrl}`;
  }

  try {
    suggestedUrlObject = new URL(suggestedUrl);
  } catch (error) {
    return false;
  }

  port = suggestedUrlObject.port;
  if (!enforceProtocol) {
    protocol = suggestedUrlObject.protocol;
    hostname = suggestedUrlObject.hostname;
  } else {
    suggestedUrlObject.protocol = "https:";
    hostname = suggestedUrlObject.hostname;
  }

  return {protocol: protocol, hostname: hostname, port: port};
};

// Hostname allowed characters regex
const regexHostnameAllowedChars = XRegExp('^[\\p{L}\\p{N}.-]*$');

/**
 * Check a hostname is parent of another on.
 * Note, the function does not ensure the validity of the hostnames.
 *
 * By instance for a given hostname: accounts.passbolt.com
 * The following hostnames should match:
 * - accounts.passbolt.com
 * - passbolt.com
 *
 * The following hostnames should not match:
 * - passbolt.com.attacker.com
 * - attacker-passbolt.com
 *
 * @param {string} parent the hostname to check if it is parent.
 * @param {string} hostname The hostname to check if it is a child.
 * @return {boolean}
 */
const isParentHostname = function(parent, child) {
  if (!child || !parent || !regexHostnameAllowedChars.test(child) || !regexHostnameAllowedChars.test(parent)
  ) {
    return false;
  }

  const lastIndexOf = child.lastIndexOf(parent);

  // If found.
  if (lastIndexOf !== -1) {
    /*
     * The resource hostname has to be the last part of the given hostname.
     * It will prevent an attacker to use a hostname such as www.passbolt.com.attacker.com, and make passbolt
     * recognize it as passbolt.com.
     */
    if (lastIndexOf + parent.length === child.length) {
      /*
       * Whatever is found before the resource hostname in the hostname has to be a subdomain or nan.
       * It will prevent an attacker to use a hostname such as www.attacher-passbolt.com, and make passbolt
       * recognize it as passbolt.com.
       */
      if (child[lastIndexOf - 1] === undefined || child[lastIndexOf - 1] === '.') {
        return true;
      }
    }
  }

  return false;
};

export default canSuggestUrl;
