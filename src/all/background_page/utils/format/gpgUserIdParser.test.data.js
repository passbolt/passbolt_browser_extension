/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2026 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2026 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.9.0
 */

/**
 * Test scenarios for parseGpgUserId() function
 * Format: [description, input, expectedName, expectedEmail]
 * @see https://datatracker.ietf.org/doc/html/rfc2822#section-3.4
 * @see https://datatracker.ietf.org/doc/html/rfc4880#section-5.11
 */
export const parseScenarios = [
  // Standard formats
  ["simple email without name", "ada@passbolt.com", "", "ada@passbolt.com"],
  ["simple email without name and ends with one letter", "ada@passbolt.c", "", "ada@passbolt.c"],
  ["name and email with angle brackets", "Ada Lovelace <ada@passbolt.com>", "Ada Lovelace", "ada@passbolt.com"],
  ["email-only in angle brackets", "<ada@passbolt.com>", "", "ada@passbolt.com"],

  // Quoted names (RFC 2822)
  ["double quotes stripped from name", '"Ada Lovelace" <ada@passbolt.com>', "Ada Lovelace", "ada@passbolt.com"],
  ["single quotes stripped from name", "'Ada Lovelace' <ada@passbolt.com>", "Ada Lovelace", "ada@passbolt.com"],
  ["escaped quotes in name", '"John \\"Jr\\" Doe" <john@example.com>', 'John "Jr" Doe', "john@example.com"],

  // Whitespace handling
  ["multiple whitespaces collapsed in name", "Ada   Lovelace <ada@passbolt.com>", "Ada Lovelace", "ada@passbolt.com"],
  ["leading/trailing whitespace trimmed", "  Ada Lovelace  <ada@passbolt.com>", "Ada Lovelace", "ada@passbolt.com"],
  ["whitespace collapsed in email", "Ada Lovelace <  ada@passbolt.com  >", "Ada Lovelace", "ada@passbolt.com"],

  // Special characters
  ["parentheses preserved in name", "John (CEO) <john@company.com>", "John (CEO)", "john@company.com"],
  ["backslash escapes handled", '"Domain\\\\User" <user@example.com>', "Domain\\User", "user@example.com"],
  ["commas in name", "Doe, John <john@example.com>", "Doe, John", "john@example.com"],
  ["apostrophe in name", "O'Brien <obrien@example.com>", "O'Brien", "obrien@example.com"],

  // Unicode (RFC 4880)
  ["unicode characters in name", "日本語名前 <user@example.jp>", "日本語名前", "user@example.jp"],
  ["unicode with accents", "José García <jose@example.com>", "José García", "jose@example.com"],

  // Edge cases
  ["empty string", "", "", ""],
  ["whitespace-only input", "   ", "", ""],
  ["name-only without @", "Anonymous User", "Anonymous User", ""],
  ["very long name", `${"A".repeat(255)} <long@example.com>`, "A".repeat(255), "long@example.com"],

  // RFC 2822 Section 3.4 - Address Specification
  // Local-part: dot-atom format (atext characters and dots)
  ["local-part with plus sign", "user+tag@example.com", "", "user+tag@example.com"],
  ["local-part with exclamation mark", "user!def@example.com", "", "user!def@example.com"],
  ["local-part with hash", "user#info@example.com", "", "user#info@example.com"],
  ["local-part with dollar sign", "user$name@example.com", "", "user$name@example.com"],
  ["local-part with percent", "user%host@example.com", "", "user%host@example.com"],
  ["local-part with ampersand", "user&co@example.com", "", "user&co@example.com"],
  ["local-part with apostrophe", "user'name@example.com", "", "user'name@example.com"],
  ["local-part with asterisk", "user*star@example.com", "", "user*star@example.com"],
  ["local-part with equals", "user=value@example.com", "", "user=value@example.com"],
  ["local-part with question mark", "user?query@example.com", "", "user?query@example.com"],
  ["local-part with caret", "user^admin@example.com", "", "user^admin@example.com"],
  ["local-part with backtick", "user`cmd@example.com", "", "user`cmd@example.com"],
  ["local-part with curly braces", "user{id}@example.com", "", "user{id}@example.com"],
  ["local-part with pipe", "user|alt@example.com", "", "user|alt@example.com"],
  ["local-part with tilde", "user~home@example.com", "", "user~home@example.com"],
  ["local-part with multiple dots", "user.name.here@example.com", "", "user.name.here@example.com"],
  ["local-part with underscore", "user_name@example.com", "", "user_name@example.com"],
  ["local-part with hyphen", "user-name@example.com", "", "user-name@example.com"],
  ["local-part with slash", "user/path@example.com", "", "user/path@example.com"],
  [
    "local-part all special chars combined",
    "a!b#c$d%e&f'g*h+i/j=k?l^m_n`o{p|q}r~s@example.com",
    "",
    "a!b#c$d%e&f'g*h+i/j=k?l^m_n`o{p|q}r~s@example.com",
  ],

  // RFC 2822 - Quoted local-part (characters that must be quoted)
  ["quoted local-part with space", '"user name"@example.com', "", '"user name"@example.com'],
  ["quoted local-part with at sign", '"user@host"@example.com', "", '"user@host"@example.com'],
  ["quoted local-part with comma", '"user,name"@example.com', "", '"user,name"@example.com'],
  ["quoted local-part with colon", '"user:name"@example.com', "", '"user:name"@example.com'],
  ["quoted local-part with semicolon", '"user;name"@example.com', "", '"user;name"@example.com'],
  ["quoted local-part with angle brackets", '"user<>name"@example.com', "", '"user<>name"@example.com'],
  ["quoted local-part with backslash", '"user\\\\name"@example.com', "", '"user\\\\name"@example.com'],
  ["quoted local-part with double dot", '"user..name"@example.com', "", '"user..name"@example.com'],

  // RFC 2822 - Domain formats
  ["domain with hyphen", "user@my-domain.com", "", "user@my-domain.com"],
  ["domain with numbers", "user@domain123.com", "", "user@domain123.com"],
  ["multiple subdomains", "user@mail.sub.example.com", "", "user@mail.sub.example.com"],
  ["long TLD", "user@example.museum", "", "user@example.museum"],
  ["two-letter TLD", "user@example.co", "", "user@example.co"],

  // RFC 2822 - Display name with angle brackets
  ["display name with special chars in email", "John Doe <john+work@example.com>", "John Doe", "john+work@example.com"],
  ["display name with quoted email", 'John Doe <"john doe"@example.com>', "John Doe", '"john doe"@example.com'],
  ["empty display name with angle brackets", "<user@example.com>", "", "user@example.com"],
  ["display name with multiple words", "Dr. John Doe Jr. <john@example.com>", "Dr. John Doe Jr.", "john@example.com"],

  // RFC 2822 - Comments (in parentheses, typically stripped or treated as part of display name)
  ["comment after name", "John Doe (Marketing) <john@example.com>", "John Doe (Marketing)", "john@example.com"],
  ["comment with nested parens", "John (CEO (Acting)) <john@example.com>", "John (CEO (Acting))", "john@example.com"],

  // RFC 2822 - Folding white space (multiple spaces should collapse)
  ["folding whitespace in display name", "John    Doe <john@example.com>", "John Doe", "john@example.com"],
  ["tabs in display name", "John\tDoe <john@example.com>", "John Doe", "john@example.com"],

  // RFC 2822 - Case sensitivity (local-part is case-sensitive per RFC, domain is not)
  ["mixed case local-part", "User.Name@Example.COM", "", "User.Name@Example.COM"],
  ["all caps local-part", "USERNAME@example.com", "", "USERNAME@example.com"],

  // RFC 2822 - Edge cases for valid formats
  ["single character local-part", "a@example.com", "", "a@example.com"],
  ["numeric local-part", "123@example.com", "", "123@example.com"],
  ["local-part starting with number", "1user@example.com", "", "1user@example.com"],

  // RFC 2822 - Invalid formats (should parse but may not validate)
  ["double dot in local-part (invalid)", "user..name@example.com", "", "user..name@example.com"],
  ["leading dot in local-part (invalid)", ".user@example.com", "", ".user@example.com"],
  ["trailing dot in local-part (invalid)", "user.@example.com", "", "user.@example.com"],
  ["missing local-part", "@example.com", "", "@example.com"],
  ["missing domain", "user@", "", "user@"],
  ["missing TLD", "user@localhost", "", "user@localhost"],

  // RFC 2822 - Domain literal format (IP addresses in brackets)
  ["domain literal IPv4", "user@[192.168.1.1]", "", "user@[192.168.1.1]"],
  ["domain literal IPv6", "user@[IPv6:2001:db8::1]", "", "user@[IPv6:2001:db8::1]"],

  // RFC 2822 - Obsolete but valid formats
  ["obs-local-part with spaces in quotes", '"john doe"@example.com', "", '"john doe"@example.com'],
  ["multiple @ in quoted local-part", '"user@work@home"@example.com', "", '"user@work@home"@example.com'],

  // RFC 2822 - parse() behavior with list input (parse expects single address)
  [
    "list with comma - takes first address",
    "alice@example.com, bob@example.com",
    "",
    "alice@example.com, bob@example.com",
  ],
  [
    "list with semicolon - takes first address",
    "alice@example.com; bob@example.com",
    "",
    "alice@example.com; bob@example.com",
  ],
  ["list with names comma-separated", "Alice <alice@example.com>, Bob <bob@example.com>", "Alice", "bob@example.com"],
  [
    "list with names semicolon-separated",
    "Alice <alice@example.com>; Bob <bob@example.com>",
    "Alice",
    "bob@example.com",
  ],
  ["trailing comma after address", "user@example.com,", "", "user@example.com,"],
  ["trailing semicolon after address", "user@example.com;", "", "user@example.com;"],
  [
    "comma in quoted name with list",
    '"Doe, John" <john@example.com>, jane@example.com',
    "Doe, John",
    "john@example.com",
  ],

  // Display name edge cases
  ["display name with dots", "Dr. J. Smith <j.smith@example.com>", "Dr. J. Smith", "j.smith@example.com"],
  ["display name with hyphen", "Mary-Jane Watson <mj@example.com>", "Mary-Jane Watson", "mj@example.com"],
  ["display name with numbers", "User 123 <user123@example.com>", "User 123", "user123@example.com"],
  ["display name only quotes no space", '"JohnDoe"<john@example.com>', "JohnDoe", "john@example.com"],

  // Whitespace edge cases
  ["CRLF in display name", "John\r\nDoe <john@example.com>", "John Doe", "john@example.com"],
  ["multiple spaces around angle brackets", "John   <   john@example.com   >", "John", "john@example.com"],

  // Malformed/unusual angle bracket scenarios
  ["unclosed angle bracket", "John <john@example.com", "", "John <john@example.com"],
  ["unopened angle bracket", "John john@example.com>", "", "John john@example.com>"],
  ["nested angle brackets", "John <<john@example.com>>", "John", "<john@example.com"],
  ["multiple angle bracket pairs", "John <first@example.com> <second@example.com>", "John", "second@example.com"],
  ["empty angle brackets", "John <> <john@example.com>", "John", "john@example.com"],

  // Quote edge cases
  ["unmatched opening quote in name", '"John Doe <john@example.com>', '"John Doe', "john@example.com"],
  ["empty quoted string in name", '"" <john@example.com>', "", "john@example.com"],
  ["only quotes in name", '""<john@example.com>', "", "john@example.com"],
  // eslint-disable-next-line prettier/prettier
  ["mixed quotes in name", "\"John' Doe\" <john@example.com>", "John' Doe", "john@example.com"],

  // Special Unicode scenarios (beyond basic accents)
  ["emoji in display name", "John 😀 Doe <john@example.com>", "John 😀 Doe", "john@example.com"],
  ["RTL characters in name", "משה כהן <moshe@example.com>", "משה כהן", "moshe@example.com"],
  ["mixed scripts in name", "John Müller 田中 <john@example.com>", "John Müller 田中", "john@example.com"],

  // Boundary cases for local-part length (RFC 5321 limits to 64 chars)
  ["max length local-part (64 chars)", `${"a".repeat(64)}@example.com`, "", `${"a".repeat(64)}@example.com`],
  ["over max local-part (65 chars)", `${"a".repeat(65)}@example.com`, "", `${"a".repeat(65)}@example.com`],

  // Parentheses edge cases (RFC 2822 comments)
  ["only parentheses as name", "(comment) <john@example.com>", "(comment)", "john@example.com"],
  ["nested parentheses deep", "John (a (b (c))) <john@example.com>", "John (a (b (c)))", "john@example.com"],
  ["unclosed parenthesis", "John (comment <john@example.com>", "John (comment", "john@example.com"],

  // Square brackets in display name (not domain literal)
  ["square brackets in name", "John [Admin] <john@example.com>", "John [Admin]", "john@example.com"],
  ["unclosed square bracket in name", "John [Admin <john@example.com>", "John [Admin", "john@example.com"],

  // Null and control characters
  ["null byte in input", "John\x00Doe <john@example.com>", "John\x00Doe", "john@example.com"],
  ["tab between name and bracket", "John\t<john@example.com>", "John", "john@example.com"],

  // Real-world edge cases from email clients
  ["Outlook style with quotes", '"john@example.com" <john@example.com>', "john@example.com", "john@example.com"],
  ["Gmail style reply-to", "John Doe via Service <noreply@service.com>", "John Doe via Service", "noreply@service.com"],
  ["plus addressing (subaddressing)", "user+folder@example.com", "", "user+folder@example.com"],
  ["disposable email pattern", "user+trash123@example.com", "", "user+trash123@example.com"],

  // Non-breaking space handling (collapseWhitespace handles \xa0)
  ["non-breaking space in name", "John\xa0Doe <john@example.com>", "John Doe", "john@example.com"],
  ["multiple non-breaking spaces", "John\xa0\xa0Doe <john@example.com>", "John Doe", "john@example.com"],
  ["mixed regular and non-breaking spaces", "John \xa0 Doe <john@example.com>", "John Doe", "john@example.com"],

  // Quote stripping edge cases (stripQuotes only strips matching pairs)
  ["mismatched quotes single-double", "'John Doe\" <john@example.com>", "'John Doe\"", "john@example.com"],
  ["mismatched quotes double-single", "\"John Doe' <john@example.com>", "\"John Doe'", "john@example.com"],
  ["nested double quotes", '"John "Nick" Doe" <john@example.com>', 'John "Nick" Doe', "john@example.com"],
  ["nested single quotes", "'John 'Nick' Doe' <john@example.com>", "John 'Nick' Doe", "john@example.com"],
  ["single quotes preserved inside double", '"John\'s Name" <john@example.com>', "John's Name", "john@example.com"],

  // Escaped character handling in names
  ["escaped backslash in name", '"John\\\\Doe" <john@example.com>', "John\\Doe", "john@example.com"],
  ["escaped quote in name", '"John\\"Doe" <john@example.com>', 'John"Doe', "john@example.com"],
  ["multiple escaped quotes", '"A\\"B\\"C" <john@example.com>', 'A"B"C', "john@example.com"],
  ["escaped backslash before quote", '"John\\\\\\"Doe" <john@example.com>', 'John\\"Doe', "john@example.com"],

  // Interleaved bracket types in name
  ["parentheses inside quotes", '"John (Nick) Doe" <john@example.com>', "John (Nick) Doe", "john@example.com"],
  ["angle brackets inside quotes", '"John <Nick> Doe" <john@example.com>', "John <Nick> Doe", "john@example.com"],
  ["square brackets inside parentheses", "John ([Admin]) <john@example.com>", "John ([Admin])", "john@example.com"],
  ["quotes inside parentheses", 'John ("Nick") <john@example.com>', 'John ("Nick")', "john@example.com"],

  // Bidi markers (TODO in code - should be stripped but aren't currently)
  ["left-to-right mark in name", "John\u200eDoe <john@example.com>", "John\u200eDoe", "john@example.com"],
  ["right-to-left mark in name", "John\u200fDoe <john@example.com>", "John\u200fDoe", "john@example.com"],
  ["bidi embedding", "\u202aJohn Doe\u202c <john@example.com>", "\u202aJohn Doe\u202c", "john@example.com"],

  // Address-in-name fallback (when no angle brackets but @ present)
  ["@ in name without brackets - becomes address", "john@example.com extra text", "", "john@example.com extra text"],
  ["multiple @ without brackets", "a@b.com c@d.com", "", "a@b.com c@d.com"],

  // Edge cases for angle bracket content
  ["only @ inside angle brackets", "Name <@>", "Name", "@"],
  ["spaces only inside angle brackets", "Name <   >", "Name", ""],
  ["newline inside angle brackets", "Name <john@\nexample.com>", "Name", "john@ example.com"],

  // Very long inputs
  [
    "very long email address",
    `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.com`,
    "",
    `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.com`,
  ],

  // Special token boundary cases
  ["quote at end of string", 'John Doe"', 'John Doe"', ""],
  ["angle bracket at end of string", "John Doe<", "John Doe<", ""],
  ["parenthesis at end of string", "John Doe(", "John Doe(", ""],
  ["consecutive openers", '"(<[test', '"(<[test', ""],

  // Escaped quotes outside quoted strings (unquoted context)
  ["escaped quote in unquoted name", 'a\\"test <john@example.com>', 'a"test', "john@example.com"],
  ["escaped quote at start of name", '\\"test <john@example.com>', '"test', "john@example.com"],
  ["escaped quote before @ no brackets", 'a\\"@test.com', "", 'a\\"@test.com'],
  ["escaped quote at start before @ no brackets", '\\"@test.com', "", '\\"@test.com'],

  // Mixed escaped and unescaped quotes (complex scenarios)
  ["escaped then unescaped quote with brackets", '\\"asdf" <john@example.com>', '"asdf"', "john@example.com"],
  ["unescaped quote then escaped quote no brackets", 'a"test\\"@test.com', "", 'a"test\\"@test.com'],
];

