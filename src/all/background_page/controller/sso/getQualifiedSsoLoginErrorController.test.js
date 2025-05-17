/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import '../../../../../test/mocks/mockSsoDataStorage';
import {clientSsoKit} from '../../model/entity/sso/ssoKitClientPart.test.data';
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import GetQualifiedSsoLoginErrorController from './getQualifiedSsoLoginErrorController';
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../test/mocks/mockApiResponse';
import AzureSsoSettingsEntity from 'passbolt-styleguide/src/shared/models/entity/ssoSettings/AzureSsoSettingsEntity';
import GoogleSsoSettingsEntity from 'passbolt-styleguide/src/shared/models/entity/ssoSettings/GoogleSsoSettingsEntity';
import SsoDisabledError from '../../error/ssoDisabledError';
import SsoProviderMismatchError from '../../error/ssoProviderMismatchError';

beforeAll(() => {
  enableFetchMocks();
});

describe("GetQualifiedSsoLoginErrorController", () => {
  it('Should return an Error (unexpected) if the user has not a local SSO kit', async() => {
    expect.assertions(1);
    SsoDataStorage.setMockedData(null);
    fetch.doMockOnce(() => mockApiResponse({provider: AzureSsoSettingsEntity.PROVIDER_ID}));

    const controller = new GetQualifiedSsoLoginErrorController(null, null, defaultApiClientOptions());
    const result = await controller.exec();

    expect(result).toStrictEqual(new Error("Unexpected SSO Login error"));
  });

  it("Should return an Error (unexpected) if the user's SSO kit provider is matching the API's one", async() => {
    expect.assertions(1);
    SsoDataStorage.setMockedData(await clientSsoKit({provider: AzureSsoSettingsEntity.PROVIDER_ID}));
    fetch.doMockOnce(() => mockApiResponse({provider: AzureSsoSettingsEntity.PROVIDER_ID}));

    const controller = new GetQualifiedSsoLoginErrorController(null, null, defaultApiClientOptions());
    const result = await controller.exec();

    expect(result).toStrictEqual(new Error("Unexpected SSO Login error"));
  });

  it("Should return an SsoDisabledError", async() => {
    expect.assertions(1);
    SsoDataStorage.setMockedData(await clientSsoKit({provider: AzureSsoSettingsEntity.PROVIDER_ID}));
    fetch.doMockOnce(() => mockApiResponse({provider: null}));

    const controller = new GetQualifiedSsoLoginErrorController(null, null, defaultApiClientOptions());
    const result = await controller.exec();

    expect(result).toStrictEqual(new SsoDisabledError("The SSO is disabled"));
  });

  it("Should return an SsoProviderMismatchError", async() => {
    expect.assertions(1);
    SsoDataStorage.setMockedData(await clientSsoKit({provider: GoogleSsoSettingsEntity.PROVIDER_ID}));
    fetch.doMockOnce(() => mockApiResponse({provider: AzureSsoSettingsEntity.PROVIDER_ID}));

    const controller = new GetQualifiedSsoLoginErrorController(null, null, defaultApiClientOptions());
    const result = await controller.exec();

    expect(result).toStrictEqual(new SsoProviderMismatchError("The request SSO provider is not corresponding to the configured one", AzureSsoSettingsEntity.PROVIDER_ID));
  });
});
