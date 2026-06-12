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
 */
const { defineConfig } = require('i18next-cli');

module.exports = defineConfig({
  locales: ['en-UK'],
  extract: {
    input: ['src/all/**/*.{js,jsx}'],
    output: 'src/all/locales/{{language}}/{{namespace}}.json',
    functions: ['t', '*.t', 'translate', '*.translate'],
    defaultNS: 'common',
    keySeparator: false,
    nsSeparator: false,
    sort: true,
    defaultValue: key => key,
  },
});
