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

/**
 * The Test Account Recovery Request gpg key is used to encrypt the private key password
 * Clear text password: 3f28361aa774a5767fbe70ecd09b2fbbf1d5b4b493fe171089436bfa6a2eb03fe630fa9f2483c59b68e20616f1a7597ff8d058a6f79d228a4181d71a61f80d98
 */
export const createAcceptedAccountRecoveryResponseDto = data => {
  const defaultData = {
    "account_recovery_request_id": uuidv4(),
    "responder_foreign_key": uuidv4(),
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    //"data": "-----BEGIN PGP MESSAGE-----\n\nhQGMA28jNnDWObePAQv6A4mEoHvefNOoSOEiiguPH72H74pUUPUxcZVrZt/1JkvM\nFd3udwDbGKhgkP74+qvVgh7RedcbTzpkQ5WINjSWQVrM821VyOwzPtM42t/z3piE\nam1WdIG/qb3S9D6ai4OOe06oXxrSNWH2qTSZlKgl7m+RM9K4a0k2BrAuMDcR+Sj3\nltvMOLm3k/bl4H5g/0OBxEkA2ivYEhi7BSv83wwghNo4tFJWAlV5ebvqCyhdFoHq\n1AM/yGZ91MIHAuYv1vp2NCSlVikzFYwjR6B2lCOeWbS0XIO/Fsf163U9eLxsdgyq\ngE4tjz/sD3qwapjMpubPGaZ5XFdK4oyY54brUtQ7ENlalH2jJixxCUEPM7d8jpM5\nTXi1vVdfcPMu+5eZZREwkMHC/WMZKROgkBQ4Q5hUEaqjJOwhuSz7CTB049vg6OiK\nGxM5EVC4mVT7106E36Fvj3bAgCKSvobOfR46EpxQmGUvRTnrthCVcKZVFtgYcXpd\nY17Ocagj5da9lDyl9zSY0ukBANTcCzi5hrBxChBIwvECNuFuqRMQfXi3pdfoN49P\nmCTMi5HrAtT1o17bKjuYL4MSjOboLoh2KZF5OOKQnuAFpMOHpOHD6DgaEdsXP1sn\nXkQCAo/W/7LK25Fo2sGK9GwO2Fqzu8mapaPfEJ+es35lVoQRrf0YQatw+7c4wjAE\nvTeWgCvkV+rAUMEIMGNqQbVVzVentwBrPHXLi6bJNbSdmPueTlnH2TwRja40gFTP\nxUk1oQN60QlyGkQZIWxqPrVdHWBnRdEklYGJXzCkahcvejmww6glVGtBBEiip1S7\noo2HYKtq3JkgAcGPb4BD5yPSBIapMlb7E62SdxFwwXvAHboy2D5NeHmoFijAiBJp\nBE1R1Oe9FG3gb1uKNws9UCwVlaXR9VxY2eSKWfMwqA4McWvTyaL4BtrZWWhu9vR/\nMwPHnBP4yUdRO8vyDJGIsWCEey8n29Hr5rcMu7kFWc3WQcRxFaK/Sam/i555w7sL\nSe3NU68nWXkidCQ2D2T2iYmRP0CsF6FKTQwj5pbCR6ZWTtsbtt4FztfKSvU5osEJ\nz5BqmIYOIfA5/cOyqn6XYnBaII3SzIwBUuqUlbaBEmSCif7NbjAjrfqcTgbHc7+h\nFz64XbPFwo0sxA2KGiJg2sXOU6blT7O6ESwfCtES8WvxR6rs5YDXumu7CtRtfp+Z\nIsBNVTo+9sO9CAZaXDiNITgUyyAkWeN8PsF3eXWtNHR0kBwMJZQyFjC7/IJ7h+l2\na45lUA9FaIvENcBet3baErOgXhECNaBJoD2LMG1jbX4ecHP8V0k9O4N7E/frZGIz\n/h50rZYW2BCQBxd6KPLCnGd/fL7E7SIDR5pLydvpLXRoQIwjtjchhthwE2B23g8u\nqpZj5doXSJEOn3pUZXT0T6dHfIpzNiHzYDfOaZ5ZraEmkgdE5JU8BQPeDVj9Uo5H\npwv0E7Wn7d2OJWMxkholb4c/e6AeEcc9KZBWpiUpqvHUyIcJi6zaZtyhv/Dy1YMF\nj2inTdmOFExTERJm2Lsps5FQwvvh5QnG3ILuIyVFwKo=\n=sbxg\n-----END PGP MESSAGE-----\n",
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
    "data": "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\nmQINBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\ntB9BZGEgTG92ZWxhY2UgPGFkYUBwYXNzYm9sdC5jb20+iQJOBBMBCgA4AhsDBQsJ\r\nCAcDBRUKCQgLBRYCAwEAAh4BAheAFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0b\r\nmi8ACgkQE1O1sV2bBU+Okw\/\/b\/PRVTz0\/hgdagcVNYPn\/lclDFuwwqanyvYu6y6M\r\nAiLVn6CUtxfU7GH2aSwZSr7D\/46TSlBHvxVvNlYROMx7odbLgq47OJxfUDG5OPi7\r\nLZgsuE8zijCPURZTZu20m+ratsieV0ziri+xJV09xJrjdkXHdX2PrkU0YeJxhE50\r\nJuMR1rf7EHfCp45nWbXoM4H+LnadGC1zSHa1WhSJkeaYw9jp1gh93BKD8+kmUrm6\r\ncKEjxN54YpgjFwSdA60b+BZgXbMgA37gNQCnZYjk7toaQClUbqLMaQxHPIjETB+Z\r\njJNKOYn740N2LTRtCi3ioraQNgXQEU7tWsXGS0tuMMN7w4ya1I6sYV3fCtfiyXFw\r\nfuYnjjGzn5hXtTjiOLJ+2kdy5OmNZc9wpf6IpKv7\/F2RUwLsBUfH4ondNNXscdkB\r\n6Zoj1Hxt16TpkHnYrKsSWtoOs90JnlwYbHnki6R\/gekYRSRSpD\/ybScQDRASQ0aO\r\nhbi71WuyFbLZF92P1mEK5GInJeiFjKaifvJ8F+oagI9hiYcHgX6ghktaPrANa2De\r\nOjmesQ0WjIHirzFKx3avYIkOFwKp8v6KTzynAEQ8XUqZmqEhNjEgVKHH0g3sC+EC\r\nZ\/HGLHsRRIN1siYnJGahrrkNs7lFI5LTqByHh52bismY3ADLemxH6Voq+DokvQn4\r\nHxS5Ag0EVcdMHwEQAMFWZvlswoC+dEFISBhJLz0XpTR5M84MCn19s\/ILjp6dGPbC\r\nvlGcT5Ol\/wL43T3hML8bzq18MRGgkzhwsBkUXO+E7jVePjuGFvRwS5W+QYwCuAmw\r\nDijDdMhrev1mrdVK61v\/2U9kt5faETW8ZIYIvAWLaw\/lMHbVmKOa35ZCIJWcNsrv\r\noro2kGUklM6Nq1JQyU+puGPHuvm+1ywZzpAH5q55pMgfO+9JjMU3XFs+eqv6LVyA\r\n\/Y6T7ZK1H8inbUPm\/26sSvmYsT\/4xNVosC\/ha9lFEAasz\/rbVg7thffje4LWOXJB\r\no40iBTlHsNbCGs5BfNC0wl719JDA4V8mwhGInNtETCrGwg3mBlDrk5jYrDq5IMVk\r\nyX4Z6T8Fd2fLHmUr2kFc4vC96tGQGhNrbAa\/EeaAkWMeFyp\/YOW0Z3X2tz5A+lm+\r\nqevJZ3HcQd+7ca6mPTrYSVVXhclwSkyCLlhRJwEwSxrn+a2ZToYNotLs1uEy6tOL\r\nbIyhFBQNsR6mTa2ttkd\/89wJ+r9s7XYDOyibTQyUGgOXu\/0l1K0jTREKlC91wKkm\r\ndw\/lJkjZCIMc\/KTHiB1e7f5NdFtxwErToEZOLVumop0FjRqzHoXZIR9OCSMUzUmM\r\nspGHalE71GfwB9DkAlgvoJPohyiipJ\/Paw3pOytZnb\/7A\/PoRSjELgDNPJhxABEB\r\nAAGJAjYEGAEKACACGwwWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaPgAKCRAT\r\nU7WxXZsFTxX0EADAN9lreHgEvsl4JK89JqwBLjvGeXGTNmHsfczCTLAutVde+Lf0\r\nqACAhKhG0J8Omru2jVkUqPhkRcaTfaPKopT2KU8GfjKuuAlJ+BzH7oUq\/wy70t2h\r\nsglAYByv4y0emwnGyFC8VNw2Fe+Wil2y5d8DI8XHGp0bAXehjT2S7\/v1lEypeiiE\r\nNbhAnGG94Zywwwim0RltyNKXOgGeT4mroYxAL0zeTaX99Lch+DqyaeDq94g4sfhA\r\nVvGT2KJDT85vR3oNbB0U5wlbKPa+bUl8CokEDjqrDmdZOOs\/UO2mc45V3X5RNRtp\r\nNZMBGPJsxOKQExEOZncOVsY7ZqLrecuR8UJBQnhPd1aoz3HCJppaPI02uINWyQLs\r\nCogTf+nQWnLyN9qLrToriahNcZlDfuJCRVKTQ1gw1lkSN3IZRSkBuRYRe05US+C6\r\n8JMKHP+1XMKMgQM2XR7r4noMJKLaVUzfLXuPIWH2xNdgYXcIOSRjiANkIv4O7lWM\r\nxX9vD6LklijrepMl55Omu0bhF5rRn2VAubfxKhJs0eQn69+NWaVUrNMQ078nF+8G\r\nKT6vH32q9i9fpV38XYlwM9qEa0il5wfrSwPuDd5vmGgk9AOlSEzY2vE1kvp7lEt1\r\nTdb3ZfAajPMO3Iov5dwvm0zhJDQHFo7SFi5jH0Pgk4bAd9HBmB8sioxL4Q==\r\n=Kwft\r\n-----END PGP PUBLIC KEY BLOCK-----",
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
