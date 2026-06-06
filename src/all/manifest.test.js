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
 * @since         5.12.2
 */

import fs from "fs";
import path from "path";

const manifestFixtures = [
  {
    label: "chrome manifest",
    manifestPath: "src/chrome/manifest.json",
    getCsp: (manifest) => manifest.content_security_policy,
  },
  {
    label: "chrome mv3 manifest",
    manifestPath: "src/chrome-mv3/manifest.json",
    getCsp: (manifest) => manifest.content_security_policy.extension_pages,
  },
  {
    label: "firefox manifest",
    manifestPath: "src/firefox/manifest.json",
    getCsp: (manifest) => manifest.content_security_policy,
  },
  {
    label: "safari manifest",
    manifestPath: "src/safari/manifest.json",
    getCsp: (manifest) => manifest.content_security_policy,
  },
];

const readManifest = (manifestPath) => {
  const absolutePath = path.join(process.cwd(), manifestPath);
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
};

const getDirectiveValue = (csp, directiveName) =>
  csp
    .split(";")
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith(`${directiveName} `));

describe("Extension manifests", () => {
  it.each(manifestFixtures)("keeps blob: enabled in img-src for $label", ({ manifestPath, getCsp }) => {
    expect.assertions(1);

    const manifest = readManifest(manifestPath);
    const csp = getCsp(manifest);
    const imgSrcDirective = getDirectiveValue(csp, "img-src");

    expect(imgSrcDirective).toContain("blob:");
  });
});
