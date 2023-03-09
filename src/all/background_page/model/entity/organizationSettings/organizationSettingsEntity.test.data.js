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
      "url": "http://127.0.0.1:3001",
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
      "edition": "ce",
      "plugins": {
        "jwtAuthentication": {
          "enabled": true
        },
        "accountRecoveryRequestHelp": {
          "enabled": true
        },
        "selfRegistration": {
          "enabled": true
        },
        "inFormIntegration": {
          "enabled": true
        },
        "locale": {
          "options": [
            {
              "locale": "de-DE",
              "label": "Deutsch"
            },
            {
              "locale": "en-UK",
              "label": "English"
            },
            {
              "locale": "es-ES",
              "label": "Espa\u00f1ol"
            },
            {
              "locale": "fr-FR",
              "label": "Fran\u00e7ais"
            },
            {
              "locale": "it-IT",
              "label": "Italiano (beta)"
            },
            {
              "locale": "ja-JP",
              "label": "\u65e5\u672c\u8a9e"
            },
            {
              "locale": "ko-KR",
              "label": "\ud55c\uad6d\uc5b4 (beta)"
            },
            {
              "locale": "lt-LT",
              "label": "Lietuvi\u0173"
            },
            {
              "locale": "nl-NL",
              "label": "Nederlands"
            },
            {
              "locale": "pl-PL",
              "label": "Polski"
            },
            {
              "locale": "pt-BR",
              "label": "Portugu\u00eas Brasil (beta)"
            },
            {
              "locale": "ro-RO",
              "label": "Rom\u00e2n\u0103 (beta)"
            },
            {
              "locale": "sv-SE",
              "label": "Svenska"
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

export const defaultCeOrganizationSettings = siteSettings => {
  const defaultData = anonymousOrganizationSettings();
  defaultData.app = {
    "url": "http://127.0.0.1:3001",
    "locale": "en-UK",
    "version": {
      "number": "3.11.0",
      "name": "Regular"
    },
    "server_timezone": "UTC",
    "session_timeout": 24,
    "image_storage": {
      "public_path": "img\/public\/"
    }
  };
  defaultData.passbolt.plugins = Object.assign(defaultData.passbolt.plugins, {
    "export": {
      "version": "2.0.0",
      "enabled": true
    },
    "import": {
      "version": "2.0.1",
      "enabled": true,
      "config": {
        "format": [
          "kdbx",
          "csv"
        ]
      }
    },
    "previewPassword": {
      "enabled": true
    },
    "resourceTypes": {
      "version": "1.0.0",
      "enabled": true
    },
    "mobile": {
      "version": "1.0.0",
      "enabled": true
    },
    "smtpSettings": {
      "version": "1.0.0",
      "enabled": true
    },
    "accountSettings": {
      "version": "1.0.0"
    },
    "emailNotificationSettings": {
      "version": "1.1.0",
      "enabled": true
    },
    "emailDigest": {
      "version": "1.0.0",
      "enabled": true
    },
    "reports": {
      "version": "1.0.0",
      "enabled": true
    },
    "passwordGenerator": {
      "version": "3.3.0",
      "enabled": true
    },
    "multiFactorAuthentication": {
      "version": "1.1.0",
      "enabled": true
    },
    "log": {
      "version": "1.0.1",
      "enabled": true
    }
  });
  return Object.assign(defaultData, siteSettings);
};

export const defaultProOrganizationSettings = siteSettings => {
  const defaultData = defaultCeOrganizationSettings();
  defaultData.passbolt.edition = "pro";
  defaultData.passbolt.plugins = Object.assign(defaultData.passbolt.plugins, {
    "accountRecoveryRequestHelp": {
      "enabled": true
    },
    "accountRecovery": {
      "version": "1.0.0",
      "enabled": true
    },
    "sso": {
      "version": "1.0.0",
      "enabled": true
    },
    "mfaPolicies": {
      "version": "1.0.0",
      "enabled": true
    },
    "ssoRecover": {
      "enabled": false
    },
    "ee": {
      "version": "2.0.0"
    },
    "directorySync": {
      "version": "1.0.0"
    },
    "tags": {
      "version": "1.0.1",
      "enabled": true
    },
    "folders": {
      "version": "2.0.0",
      "enabled": true
    }
  });

  return Object.assign(defaultData, siteSettings);
};

export const customEmailValidationProOrganizationSettings = siteSettings => {
  const defaultData = defaultProOrganizationSettings();
  defaultData.passbolt.email = {
    "validate": {
      "regex": "\/.*@passbolt.(c|com)$\/"
    }
  };

  return Object.assign(defaultData, siteSettings);
};
