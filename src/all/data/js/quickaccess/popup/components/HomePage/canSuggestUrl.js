import XRegExp from "xregexp";
import ipRegex from "ip-regex";

/**
 * Check if an url can be suggested for a given hostname.
 * An url can be suggested, if:
 * - It matches the hostname;
 * - It is a parent host of the hostname;
 *
 * @param {string} hostname The domain
 * @param {resource} resource The resource
 * @returns {boolean}
 */
export default function (hostname, url) {
  const urlHostname = extractUrlHostname(url);

  if (!urlHostname) {
    return false;
  }

  if (hostname === urlHostname) {
    return true;
  }

  // If IPs, return a strict comparison.
  const hostnameIsIpAddress = ipRegex({exact: true}).test(hostname);
  const urlHostnameIsIpAddress = ipRegex({exact: true}).test(urlHostname);
  if (hostnameIsIpAddress || urlHostnameIsIpAddress) {
    return hostname === urlHostname;
  }

  // Otherwise check if the url hostname is a parent host of the given hostname.
  return isParentHostname(urlHostname, hostname);
}

/**
 * Extract the hostname of an url.
 * @param {string} url The url to work with.
 * @returns {string|boolean} Return the url hostname, false in case of error.
 */
const extractUrlHostname = function(url) {
  try {
    return (new URL(url)).hostname;
  } catch (error) {
    // URL tool works only with absolute URL, retry with a forged absolute url.
    try {
      return (new URL(`https://${url}`)).hostname;
    } catch (error) {
      return false;
    }
  }
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
const isParentHostname = function (parent, child) {
  if (!child || !parent || !regexHostnameAllowedChars.test(child) || !regexHostnameAllowedChars.test(parent)
  ) {
    return false;
  }

  const lastIndexOf = child.lastIndexOf(parent);

  // If found.
  if (lastIndexOf !== -1) {
    // The resource hostname has to be the last part of the given hostname.
    // It will prevent an attacker to use a hostname such as www.passbolt.com.attacker.com, and make passbolt
    // recognize it as passbolt.com.
    if (lastIndexOf + parent.length === child.length) {
      // Whatever is found before the resource hostname in the hostname has to be a subdomain or nan.
      // It will prevent an attacker to use a hostname such as www.attacher-passbolt.com, and make passbolt
      // recognize it as passbolt.com.
      if (child[lastIndexOf - 1] === undefined || child[lastIndexOf - 1] === '.') {
        return true
      }
    }
  }

  return false;
};
