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

import { stripslashes } from "./stripslashes";

describe("stripslashes", () => {
  it("should return a plain string unchanged", () => {
    expect(stripslashes("hello world")).toBe("hello world");
  });

  it("should remove backslash before a regular character", () => {
    expect(stripslashes("he\\llo")).toBe("hello");
  });

  it("should unescape a double backslash to a single backslash", () => {
    expect(stripslashes("back\\\\slash")).toBe("back\\slash");
  });

  it("should unescape \\0 to a null byte", () => {
    expect(stripslashes("null\\0byte")).toBe("null\u0000byte");
  });

  it("should handle a trailing backslash (lone backslash at end of string)", () => {
    // A lone backslash at end: the regex matches \\ followed by empty string ""
    expect(stripslashes("trailing\\")).toBe("trailing");
  });

  it("should unescape \\n to n (not a newline — PHP stripslashes behaviour)", () => {
    expect(stripslashes("new\\nline")).toBe("newnline");
  });

  it("should unescape \\t to t", () => {
    expect(stripslashes("tab\\there")).toBe("tabthere");
  });

  it("should unescape a backslash before a quote", () => {
    expect(stripslashes("say \\'hello\\'")).toBe("say 'hello'");
    expect(stripslashes('say \\"hello\\"')).toBe('say "hello"');
  });

  it("should handle multiple escape sequences in one string", () => {
    expect(stripslashes("a\\\\b\\0c\\'d")).toBe("a\\b\u0000c'd");
  });

  it("should return an empty string unchanged", () => {
    expect(stripslashes("")).toBe("");
  });

  it("should coerce a non-string argument to string", () => {
    expect(stripslashes(42)).toBe("42");
    expect(stripslashes(null)).toBe("null");
  });
});
