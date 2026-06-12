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
 * Local webpack plugin that runs i18next-cli's extractor before each compilation.
 * Hooked on `beforeRun` (one-shot builds) and `watchRun` (watch mode rebuilds) so
 * that subsequent CopyWebpackPlugin invocations see the freshly-generated locale
 * files in `src/all/locales/<lang>/<ns>.json`.
 */
const { runExtractor } = require('i18next-cli');
const i18nextConfig = require('../i18next.config');

const PLUGIN_NAME = 'I18nextExtractionPlugin';

const runExtraction = async () => {
  const { hasErrors } = await runExtractor(i18nextConfig, { quiet: true });
  if (hasErrors) {
    throw new Error('i18next-cli extraction reported errors');
  }
};

class I18nextExtractionPlugin {
  apply(compiler) {
    const tap = (compilation, callback) => {
      runExtraction()
        .then(() => callback())
        .catch(callback);
    };
    compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, tap);
    compiler.hooks.watchRun.tapAsync(PLUGIN_NAME, tap);
  }
}

module.exports = I18nextExtractionPlugin;
