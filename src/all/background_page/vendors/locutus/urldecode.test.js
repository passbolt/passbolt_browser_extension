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
 * @since         4.11.0
 */

import { urldecode } from "./urldecode";

describe("urldecode", () => {
  it("should return a plain string unchanged", () => {
    expect(urldecode("hello")).toBe("hello");
  });

  it("should decode a percent-encoded character", () => {
    expect(urldecode("hello%20world")).toBe("hello world");
  });

  it("should decode a + sign as a space (PHP urldecode behaviour)", () => {
    expect(urldecode("hello+world")).toBe("hello world");
  });

  it("should decode multiple percent-encoded characters", () => {
    expect(urldecode("foo%3Dbar%26baz%3Dqux")).toBe("foo=bar&baz=qux");
  });

  it("should decode a percent-encoded slash", () => {
    expect(urldecode("path%2Fto%2Fresource")).toBe("path/to/resource");
  });

  it("should decode percent-encoded UTF-8 sequences", () => {
    expect(urldecode("caf%C3%A9")).toBe("café");
  });

  it("should tolerate a lone % sign by escaping it as %25", () => {
    // PHP urldecode is tolerant of malformed sequences; the implementation
    // converts a lone % to %25 before decoding, so it survives as a literal %.
    expect(urldecode("100%done")).toBe("100%done");
  });

  it("should decode a properly encoded % (%25) to a literal %", () => {
    expect(urldecode("100%25done")).toBe("100%done");
  });

  it("should handle an empty string", () => {
    expect(urldecode("")).toBe("");
  });

  it("should decode mixed + and percent-encoding", () => {
    expect(urldecode("first+name%3DJohn+Doe")).toBe("first name=John Doe");
  });

  it("should coerce a non-string argument to string", () => {
    expect(urldecode(42)).toBe("42");
    expect(urldecode(null)).toBe("null");
  });
});
