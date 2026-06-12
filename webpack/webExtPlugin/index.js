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
 * @since         5.12.0
 *
 * Local webpack plugin that runs `web-ext build` once all configs in a
 * MultiCompiler have finished emitting, producing a ready-to-load .zip
 * archive of `build/all/` (no store signature applied).
 *
 * Before zipping, asserts that every path in `expectedFiles` exists under
 * `sourceDir` and throws otherwise. This guards against output-cleanup
 * races (see `webpack/applyOutputClean.js`) where a parent config's clean
 * could wipe a nested child config's output, silently producing an
 * incomplete archive.
 *
 * Brought in-house and trimmed for our needs from:
 *   https://github.com/HaNdTriX/web-ext-webpack-plugin (MPL-2.0)
 *
 * `web-ext` is ESM-only since v8; loaded via dynamic import from this CJS
 * module.
 */
const fs = require("fs");
const path = require("path");

const PLUGIN_NAME = "WebExtPlugin";

class WebExtPlugin {
  constructor({ sourceDir, artifactsDir, filename, expectedCount = 1, expectedFiles = [] }) {
    this.sourceDir = sourceDir;
    this.artifactsDir = artifactsDir;
    this.filename = filename;
    this.expectedCount = expectedCount;
    this.expectedFiles = expectedFiles;
    this.completedCount = 0;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async () => {
      this.completedCount += 1;
      if (this.completedCount < this.expectedCount) {
        return;
      }
      // Reset for watch-mode rebuilds.
      this.completedCount = 0;

      const missing = this.expectedFiles.filter((rel) => !fs.existsSync(path.join(this.sourceDir, rel)));
      if (missing.length > 0) {
        throw new Error(
          `${PLUGIN_NAME}: expected build artifacts missing under ${this.sourceDir}:\n  - ${missing.join("\n  - ")}`,
        );
      }

      const { default: webExt } = await import("web-ext");
      await webExt.cmd.build(
        {
          sourceDir: this.sourceDir,
          artifactsDir: this.artifactsDir,
          overwriteDest: true,
          filename: this.filename,
        },
        { shouldExitProgram: false },
      );
    });
  }
}

module.exports = WebExtPlugin;
