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
 * @since         3.6.0
 */
const {AbstractService} = require('../abstract/abstractService');
const secrets = require("secrets.js-grempe");
const {DecryptPrivateKeyService} = require("../../crypto/decryptPrivateKeyService");
const {EncryptMessageService} = require("../../crypto/encryptMessageService");
const {AccountRecoveryPrivateKeyPasswordEntity} = require("../../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity");

const ACCOUNT_RECOVERY_REQUEST_SERVICE_RESOURCE_NAME = '/account-recovery/requests';

class AccountRecoveryRequestService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryRequestService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_REQUEST_SERVICE_RESOURCE_NAME;
  }

  /**
   * Find the requests of account recovery by user
   *
   * @param {string} id The request Id
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findById(id) {
    // @todo @debug @mock for account-recovery
    const symmetricSecret = secrets.random(512);
    const publicArmoredKey =  "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\nmQINBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\ntB9BZGEgTG92ZWxhY2UgPGFkYUBwYXNzYm9sdC5jb20+iQJOBBMBCgA4AhsDBQsJ\r\nCAcDBRUKCQgLBRYCAwEAAh4BAheAFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0b\r\nmi8ACgkQE1O1sV2bBU+Okw\/\/b\/PRVTz0\/hgdagcVNYPn\/lclDFuwwqanyvYu6y6M\r\nAiLVn6CUtxfU7GH2aSwZSr7D\/46TSlBHvxVvNlYROMx7odbLgq47OJxfUDG5OPi7\r\nLZgsuE8zijCPURZTZu20m+ratsieV0ziri+xJV09xJrjdkXHdX2PrkU0YeJxhE50\r\nJuMR1rf7EHfCp45nWbXoM4H+LnadGC1zSHa1WhSJkeaYw9jp1gh93BKD8+kmUrm6\r\ncKEjxN54YpgjFwSdA60b+BZgXbMgA37gNQCnZYjk7toaQClUbqLMaQxHPIjETB+Z\r\njJNKOYn740N2LTRtCi3ioraQNgXQEU7tWsXGS0tuMMN7w4ya1I6sYV3fCtfiyXFw\r\nfuYnjjGzn5hXtTjiOLJ+2kdy5OmNZc9wpf6IpKv7\/F2RUwLsBUfH4ondNNXscdkB\r\n6Zoj1Hxt16TpkHnYrKsSWtoOs90JnlwYbHnki6R\/gekYRSRSpD\/ybScQDRASQ0aO\r\nhbi71WuyFbLZF92P1mEK5GInJeiFjKaifvJ8F+oagI9hiYcHgX6ghktaPrANa2De\r\nOjmesQ0WjIHirzFKx3avYIkOFwKp8v6KTzynAEQ8XUqZmqEhNjEgVKHH0g3sC+EC\r\nZ\/HGLHsRRIN1siYnJGahrrkNs7lFI5LTqByHh52bismY3ADLemxH6Voq+DokvQn4\r\nHxS5Ag0EVcdMHwEQAMFWZvlswoC+dEFISBhJLz0XpTR5M84MCn19s\/ILjp6dGPbC\r\nvlGcT5Ol\/wL43T3hML8bzq18MRGgkzhwsBkUXO+E7jVePjuGFvRwS5W+QYwCuAmw\r\nDijDdMhrev1mrdVK61v\/2U9kt5faETW8ZIYIvAWLaw\/lMHbVmKOa35ZCIJWcNsrv\r\noro2kGUklM6Nq1JQyU+puGPHuvm+1ywZzpAH5q55pMgfO+9JjMU3XFs+eqv6LVyA\r\n\/Y6T7ZK1H8inbUPm\/26sSvmYsT\/4xNVosC\/ha9lFEAasz\/rbVg7thffje4LWOXJB\r\no40iBTlHsNbCGs5BfNC0wl719JDA4V8mwhGInNtETCrGwg3mBlDrk5jYrDq5IMVk\r\nyX4Z6T8Fd2fLHmUr2kFc4vC96tGQGhNrbAa\/EeaAkWMeFyp\/YOW0Z3X2tz5A+lm+\r\nqevJZ3HcQd+7ca6mPTrYSVVXhclwSkyCLlhRJwEwSxrn+a2ZToYNotLs1uEy6tOL\r\nbIyhFBQNsR6mTa2ttkd\/89wJ+r9s7XYDOyibTQyUGgOXu\/0l1K0jTREKlC91wKkm\r\ndw\/lJkjZCIMc\/KTHiB1e7f5NdFtxwErToEZOLVumop0FjRqzHoXZIR9OCSMUzUmM\r\nspGHalE71GfwB9DkAlgvoJPohyiipJ\/Paw3pOytZnb\/7A\/PoRSjELgDNPJhxABEB\r\nAAGJAjYEGAEKACACGwwWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaPgAKCRAT\r\nU7WxXZsFTxX0EADAN9lreHgEvsl4JK89JqwBLjvGeXGTNmHsfczCTLAutVde+Lf0\r\nqACAhKhG0J8Omru2jVkUqPhkRcaTfaPKopT2KU8GfjKuuAlJ+BzH7oUq\/wy70t2h\r\nsglAYByv4y0emwnGyFC8VNw2Fe+Wil2y5d8DI8XHGp0bAXehjT2S7\/v1lEypeiiE\r\nNbhAnGG94Zywwwim0RltyNKXOgGeT4mroYxAL0zeTaX99Lch+DqyaeDq94g4sfhA\r\nVvGT2KJDT85vR3oNbB0U5wlbKPa+bUl8CokEDjqrDmdZOOs\/UO2mc45V3X5RNRtp\r\nNZMBGPJsxOKQExEOZncOVsY7ZqLrecuR8UJBQnhPd1aoz3HCJppaPI02uINWyQLs\r\nCogTf+nQWnLyN9qLrToriahNcZlDfuJCRVKTQ1gw1lkSN3IZRSkBuRYRe05US+C6\r\n8JMKHP+1XMKMgQM2XR7r4noMJKLaVUzfLXuPIWH2xNdgYXcIOSRjiANkIv4O7lWM\r\nxX9vD6LklijrepMl55Omu0bhF5rRn2VAubfxKhJs0eQn69+NWaVUrNMQ078nF+8G\r\nKT6vH32q9i9fpV38XYlwM9qEa0il5wfrSwPuDd5vmGgk9AOlSEzY2vE1kvp7lEt1\r\nTdb3ZfAajPMO3Iov5dwvm0zhJDQHFo7SFi5jH0Pgk4bAd9HBmB8sioxL4Q==\r\n=Kwft\r\n-----END PGP PUBLIC KEY BLOCK-----";
    const orkPrivateKey = "-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n\r\nlQdGBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\n\/gcDAligwbAF+isJ5IWTOSV7ntMBT6hJX\/lTLRlZuPR8io9niecrRE7UtbHRmW\/K\r\n02MKr8S9roJF1\/DBPCXC1NBp0WMciZHcqr4dh8DhtvCeSPjJd9L5xMGk9TOrK4Bv\r\nLurtbly+qWzP4iRPCLkzX1AbGnBePTLS+tVPHxy4dOMRPqfvzBPLsocHfYXN62os\r\nJDtcHYoFVddQAOPdjsYYptPEI6rFTXNQJTFzwkigqMpTaaqjloM+PFcQNEiabap\/\r\nGRCmD4KLUjCw0MJhikJpNzJHU17Oz7mBkkQy0gK7tvXt23TeVZNj3\/GXdur7IUni\r\nP0SAdSI6Yby8NPp48SjJ6e5O4HvVMDtBJBiNhHWWepLTPVnd3YeQ+1DYPmbpTu1z\r\nrF4+Bri0TfCuDwcTudYD7UUuS62aOwbE4px+RwBjD299gebnI8YAlN975eSAZM4r\r\n5me1dlfDMm47zD9dEmwT+ZwrGfol8oZoUwzYsQaCCmZqaba88ieRAZY30R\/089RS\r\nhR5WSieo2iIckFTILWiK\/E7VrreCUD8iacutVJqgRdzDgP4m+Zm3yRJYw2OiFe1Z\r\nwzD+Fb0gKDSB67G0i4KuZhXSTvn7QjqDWcVmgDTcTcrzzTwveeeLYe4aHaMUQGfl\r\ng+7hsGSt5on\/zqrU4DCQtUtFOn3Rsfyi3H4Fi9IA1w1knKVJ5IsIoxdBnRDvM3ZK\r\n6STr53I8CIJYB5Jj0cZuJ97pQ2YrFNbP5rgJCEnGwRuCRzlgaVeji+g27pZpJMJ4\r\nMdxAAw1AYo0IOPoNbuts5D\/5u5NzeiXxdQn5i\/sfUpYWvVJDnYPpXRT3v4amUpx+\r\nNIE5rF2QoHgc0wiw4hpqGVoin3WycfvlbnsHFJoR1YI9qS3z09Ihu\/NC6TejhgGf\r\ncJyRY5ghTvbqjCJmKPya2\/TfvgYtZmQ7toNpAL4VlLKDE55qXmqVbDo0cCuDnXcK\r\n\/gidC9VEaOxUb3Bxx0GQkxfiEhp\/S\/ndxLgyeG8otkGRat6aVjqPoAWj4Eu9w8XV\r\nysWPDJVv7hZ6rEm05a7eqQTUFg8PHw\/PdD2CWWYPHVTB+T9ihLwxUHMj4j6Uwvpy\r\nm2QyIzdsENkC52KY23SWNFE7WjdQmOS8ki1arVNIP9vcmh7nHGrRwPhmFTeTYzM1\r\n3jERti8DtvVyqnEf4c6CxfupOKLwRXvtJM9vhgFBD39oP\/bPVMee8R8Uj0QUM1ah\r\nVly3WEZK2enFqa\/+ChyZ1IOpVm3o2oCZs\/SWk\/FFsqOsdqJduI\/xbk2YG51FI6bw\r\nv2vCXx9+B+VdjDujtwyTpsy+sy2HqTv+SvYMuMFgpkGa7JDa7iuYqZg0179vEoJJ\r\nq2E04GSsjpg+IxddtjqMsdM0eCCgbY9QgnMxF1GA01Ij\/JC4H8g08jNU6RQ4KUaV\r\nmwdZvR8BhqNR6Ecx6BfzC415q+klaHf9IiPMFCxy96w\/wG6tGzS2tsczejtDoXmX\r\nr8FO+eoDWgzd5uO5f+m1G+dYN4RGUjcVAbC3oePYr3X6oXxu6Cb7tWFzu0ttr2GE\r\nRFDNy4zeN9UlUbbHGiylMdY9NsuGxC58oBgtHLsAsxlbw1oQvpXbBWZzfRwowv\/z\r\nnBdfEDm6JoSUnv1pyhBrM6sItolNaY244FKBmVW46T8U6+sOLSCRAKbKF3BuV6iH\r\nZsCtinXvN4asQ\/vUepuS59tPhSmqTSIAK5SCg6FDH\/tSOxrG9q187P190Nvc2Yyh\r\naolGQmHPK3mkc829sctNIrUJuAyYB4+WXpM\/K0x0u0\/GDJsKW26BZvi0H0FkYSBM\r\nb3ZlbGFjZSA8YWRhQHBhc3Nib2x0LmNvbT6JAk4EEwEKADgCGwMFCwkIBwMFFQoJ\r\nCAsFFgIDAQACHgECF4AWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaLwAKCRAT\r\nU7WxXZsFT46TD\/9v89FVPPT+GB1qBxU1g+f+VyUMW7DCpqfK9i7rLowCItWfoJS3\r\nF9TsYfZpLBlKvsP\/jpNKUEe\/FW82VhE4zHuh1suCrjs4nF9QMbk4+LstmCy4TzOK\r\nMI9RFlNm7bSb6tq2yJ5XTOKuL7ElXT3EmuN2Rcd1fY+uRTRh4nGETnQm4xHWt\/sQ\r\nd8KnjmdZtegzgf4udp0YLXNIdrVaFImR5pjD2OnWCH3cEoPz6SZSubpwoSPE3nhi\r\nmCMXBJ0DrRv4FmBdsyADfuA1AKdliOTu2hpAKVRuosxpDEc8iMRMH5mMk0o5ifvj\r\nQ3YtNG0KLeKitpA2BdARTu1axcZLS24ww3vDjJrUjqxhXd8K1+LJcXB+5ieOMbOf\r\nmFe1OOI4sn7aR3Lk6Y1lz3Cl\/oikq\/v8XZFTAuwFR8fiid001exx2QHpmiPUfG3X\r\npOmQedisqxJa2g6z3QmeXBhseeSLpH+B6RhFJFKkP\/JtJxANEBJDRo6FuLvVa7IV\r\nstkX3Y\/WYQrkYicl6IWMpqJ+8nwX6hqAj2GJhweBfqCGS1o+sA1rYN46OZ6xDRaM\r\ngeKvMUrHdq9giQ4XAqny\/opPPKcARDxdSpmaoSE2MSBUocfSDewL4QJn8cYsexFE\r\ng3WyJickZqGuuQ2zuUUjktOoHIeHnZuKyZjcAMt6bEfpWir4OiS9CfgfFJ0HRgRV\r\nx0wfARAAwVZm+WzCgL50QUhIGEkvPRelNHkzzgwKfX2z8guOnp0Y9sK+UZxPk6X\/\r\nAvjdPeEwvxvOrXwxEaCTOHCwGRRc74TuNV4+O4YW9HBLlb5BjAK4CbAOKMN0yGt6\r\n\/Wat1UrrW\/\/ZT2S3l9oRNbxkhgi8BYtrD+UwdtWYo5rflkIglZw2yu+iujaQZSSU\r\nzo2rUlDJT6m4Y8e6+b7XLBnOkAfmrnmkyB8770mMxTdcWz56q\/otXID9jpPtkrUf\r\nyKdtQ+b\/bqxK+ZixP\/jE1WiwL+Fr2UUQBqzP+ttWDu2F9+N7gtY5ckGjjSIFOUew\r\n1sIazkF80LTCXvX0kMDhXybCEYic20RMKsbCDeYGUOuTmNisOrkgxWTJfhnpPwV3\r\nZ8seZSvaQVzi8L3q0ZAaE2tsBr8R5oCRYx4XKn9g5bRndfa3PkD6Wb6p68lncdxB\r\n37txrqY9OthJVVeFyXBKTIIuWFEnATBLGuf5rZlOhg2i0uzW4TLq04tsjKEUFA2x\r\nHqZNra22R3\/z3An6v2ztdgM7KJtNDJQaA5e7\/SXUrSNNEQqUL3XAqSZ3D+UmSNkI\r\ngxz8pMeIHV7t\/k10W3HAStOgRk4tW6ainQWNGrMehdkhH04JIxTNSYyykYdqUTvU\r\nZ\/AH0OQCWC+gk+iHKKKkn89rDek7K1mdv\/sD8+hFKMQuAM08mHEAEQEAAf4HAwIG\r\nvhenLc6sMuTV+xomYhFDNmDMH1L9x\/8WG+NGjbYEIO0ezLgMizb7HlQVR4pPy+Tx\r\nxQDu8cZEtkxONaI9DDKTjoTD0UtKhELNM8HeJ4SljDbdU76z66BoBf1VIUocGbx8\r\nw6cjaPCALZf8Jl+3YhvJjW9NQcq9WTg1bU4Dga4C7sE1\/1fSK6DR8jKDxkf+zCt9\r\nHAWNtGv0P6IQEVB852M2O47RZkrJS17vBCsjEW9WGfa+i6tdSxS+IDshm+o6PYUG\r\nqUsfdiiRosTM10q1V6bNu2XKNOXvDzfAJPEhacbkkBpmfOhdc7okPqI17cLf0Mne\r\n1pJHXIZxUVUGisPS+yGoCPPuqISC9+EEZcBe8aCwyu4qWvTkNfwZm4SqFd0PiqQq\r\nU44Mf4diqbV3sQKQ3U+r0iZdCTQDBy+OIsmjJWPEvspC7UkaqsPze8eSdYNHB0tf\r\nqBdIidWeJ80131KWBMuweb0lHdxbiifxWMohymgj6mQf34w1Ffslak7c4ABeRTKR\r\njUqmX0bFp4KPFvyLSiArV7\/ohNn14sLq+HV0Kp19fGb8zh5E4x9LAHi0qd4+AcqI\r\ndQMG03XMF0Kih8dYxwIrcze6EmpzYSw5xms6fFangnf\/bWhKchfTb1qCT0npbPOp\r\nON6s3DE0vIdgnFOdxGGGWK0IRckOzf4c7NAMrtnSsuff3ogi25JvAAbxq\/XoCiv0\r\nGXiRJajREv4p4RXkIjZkhwOdMK+ovV8fEEHRyLTGyzx\/0Sv48ebVLVFf2iBW1t5o\r\nEwU2ElJmeMXbLRtFu8KAfr0hzIHPRjEZcQHBh3JdZOMHEwTdVQEeARNpQM51IZoP\r\nYiHRWaYE3XneotdWE07y6Npvc6eigxTy+cTHY+tafKHyNo63HGxhT+E4ZETT3sRn\r\nETkqjDeuaFQgpQmTlK8m+pvPT9CqgEPKSi2FH8bTPXmyO0i713NrBExzpHkmc8LH\r\nRSiXn\/K3Hbw8KQ+aNpMwFF4v2X16gQLQkDCO8PpKwpa9cAdw9vd+J+Hd\/NlEC6JR\r\ng8H7TPcVqtz+ucjW4v00bvoqj+RTWBDv9veUDrQBR862x9aX0TxqzaNr0z9dfpM8\r\nGpGzCLkqMOcqR7QRFX\/MxE\/Vf6wZRi7YvoNgLaikQxLAOfV9quYCcHio3e8AIsVk\r\nDCWeLzdu\/PZ4q+ubdxoWzM4BMHoo0FfBGqp0\/vKwwv5T3HbUpWdwRqqbQCsA1C1a\r\nzsIixUp4\/LkfXtJgqt8AYRMlEBOSM0QCJ1gpTO0+cjdQGgjrUtc2\/\/AhnQLhP4pw\r\n7hncQMR5lm6XGrKoNsair15N0R1hYS90NTi\/4zLQ62+7Q1SDveOKxuXgmGQsG9+p\r\n6GfHwClYuWMAF\/Nxkj+moEmJ39b2qrbO7fCU2ttewjAJZLYr7CN8C9nLTz6YC4by\r\nopW4JsEcHU5979ckpwMVaY8EqMi32NueKCcIj8rYKSKJ4vUyqgjXYmfd+jMrc5F\/\r\nDgSWqTe6xt01X\/nBWxWBlvAWwHJIqt0Toj7IizNS0jBcrmwu+4hPQHN8y+xAXxtI\r\nKzeq\/tcuRz30Oh7zA4vQOMB4ahUfNZlxVMSJAkr55Jwy9ZC4RWD46EhbmBgUSE18\r\n53y2vzihjWsVJvgAQCRrE6HKVvF0EE0PO8hUFLuVpdLhnGD\/xzmFYKxBpqj9IOk2\r\nqN+5UxfiQ+ACE5+WOlrV52ux2D6jcKPFh4R62I8l9zWvbI3rR+FUC3JU7dzIffyj\r\nSg+vmujAqvXwDwRHzdRzZ1u5Og3A3PqEYDtW4dfUmlwMTqd+iQI2BBgBCgAgAhsM\r\nFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0bmj4ACgkQE1O1sV2bBU8V9BAAwDfZ\r\na3h4BL7JeCSvPSasAS47xnlxkzZh7H3MwkywLrVXXvi39KgAgISoRtCfDpq7to1Z\r\nFKj4ZEXGk32jyqKU9ilPBn4yrrgJSfgcx+6FKv8Mu9LdobIJQGAcr+MtHpsJxshQ\r\nvFTcNhXvlopdsuXfAyPFxxqdGwF3oY09ku\/79ZRMqXoohDW4QJxhveGcsMMIptEZ\r\nbcjSlzoBnk+Jq6GMQC9M3k2l\/fS3Ifg6smng6veIOLH4QFbxk9iiQ0\/Ob0d6DWwd\r\nFOcJWyj2vm1JfAqJBA46qw5nWTjrP1DtpnOOVd1+UTUbaTWTARjybMTikBMRDmZ3\r\nDlbGO2ai63nLkfFCQUJ4T3dWqM9xwiaaWjyNNriDVskC7AqIE3\/p0Fpy8jfai606\r\nK4moTXGZQ37iQkVSk0NYMNZZEjdyGUUpAbkWEXtOVEvguvCTChz\/tVzCjIEDNl0e\r\n6+J6DCSi2lVM3y17jyFh9sTXYGF3CDkkY4gDZCL+Du5VjMV\/bw+i5JYo63qTJeeT\r\nprtG4Rea0Z9lQLm38SoSbNHkJ+vfjVmlVKzTENO\/JxfvBik+rx99qvYvX6Vd\/F2J\r\ncDPahGtIpecH60sD7g3eb5hoJPQDpUhM2NrxNZL6e5RLdU3W92XwGozzDtyKL+Xc\r\nL5tM4SQ0BxaO0hYuYx9D4JOGwHfRwZgfLIqMS+E=\r\n=9Gmn\r\n-----END PGP PRIVATE KEY BLOCK-----";
    const orkDecrypted = await DecryptPrivateKeyService.decrypt(orkPrivateKey, 'ada@passbolt.com');
    // Encrypt AES256 secret with organization recovery public key.
    const userPrivateKeySecretEncrypted = await EncryptMessageService.encrypt(symmetricSecret, publicArmoredKey, orkDecrypted);
    return {
      id: id,
      authentication_token_id: "d4c0e643-3967-443b-93b3-102d902c4512",
      armored_key: "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\nmQINBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\ntB9BZGEgTG92ZWxhY2UgPGFkYUBwYXNzYm9sdC5jb20+iQJOBBMBCgA4AhsDBQsJ\r\nCAcDBRUKCQgLBRYCAwEAAh4BAheAFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0b\r\nmi8ACgkQE1O1sV2bBU+Okw\/\/b\/PRVTz0\/hgdagcVNYPn\/lclDFuwwqanyvYu6y6M\r\nAiLVn6CUtxfU7GH2aSwZSr7D\/46TSlBHvxVvNlYROMx7odbLgq47OJxfUDG5OPi7\r\nLZgsuE8zijCPURZTZu20m+ratsieV0ziri+xJV09xJrjdkXHdX2PrkU0YeJxhE50\r\nJuMR1rf7EHfCp45nWbXoM4H+LnadGC1zSHa1WhSJkeaYw9jp1gh93BKD8+kmUrm6\r\ncKEjxN54YpgjFwSdA60b+BZgXbMgA37gNQCnZYjk7toaQClUbqLMaQxHPIjETB+Z\r\njJNKOYn740N2LTRtCi3ioraQNgXQEU7tWsXGS0tuMMN7w4ya1I6sYV3fCtfiyXFw\r\nfuYnjjGzn5hXtTjiOLJ+2kdy5OmNZc9wpf6IpKv7\/F2RUwLsBUfH4ondNNXscdkB\r\n6Zoj1Hxt16TpkHnYrKsSWtoOs90JnlwYbHnki6R\/gekYRSRSpD\/ybScQDRASQ0aO\r\nhbi71WuyFbLZF92P1mEK5GInJeiFjKaifvJ8F+oagI9hiYcHgX6ghktaPrANa2De\r\nOjmesQ0WjIHirzFKx3avYIkOFwKp8v6KTzynAEQ8XUqZmqEhNjEgVKHH0g3sC+EC\r\nZ\/HGLHsRRIN1siYnJGahrrkNs7lFI5LTqByHh52bismY3ADLemxH6Voq+DokvQn4\r\nHxS5Ag0EVcdMHwEQAMFWZvlswoC+dEFISBhJLz0XpTR5M84MCn19s\/ILjp6dGPbC\r\nvlGcT5Ol\/wL43T3hML8bzq18MRGgkzhwsBkUXO+E7jVePjuGFvRwS5W+QYwCuAmw\r\nDijDdMhrev1mrdVK61v\/2U9kt5faETW8ZIYIvAWLaw\/lMHbVmKOa35ZCIJWcNsrv\r\noro2kGUklM6Nq1JQyU+puGPHuvm+1ywZzpAH5q55pMgfO+9JjMU3XFs+eqv6LVyA\r\n\/Y6T7ZK1H8inbUPm\/26sSvmYsT\/4xNVosC\/ha9lFEAasz\/rbVg7thffje4LWOXJB\r\no40iBTlHsNbCGs5BfNC0wl719JDA4V8mwhGInNtETCrGwg3mBlDrk5jYrDq5IMVk\r\nyX4Z6T8Fd2fLHmUr2kFc4vC96tGQGhNrbAa\/EeaAkWMeFyp\/YOW0Z3X2tz5A+lm+\r\nqevJZ3HcQd+7ca6mPTrYSVVXhclwSkyCLlhRJwEwSxrn+a2ZToYNotLs1uEy6tOL\r\nbIyhFBQNsR6mTa2ttkd\/89wJ+r9s7XYDOyibTQyUGgOXu\/0l1K0jTREKlC91wKkm\r\ndw\/lJkjZCIMc\/KTHiB1e7f5NdFtxwErToEZOLVumop0FjRqzHoXZIR9OCSMUzUmM\r\nspGHalE71GfwB9DkAlgvoJPohyiipJ\/Paw3pOytZnb\/7A\/PoRSjELgDNPJhxABEB\r\nAAGJAjYEGAEKACACGwwWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaPgAKCRAT\r\nU7WxXZsFTxX0EADAN9lreHgEvsl4JK89JqwBLjvGeXGTNmHsfczCTLAutVde+Lf0\r\nqACAhKhG0J8Omru2jVkUqPhkRcaTfaPKopT2KU8GfjKuuAlJ+BzH7oUq\/wy70t2h\r\nsglAYByv4y0emwnGyFC8VNw2Fe+Wil2y5d8DI8XHGp0bAXehjT2S7\/v1lEypeiiE\r\nNbhAnGG94Zywwwim0RltyNKXOgGeT4mroYxAL0zeTaX99Lch+DqyaeDq94g4sfhA\r\nVvGT2KJDT85vR3oNbB0U5wlbKPa+bUl8CokEDjqrDmdZOOs\/UO2mc45V3X5RNRtp\r\nNZMBGPJsxOKQExEOZncOVsY7ZqLrecuR8UJBQnhPd1aoz3HCJppaPI02uINWyQLs\r\nCogTf+nQWnLyN9qLrToriahNcZlDfuJCRVKTQ1gw1lkSN3IZRSkBuRYRe05US+C6\r\n8JMKHP+1XMKMgQM2XR7r4noMJKLaVUzfLXuPIWH2xNdgYXcIOSRjiANkIv4O7lWM\r\nxX9vD6LklijrepMl55Omu0bhF5rRn2VAubfxKhJs0eQn69+NWaVUrNMQ078nF+8G\r\nKT6vH32q9i9fpV38XYlwM9qEa0il5wfrSwPuDd5vmGgk9AOlSEzY2vE1kvp7lEt1\r\nTdb3ZfAajPMO3Iov5dwvm0zhJDQHFo7SFi5jH0Pgk4bAd9HBmB8sioxL4Q==\r\n=Kwft\r\n-----END PGP PUBLIC KEY BLOCK-----",
      fingerprint: "03f60e958f4cb29723acdf761353b5b15d9b054f",
      status: "pending",
      created: "2020-05-04T20:31:45+00:00",
      modified: "2020-05-04T20:31:45+00:00",
      created_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      modified_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      account_recovery_private_key_passwords: [
        {
          recipient_foreign_model: AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY,
          recipient_foreign_key: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
          data: userPrivateKeySecretEncrypted.data
        }
      ]
    };
    /*
     * const response = this.apiClient.get(id);
     * return response.body;
     */
  }

  /**
   * Find the requests of account recovery by user
   *
   * @param {string} userId The user Id
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findByUser(userId) {
    // @todo mocked account-recovery request
    return [{
      "id": userId,
      "user_id": "d4c0e643-3967-443b-93b3-102d902c4511",
      "armored_key": "-----BEGIN PGP MESSAGE-----\r\nVersion: OpenPGP.js v4.6.2\r\nComment: https:\/\/openpgpjs.org\r\n\r\nwcFMAxYTR81eetNbAQ\/\/TEWCA7W1kx7IzcZi4nmT92IZbdpzCBSQt5htSCoJ\r\nFfzGd27yeDT2GoEtmxmkG+gEak8ci0Jxa9FECaYDBzG4ixEDfDMfWqw\/WK2w\r\nj04oja+0qCAimV2nyItSYoaK5aZj8vL97V6U\/7YcraC9QTNY1Kd8RDPeL32D\r\nO2dpquPDLx5uMAmMoSZWruNCGqqJPjxMcxc2PBco+GJMcaGcYa5Y3+YueNpZ\r\nIIS0PbMpgiJlVvYzZywYC5lkIKFadVeV6MNkMmJfWB4VHq2Hoo3poZVP1rZV\r\n6cU7a7UuG4W3UUmezxQGQ6WAjh+qzkQHXrwI3cgU14du9sTCh8occwcPhG1C\r\nj8ljcTJqexQxA91TSj2UqhAnyB9yzZRcoh38bj\/OyGQmtiwxEFIzUymSi2pt\r\nysjJOZ7lB1Oh2l4vbgxJoNxtgvzY+3dsNXL510x793Hev3X2YcbO\/TJoy6G9\r\n89cuocJ1dlLIHqrfri43y1V0ZTfoa\/vigma4Qa5kUtB1tN0j38z+6tcjiz\/s\r\n8RJmXUK2bfHhvEbuc\/YnDDltpiZHc3QUtbj5TV2m+fO0ad2jVqxsi4eZid\/V\r\n\/WDUrAxRzY7xNRTRQQDbnT831NZeZbYobCpfPqU8ylF9iv\/V4lsyNYFrU0ne\r\n37JRFzl3cOY+jlqxGHaAF9\/mC3b3D3DmlZ+kOOQ7lE\/SwaoBAuDaJRsKzNqj\r\nTz8UFif5iwrEQY5BNzYd+zwGVzMlVP\/RNXR2YlAHx5lPMylgI73RDMoMZ4RT\r\nb7AQB9DqgobZI3dh3B90XqjkRiy3VJ\/nMhwknaZc6onJQgl2O\/ULie9kh69U\r\n1ojIkN+SHFCl42T1iT2eN08QUPffDVTMvT103WlX+MW8FV6CmF+TcDRUexs3\r\nT\/2EvFlxP6QTG41vLk4Sm3xce7rEZHiJ9hRrF26xVfT5jM+7z149lP5J8mgA\r\nARSBj2jlO7P1afQX+5RyYR+guD9LN95qMsNJwukTCzIo1AhE7yywf7b8v3a6\r\nXyanZo+TbDqxnJlozEMsdyGBwBn7UX6Erv072cZadO\/ZG2RBkbgiBGZ5hAjg\r\nPqwRAkfzDNa4WhsE9Crqs5ROy6IsDBGuAa8\/as0oCzIV+Ou4BPzKHfQDQS6U\r\nT0R+48sVAZAYY7TqaNHvf+3nlqMyssaK0SPm2fg3DZXPM2pcDatCFb4gVElC\r\n1qbG8pRIBmS\/NYr8m7IBnazDs9L6lYAjybuHes6cPqasDmHKha6DKl1P6jX+\r\nEeDxA0AVL4rZdUCt1fpEcFR\/R\/o4uDDLO8NGiHwM3MnbNI8G0SQy8q\/NhI11\r\nzWXyDeAR6hHKYC4h6WCCTFxe364PWLjQ5PGOLeAfeWEPCDZmP6U99kwoiOUu\r\ni8UuoIAFon3lIOXZnJ3ZtAcQ5UJ3gNcJH1EImZFdYtRgLo3GOPjBcNqGbmCu\r\n4xo+yMGy9Y8YJZM9HakKAChmHf01J3DAwNfUm8Rhx5w+NBQRm0aJ319wsACH\r\nlLEYvv+bVfPkNTvW\/vWND9eOPGI0Q8o=\r\n=AOt0\r\n-----END PGP MESSAGE-----\r\n",
      "fingerprint": "0C1D1761110D1E33C9006D1A5B1B332ED06426D3",
      "authentication_token_id": "d4c0e643-3967-443b-93b3-102d902c4512",
      "status": "pending",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    }];
    /*
     * const urlOptions = {user_id: userId};
     * const response = this.apiClient.findAll(urlOptions);
     * return response.body;
     */
  }
}

exports.AccountRecoveryRequestService = AccountRecoveryRequestService;
