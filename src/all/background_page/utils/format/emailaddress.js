/*
 * Copyright 2010 The Closure Library Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import googString from "./string";

/**
 * @fileoverview Provides functions to parse email addresses.
 *
 */
const goog = {};

goog.string = googString.string;

goog.format = {};

/**
 * Formats an email address string for display, and allows for extraction of
 * The individual componants of the address.
 * @param {string=} opt_address The email address.
 * @param {string=} opt_name The name associated with the email address.
 * @constructor
 */
goog.format.EmailAddress = function (opt_address, opt_name) {
  /**
   * The name or personal string associated with the address.
   * @type {string}
   * @private
   */
  this.name_ = opt_name || "";

  /**
   * The email address.
   * @type {string}
   * @private
   */
  this.address_ = opt_address || "";
};

/**
 * Match string for opening tokens.
 * @type {string}
 * @private
 */
goog.format.EmailAddress.OPENERS_ = '"<([';

/**
 * Match string for closing tokens.
 * @type {string}
 * @private
 */
goog.format.EmailAddress.CLOSERS_ = '">)]';

/**
 * A RegExp to match escaped double quotes.  Used in parse().
 * @type {RegExp}
 * @private
 */
goog.format.EmailAddress.ESCAPED_DOUBLE_QUOTES_ = /\\\"/g;

/**
 * A RegExp to match escaped backslashes.  Used in parse().
 * @type {RegExp}
 * @private
 */
goog.format.EmailAddress.ESCAPED_BACKSLASHES_ = /\\\\/g;

/**
 * Parse an email address of the form "name" &lt;address&gt; into
 * an email address.
 * @param {string} addr The address string.
 * @return {goog.format.EmailAddress} The parsed address.
 */
goog.format.EmailAddress.parse = function (addr) {
  // TODO(ecattell): Strip bidi markers.
  let name = "";
  let address = "";
  for (let i = 0; i < addr.length; ) {
    const token = goog.format.EmailAddress.getToken_(addr, i);
    if (token.charAt(0) == "<" && token.indexOf(">") != -1) {
      const end = token.indexOf(">");
      address = token.substring(1, end);
    } else if (address == "") {
      name += token;
    }
    i += token.length;
  }

  // Check if it's a simple email address of the form "jlim@google.com".
  if (address == "" && name.indexOf("@") != -1) {
    address = name;
    name = "";
  }

  name = goog.string.collapseWhitespace(name);
  name = goog.string.stripQuotes(name, "'");
  name = goog.string.stripQuotes(name, '"');
  // Replace escaped quotes and slashes.
  name = name.replace(goog.format.EmailAddress.ESCAPED_DOUBLE_QUOTES_, '"');
  name = name.replace(goog.format.EmailAddress.ESCAPED_BACKSLASHES_, "\\");
  address = goog.string.collapseWhitespace(address);
  return new goog.format.EmailAddress(address, name);
};

/**
 * Get the next token from a position in an address string.
 * @param {string} str the string.
 * @param {number} pos the position.
 * @return {string} the token.
 * @private
 */
goog.format.EmailAddress.getToken_ = function (str, pos) {
  const ch = str.charAt(pos);
  const p = goog.format.EmailAddress.OPENERS_.indexOf(ch);
  if (p == -1) {
    return ch;
  }
  if (goog.format.EmailAddress.isEscapedDlQuote_(str, pos)) {
    /*
     * If an opener is an escaped quote we do not treat it as a real opener
     * and keep accumulating the token.
     */
    return ch;
  }
  const closerChar = goog.format.EmailAddress.CLOSERS_.charAt(p);
  let endPos = str.indexOf(closerChar, pos + 1);

  /*
   * If the closer is a quote we go forward skipping escaped quotes until we
   * hit the real closing one.
   */
  while (endPos >= 0 && goog.format.EmailAddress.isEscapedDlQuote_(str, endPos)) {
    endPos = str.indexOf(closerChar, endPos + 1);
  }
  const token = endPos >= 0 ? str.substring(pos, endPos + 1) : ch;
  return token;
};

/**
 * Checks if the character in the current position is an escaped double quote
 * ( \" ).
 * @param {string} str the string.
 * @param {number} pos the position.
 * @return {boolean} true if the char is escaped double quote.
 * @private
 */
goog.format.EmailAddress.isEscapedDlQuote_ = function (str, pos) {
  if (str.charAt(pos) != '"') {
    return false;
  }
  let slashCount = 0;
  for (let idx = pos - 1; idx >= 0 && str.charAt(idx) == "\\"; idx--) {
    slashCount++;
  }
  return slashCount % 2 != 0;
};

export default goog;