/**
 * Test scenarios for extractParts() function
 * Format: [description, input, expectedName, expectedEmail]
 */
export const extractPartsScenarios = [
  ["name and email with angle brackets", "John <john@example.com>", "John ", "john@example.com"],
  ["email only when no brackets but @ present", "john@example.com", "", "john@example.com"],
  ["name only when no brackets and no @", "John Doe", "John Doe", ""],
  [
    "uses last angle bracket pair for email",
    "John <first@example.com> <second@example.com>",
    "John ",
    "second@example.com",
  ],
  ["empty string", "", "", ""],
];

/**
 * Test scenarios for findAngleBracketPairs() function
 * Format: [description, input, expectedPairs]
 */
export const findAngleBracketPairsScenarios = [
  ["single angle bracket pair", "Name <email>", [{ start: 5, end: 11 }]],
  [
    "multiple angle bracket pairs",
    "<a> <b>",
    [
      { start: 0, end: 2 },
      { start: 4, end: 6 },
    ],
  ],
  ["skips angle brackets inside quotes", '"<skip>" <use>', [{ start: 9, end: 13 }]],
  ["skips escaped quotes", '\\"test <email>', [{ start: 7, end: 13 }]],
  ["empty array when no pairs", "no brackets", []],
  ["unclosed angle bracket", "Name <email", []],
];

/**
 * Test scenarios for findClosingQuote() function
 * Format: [description, input, openingPosition, expectedPosition]
 */
export const findClosingQuoteScenarios = [
  ["finds closing quote", '"test"', 0, 5],
  ["skips escaped quotes", '"test\\"more"', 0, 11],
  ["returns -1 when no closing quote", '"unclosed', 0, -1],
  ["handles escaped backslash before quote", '"test\\\\"', 0, 7],
  ["finds quote from middle position", 'skip "test"', 5, 10],
];

/**
 * Test scenarios for cleanName() function
 * Format: [description, input, expected]
 */
export const cleanNameScenarios = [
  ["collapses whitespace", "John   Doe", "John Doe"],
  ["strips outer double quotes", '"John Doe"', "John Doe"],
  ["strips outer single quotes", "'John Doe'", "John Doe"],
  ["unescapes quotes", 'John\\"Doe', 'John"Doe'],
  ["unescapes backslashes", "John\\\\Doe", "John\\Doe"],
  ["trims whitespace", "  John Doe  ", "John Doe"],
  ["handles non-breaking spaces", "John\xa0Doe", "John Doe"],
  ["empty string", "", ""],
];
