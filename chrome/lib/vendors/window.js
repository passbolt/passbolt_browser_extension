/**
 * @file
 * This file is used to trick passbolt / openpgp and help them find some
 * browser dependencies that are not accessible in the add-on environment.
 */
'use strict';

/**
 * Fetch polyfill
 *
 * Chrome window.fetch suppresses custom headers such as X-GPGAuth-* in CORS context
 * See. https://developers.google.com/web/updates/2015/03/introduction-to-fetch
 *
 * If a request is made for a resource on another origin which returns the CORs headers, then the type is cors.
 * cors and basic responses are almost identical except that a cors response restricts the headers you can view
 * to `Cache-Control`, `Content-Language`, `Content-Type`, `Expires`, `Last-Modified`, and `Pragma`.
 *
 */
// can't use this:
//exports.fetch = window.fetch;
//exports.FormData = window.FormData;
exports.fetch = require('./fetch').fetch;
exports.FormData = require('./fetch').FormData;
