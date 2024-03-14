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
 * @since         4.5.0
 */

export const defaultTotpQrCodeData = (props = {}) => {
  const data = {
    otpProvisioningUri: "otpauth://totp/www.passbolt.local:admin%40passbolt.com?issuer=www.passbolt.local&secret=TVWEGQFS3WPCID6GYAPHHCC54VXHFUL7EC5FVHEMVH7CKQI2XEQQ",
  };
  return Object.assign(data, props);
};
