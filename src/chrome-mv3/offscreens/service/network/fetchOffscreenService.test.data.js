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
 * @since         4.7.0
 */
import {fetchOptionsHeaders} from "../../../serviceWorker/service/network/requestFetchOffscreenService.test.data";
import {SEND_MESSAGE_TARGET_FETCH_OFFSCREEN} from "./fetchOffscreenService";

export const defaultFetchMessage = message => ({
  target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN,
  data: {
    id: crypto.randomUUID(),
    resource: "https://www.passbolt.test/settings.json?api-version=v2",
    options: {
      credentials: "include",
      headers: fetchOptionsHeaders(),
      body: {
        prop1: "value 1",
        prop2: "value 2"
      }
    }
  },
  ...message
});

export const defaultFetchResponse = () => (new Response(
  "{\n    \"header\": {\n        \"id\": \"0682ab8f-ecba-4336-a628-8b6cac609f49\",\n        \"status\": \"success\",\n        \"servertime\": 1713863028,\n        \"action\": \"bef9f3ca-86ef-5c6a-9b38-320e03ceb5df\",\n        \"message\": \"The operation was successful.\",\n        \"url\": \"\\/settings.json?api-version=v2\",\n        \"code\": 200\n    },\n    \"body\": {\n        \"app\": {\n            \"url\": \"https:\\/\\/www.passbolt.test\\/\",\n            \"locale\": \"en-UK\"\n        },\n        \"passbolt\": {\n            \"legal\": {\n                \"privacy_policy\": {\n                    \"url\": \"\"\n                },\n                \"terms\": {\n                    \"url\": \"https:\\/\\/www.passbolt.com\\/terms\"\n                }\n            },\n            \"edition\": \"pro\",\n            \"plugins\": {\n                \"jwtAuthentication\": {\n                    \"enabled\": true\n                },\n                \"accountRecoveryRequestHelp\": {\n                    \"enabled\": true\n                },\n                \"accountRecovery\": {\n                    \"enabled\": true\n                },\n                \"selfRegistration\": {\n                    \"enabled\": true\n                },\n                \"sso\": {\n                    \"enabled\": true\n                },\n                \"mfaPolicies\": {\n                    \"enabled\": true\n                },\n                \"ssoRecover\": {\n                    \"enabled\": true\n                },\n                \"userPassphrasePolicies\": {\n                    \"enabled\": true\n                },\n                \"inFormIntegration\": {\n                    \"enabled\": true\n                },\n                \"locale\": {\n                    \"options\": [\n                        {\n                            \"locale\": \"de-DE\",\n                            \"label\": \"Deutsch\"\n                        },\n                        {\n                            \"locale\": \"en-UK\",\n                            \"label\": \"English\"\n                        },\n                        {\n                            \"locale\": \"es-ES\",\n                            \"label\": \"Espa\\u00f1ol\"\n                        },\n                        {\n                            \"locale\": \"fr-FR\",\n                            \"label\": \"Fran\\u00e7ais\"\n                        },\n                        {\n                            \"locale\": \"it-IT\",\n                            \"label\": \"Italiano (beta)\"\n                        },\n                        {\n                            \"locale\": \"ja-JP\",\n                            \"label\": \"\\u65e5\\u672c\\u8a9e\"\n                        },\n                        {\n                            \"locale\": \"ko-KR\",\n                            \"label\": \"\\ud55c\\uad6d\\uc5b4 (beta)\"\n                        },\n                        {\n                            \"locale\": \"lt-LT\",\n                            \"label\": \"Lietuvi\\u0173\"\n                        },\n                        {\n                            \"locale\": \"nl-NL\",\n                            \"label\": \"Nederlands\"\n                        },\n                        {\n                            \"locale\": \"pl-PL\",\n                            \"label\": \"Polski\"\n                        },\n                        {\n                            \"locale\": \"pt-BR\",\n                            \"label\": \"Portugu\\u00eas Brasil (beta)\"\n                        },\n                        {\n                            \"locale\": \"ro-RO\",\n                            \"label\": \"Rom\\u00e2n\\u0103 (beta)\"\n                        },\n                        {\n                            \"locale\": \"ru-RU\",\n                            \"label\": \"P\\u0443\\u0441\\u0441\\u043a\\u0438\\u0439 (beta)\"\n                        },\n                        {\n                            \"locale\": \"sv-SE\",\n                            \"label\": \"Svenska\"\n                        }\n                    ]\n                },\n                \"rememberMe\": {\n                    \"options\": {\n                        \"300\": \"5 minutes\",\n                        \"900\": \"15 minutes\",\n                        \"1800\": \"30 minutes\",\n                        \"3600\": \"1 hour\",\n                        \"-1\": \"until I log out\"\n                    }\n                }\n            }\n        }\n    }\n}",
  {
    "status": 200,
    "statusText": "OK",
    "headers": [
      [
        "access-control-expose-headers",
        "X-GPGAuth-Verify-Response, X-GPGAuth-Progress, X-GPGAuth-User-Auth-Token, X-GPGAuth-Authenticated, X-GPGAuth-Refer, X-GPGAuth-Debug, X-GPGAuth-Error, X-GPGAuth-Pubkey, X-GPGAuth-Logout-Url, X-GPGAuth-Version"
      ],
      [
        "cache-control",
        "no-store, no-cache, must-revalidate"
      ],
      [
        "content-security-policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'self' https://*.duosecurity.com;"
      ],
      [
        "content-type",
        "application/json"
      ],
      [
        "date",
        "Tue, 23 Apr 2024 09:03:48 GMT"
      ],
      [
        "expires",
        "Thu, 19 Nov 1981 08:52:00 GMT"
      ],
      [
        "pragma",
        "no-cache"
      ],
      [
        "referrer-policy",
        "same-origin"
      ],
      [
        "server",
        "nginx/1.24.0 (Ubuntu)"
      ],
      [
        "x-content-type-options",
        "nosniff"
      ],
      [
        "x-download-options",
        "noopen"
      ],
      [
        "x-frame-options",
        "sameorigin"
      ],
      [
        "x-gpgauth-authenticated",
        "false"
      ],
      [
        "x-gpgauth-debug",
        "There is no user associated with this key. No key id set."
      ],
      [
        "x-gpgauth-error",
        "true"
      ],
      [
        "x-gpgauth-login-url",
        "/auth/login"
      ],
      [
        "x-gpgauth-logout-url",
        "/auth/logout"
      ],
      [
        "x-gpgauth-progress",
        "stage0"
      ],
      [
        "x-gpgauth-pubkey-url",
        "/auth/verify.json"
      ],
      [
        "x-gpgauth-verify-url",
        "/auth/verify"
      ],
      [
        "x-gpgauth-version",
        "1.3.0"
      ],
      [
        "x-permitted-cross-domain-policies",
        "all"
      ]
    ],
    "redirected": false,
    "url": "https://www.passbolt.test/settings.json?api-version=v2",
    "ok": true,
  }
));
