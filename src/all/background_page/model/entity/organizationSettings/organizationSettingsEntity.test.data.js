/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import OrganizationSettingsEntity from "./organizationSettingsEntity";

export const anonymousOrganizationSettings = (data = {}) => {
  const defaultData = {
    "status": OrganizationSettingsEntity.ORGANIZATION_ENABLED,
    "app": {
      "url": "https:\/\/passbolt.local\/",
      "locale": "en-UK"
    },
    "passbolt": {
      "legal": {
        "privacy_policy": {
          "url": ""
        },
        "terms": {
          "url": "https:\/\/www.passbolt.com\/terms"
        }
      },
      "edition": "pro",
      "registration": {
        "public": true
      },
      "plugins": {
        "accountRecovery": {
          "enabled": true
        },
        "inFormIntegration": {
          "enabled": true
        },
        "locale": {
          "options": [
            {
              locale: "de-DE",
              label: "Deutsch"
            }, {
              locale: "en-UK",
              label: "English"
            }, {
              locale: "es-ES",
              label: "Español"
            }, {
              locale: "fr-FR",
              label: "Français"
            }, {
              locale: "ja-JP",
              label: "日本語"
            }, {
              locale: "lt-LT",
              label: "Lietuvių"
            }, {
              locale: "nl-NL",
              label: "Nederlands"
            }, {
              locale: "pl-PL",
              label: "Polski"
            }, {
              locale: "sv-SE",
              label: "Svenska"
            }
          ]
        },
        "rememberMe": {
          "options": {
            "300": "5 minutes",
            "900": "15 minutes",
            "1800": "30 minutes",
            "3600": "1 hour",
            "-1": "until I log out"
          }
        }
      }
    }
  };

  return Object.assign(defaultData, data);
};
