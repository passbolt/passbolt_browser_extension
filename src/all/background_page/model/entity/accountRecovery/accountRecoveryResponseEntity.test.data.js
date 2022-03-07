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

import {v4 as uuidv4} from "uuid";
import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";

/**
 * The Test Account Recovery Request gpg key is used to encrypt the private key password
 * Clear text password: 3f28361aa774a5767fbe70ecd09b2fbbf1d5b4b493fe171089436bfa6a2eb03fe630fa9f2483c59b68e20616f1a7597ff8d058a6f79d228a4181d71a61f80d98
 */
export const createAcceptedAccountRecoveryResponseDto = data => {
  const defaultData = {
    "account_recovery_request_id": uuidv4(),
    "responder_foreign_key": uuidv4(),
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "status": "approved",
  };

  return Object.assign(defaultData, data || {});
};

export const createRejectedAccountRecoveryResponseDto = data => {
  const defaultData = {
    "account_recovery_request_id": uuidv4(),
    "responder_foreign_key": uuidv4(),
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "status": "rejected",
  };

  return Object.assign(defaultData, data || {});
};

export const acceptedAccountRecoveryResponseDto = data => {
  const defaultData = createAcceptedAccountRecoveryResponseDto({
    "id": uuidv4(),
    "data": "-----BEGIN PGP MESSAGE-----\n\nhQGMA28jNnDWObePAQv6A4mEoHvefNOoSOEiiguPH72H74pUUPUxcZVrZt/1JkvM\nFd3udwDbGKhgkP74+qvVgh7RedcbTzpkQ5WINjSWQVrM821VyOwzPtM42t/z3piE\nam1WdIG/qb3S9D6ai4OOe06oXxrSNWH2qTSZlKgl7m+RM9K4a0k2BrAuMDcR+Sj3\nltvMOLm3k/bl4H5g/0OBxEkA2ivYEhi7BSv83wwghNo4tFJWAlV5ebvqCyhdFoHq\n1AM/yGZ91MIHAuYv1vp2NCSlVikzFYwjR6B2lCOeWbS0XIO/Fsf163U9eLxsdgyq\ngE4tjz/sD3qwapjMpubPGaZ5XFdK4oyY54brUtQ7ENlalH2jJixxCUEPM7d8jpM5\nTXi1vVdfcPMu+5eZZREwkMHC/WMZKROgkBQ4Q5hUEaqjJOwhuSz7CTB049vg6OiK\nGxM5EVC4mVT7106E36Fvj3bAgCKSvobOfR46EpxQmGUvRTnrthCVcKZVFtgYcXpd\nY17Ocagj5da9lDyl9zSY0ukBANTcCzi5hrBxChBIwvECNuFuqRMQfXi3pdfoN49P\nmCTMi5HrAtT1o17bKjuYL4MSjOboLoh2KZF5OOKQnuAFpMOHpOHD6DgaEdsXP1sn\nXkQCAo/W/7LK25Fo2sGK9GwO2Fqzu8mapaPfEJ+es35lVoQRrf0YQatw+7c4wjAE\nvTeWgCvkV+rAUMEIMGNqQbVVzVentwBrPHXLi6bJNbSdmPueTlnH2TwRja40gFTP\nxUk1oQN60QlyGkQZIWxqPrVdHWBnRdEklYGJXzCkahcvejmww6glVGtBBEiip1S7\noo2HYKtq3JkgAcGPb4BD5yPSBIapMlb7E62SdxFwwXvAHboy2D5NeHmoFijAiBJp\nBE1R1Oe9FG3gb1uKNws9UCwVlaXR9VxY2eSKWfMwqA4McWvTyaL4BtrZWWhu9vR/\nMwPHnBP4yUdRO8vyDJGIsWCEey8n29Hr5rcMu7kFWc3WQcRxFaK/Sam/i555w7sL\nSe3NU68nWXkidCQ2D2T2iYmRP0CsF6FKTQwj5pbCR6ZWTtsbtt4FztfKSvU5osEJ\nz5BqmIYOIfA5/cOyqn6XYnBaII3SzIwBUuqUlbaBEmSCif7NbjAjrfqcTgbHc7+h\nFz64XbPFwo0sxA2KGiJg2sXOU6blT7O6ESwfCtES8WvxR6rs5YDXumu7CtRtfp+Z\nIsBNVTo+9sO9CAZaXDiNITgUyyAkWeN8PsF3eXWtNHR0kBwMJZQyFjC7/IJ7h+l2\na45lUA9FaIvENcBet3baErOgXhECNaBJoD2LMG1jbX4ecHP8V0k9O4N7E/frZGIz\n/h50rZYW2BCQBxd6KPLCnGd/fL7E7SIDR5pLydvpLXRoQIwjtjchhthwE2B23g8u\nqpZj5doXSJEOn3pUZXT0T6dHfIpzNiHzYDfOaZ5ZraEmkgdE5JU8BQPeDVj9Uo5H\npwv0E7Wn7d2OJWMxkholb4c/e6AeEcc9KZBWpiUpqvHUyIcJi6zaZtyhv/Dy1YMF\nj2inTdmOFExTERJm2Lsps5FQwvvh5QnG3ILuIyVFwKo=\n=sbxg\n-----END PGP MESSAGE-----\n",
    "created": "2020-05-04T20:31:45+00:00",
    "modified": "2020-05-04T20:31:45+00:00",
    "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
  });

  return Object.assign(defaultData, data || {});
};

export const rejectedAccountRecoveryResponseDto = data => {
  const defaultData = createRejectedAccountRecoveryResponseDto({
    "id": uuidv4(),
    "created": "2020-05-04T20:31:45+00:00",
    "modified": "2020-05-04T20:31:45+00:00",
    "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
  });

  return Object.assign(defaultData, data || {});
};

exports.AccountRecoveryRequestEntityTestData = {
  "default": {
    "id": "d4c0e643-3967-443b-93b3-102d902c4510",
    "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
    "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "data": pgpKeys.ada.public,
    "status": "approved",
    "created": "2020-05-04T20:31:45+00:00",
    "modified": "2020-05-04T20:31:45+00:00",
    "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
  },
  "minimal": {
    "id": "d4c0e643-3967-443b-93b3-102d902c4510",
    "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
    "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "status": "rejected"
  }
};
