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
const {AbstractService} = require('../abstract/abstractService');

const ACCOUNT_RECOVERY_PRIVATE_KEY_PASSWORD_RESOURCE_NAME = '/account-recovery/private-key-passwords';

class AccountRecoveryPrivateKeyPasswordService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryPrivateKeyPasswordService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_PRIVATE_KEY_PASSWORD_RESOURCE_NAME;
  }

  /**
   * Find all user's account recovery private key password.
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll() {
    // @todo mocked account-recovery request
    return [{
      "id": "253488a2-e805-46a3-b2f7-39700c251796",
      "recipient_foreign_key": "2afd4daa-7e60-4bb6-bd29-8661e1bf8c3e",
      "recipient_foreign_model": "AccountRecoveryOrganizationKey",
      //data clear text: 'user1password' (encrypted with ada's key and signed with ada's key)
      "data": "-----BEGIN PGP MESSAGE-----\r\n\r\nhQIMA1P90Qk1JHA+AQ\/+M3hfKOJDHPfkfumXsKYnp6G5nOgoNC0i2VB1GVE1QELz\r\nKmfVqdWkZs6NtdmxtEYDGh2XMBXa74yY4sMN4IRP3tBydj6C7x4xCFZ9rpr423yp\r\nZrJ1wpLNSqE2G86snx14DFUzwmUbIuPy9oKSt1zvvNq6+EqBtDXZ8koHeD4szybm\r\n39mZC3wz4lLftfSrcg55X61OnWrq760\/sLnrvI9WFEueuucgXnQqV0YaFM4U1zih\r\ngtuPEqJhCSiPWFaOevlFiJ+NQOAlfwiP3jGDbi0Qawky1NmA2\/8td6K0Q8QauaC\/\r\nlVSMDhgEb1\/Rnx+Lg9xCjC8TbF4ZiNEKHjKri5bfcGRS+3kQhtzngpX0e+22Zy3h\r\nebUxGdJm4ozaMT1LZwSNJpTbZO6\/yZXmBm0r19OLK0y6quF\/dTuRKk8cXtp6NjWF\r\nLC5kDTXtjG+3h5wk1TJXQTegG5oFhcNH9QIUhKiGADKBbNIAltd1YVz1et5mHejG\r\n75qYe+9eD\/H1De3+H7EyHXnED4eo25i2KDv49tifoC5eLWe96OrW3YfJ5tmuvA5K\r\no04zW4nZ1CV9PN40BR7auaOJGImk7wEVg4hL+RIZqM6VPXcRRbEAbmNpOHOVHLsS\r\ngWMEP7FviylRpVPOLhHvU2i54CBkZOg2EzaFz0OuXcViRJ8\/z1WAPWf32ph6DkrS\r\n6QFzXj7mt9+EyBWCNNxvBayo5g9vS+Rrov7piIOao136dkBU2dC7eBkzkmnX3o56\r\n\/H2a8nII3Ws8cE+C7l6oT+\/\/Uili4SrT4S3XNVR8siBE86rz3uKF9N\/pP21JBVIH\r\nxtCh5wU\/yOITRhUWbZErBC6+2nOZUcaJQW7QICIpHBgbBT37MiPAUr3xw+LnQZZl\r\nTl\/UrG8p0RLUWw5s36KH2TomqIqqQZET1f7Kc0uthewR42HkGQz4aoXBvqg5xerd\r\ntM7uclvV156\/USTeW9V9O9KjlgK12UjuVnDTKO4n8PMaDNcXHZMuAx56VyqI9pUd\r\nQxxF20QD9bI4R1D9TdK3VarnN0ZQ5RVNxsqaF+JTt8h4Yh47q0bvcrfYHBOQCq+K\r\n1+D5wx+\/WY8r6o\/UQyLCHF9c3GwKqDtND8oHyhWbw9sFEGMDJuRr1tOQJi52wOa5\r\nZVql5rDPCWBQYoLhDkuqow+QNUVlmyIerimQa1ziZg4gxV+6MPWZmUcnqVEmvS8d\r\nKJD7i2YQHOjapdNZ5e7FtAjLqYODOC41CGIUW1QRdH6RiZ\/E0Sk39f5V\/HYmdc5Q\r\nEIl1dARKBltfBEPG\/CTwvoK0g9WO\/ExZMYuoHiJni8DIYq6j\/5btmdPqwbLOSMJ+\r\nksTmz\/cvtq+ABPC6f9TVOUrLOi72c0iCI2fBPxWaMWpiovMOsnscVrK2cFBRyRc6\r\ntsd4KPFbhWLyOvAffuB4gAgIAyogcfyaxI3F3nb1sW9dFshR\/FQGnIZN0jzP34fT\r\n+EhznVfRnnKYXL2t6JVFwS1Q\/mWteDcV3O7x\/ObC+98krBtz3EVho80FjwQEIs89\r\ndGSUh+DU7FHNd7ZcmcQd1Dw3IWW+515IlDt+Cpp8DXpn+Oc5kclhu+j2HN+yiBCX\r\nzKKgpQ==\r\n=vljc\r\n-----END PGP MESSAGE-----",
    }, {
      "id": "470f1b2d-4a03-4b90-8e5e-d19d24356bdd",
      "recipient_foreign_key": "cb4505f4-b8eb-4171-9863-b6c506541e6a",
      "recipient_foreign_model": "AccountRecoveryOrganizationKey",
      //data clear text: 'user2password' (encrypted with ada's key and signed with ada's key)
      "data": "-----BEGIN PGP MESSAGE-----\r\n\r\nhQIMA1P90Qk1JHA+AQ\/+IPo5CxKAsFJWrMdGkc3zmUzYFtBiZMmmDDeeZDzxE4g9\r\nBUbL+Hz3IZKycGd5rasUw+noYi3OvApYwNSTIb7OBnXmwwxwEgsk3RRhdzEMIz3c\r\nsQc5VQrazpf7QonrVpxV9VSTFTf\/y+Ui2NinQwDjMEZ6S2aqw1q2iZJtbTgFC+Oz\r\nEoqxFgo3bX9OmU+14pani9wUvszzlz+tS4NjXmLNwr3kNkR\/vnXy15YQPK52nACE\r\nLWluNyjRfxsA7EZOCM0NuWdIskHDVIVYA0vwB\/I1ZF6LjWML2dj8jRYT6KdzLKqt\r\nwn6BYo4qt+DrA9E0uPLQS5KFDW0wraplA\/FYesoP0wtHdDpzWg0w+3p75V0\/OkC2\r\nuIGWdA0MxIYleAuxhbGg+b6Qnrm0dsD6EzRLezoga5E3R6s3ziJd5k+hfH+U9Yvu\r\nEG0RtTTwcEtwLtFUXcbEhruyyFn08v8oZHRbI9oAtqJ+kiNUpiQwMcV4dVDOMNDe\r\nqYh+TY7fp6+05\/xI7ZySwiQmznY3tz23MsXWT+J1hZgo2mkVT133yDtdmp58cXll\r\n1D0EH8S7VNG3UHXk0ZIfYbbRqTt\/sxl1otqW\/\/ugQs\/A1HyS6rklDsZsxZTo8mLs\r\n1qY56uTBYFcoSdaTM2IkD8WlKABIFmB1XS3RLJoXPfGw6w5D9aX2vz3OpinllGXS\r\n6QENxNxmfh0toVW\/pUxJUNTZj+xmlktXYiVf0\/oa6I\/VGVc4zmvD1EG6hSbirh\/K\r\nFTz9VMsHhH4WUo7cayW7s1s\/MdBIug\/g2YfcBZfQbQvhdiFBwlnKIVcWTy7sqfbt\r\nJbICTEbbjg9nQEXqPKJN7w62vra0y2+BOhD1A8XXr9TYUkHYUcccgqsD2RJjfWlE\r\nx7z6t8GMdPcgWJkr6Lq1zqXySCacgtCWJcpx\/mD1mfJKPYH6Zh\/wAXt9QpwAh4PW\r\nzyLLduxMJMByV6M0nWRkjhqGsYqWn57gryxSH0wg9N1n46n1K\/VJIDxz7yceC4O+\r\n8tB5iDA5Bnq9c0UitiEgJuI4cdOyjalRfR850P2LldGVc\/+eDasj+MwLUoHVXMCp\r\nN1kbkUT9xhujk5GePUoAbr7xbjYjE98kv+mOOzR98an8xuZJUo1j+mgmWkQ3eWGg\r\nednQf9yH+1RE3eohCREGCpGVEJwEOwA3C8a5nE04hPrGmtjHC8Bh35MJdYTi9GJ3\r\ncAmwudd7UvZFdxsw86OYFRAvfMP+z0umOF5cCbgZZ27dXJtWYfydTGok6QOStba7\r\nPfiA0m4cD6gjhdEEfS4FoLFGvTGp65bGFYKOclBGitW4PbCUyY5oz4mAMEFIPktE\r\n7e6vlZ72Dhztzw5ZWm\/kWDMqWRgvFgHujCDr3ocfKcbtonlrLrrudA5Amdlmlz1Z\r\nBzkb8B642w0sYNMRjB+GRq5\/B4HeYTRo5tfIDOl5lJ5X1H+F3ZDCnlCAcs68JtQ+\r\nin74QQ62kmmevWcslyG0kL54SONpCctw4wjqjXZIfHPDYuzxIodlgT6ooSSuJqak\r\n0e0PmRZSjfSVuLhpzgA+P2Zsik\/gsHIM811cGOnFvLgRkPmGMIeBMdNyXZS7ovQ2\r\nrl8NYg==\r\n=Kh5f\r\n-----END PGP MESSAGE-----",
    }, {
      "id": "8308c510-e25e-49e9-97d2-a04f8c0da452",
      "recipient_foreign_key": "6ca99bea-f302-4495-beaf-52623ab77b27",
      "recipient_foreign_model": "AccountRecoveryOrganizationKey",
      //data clear text: 'user3password' (encrypted with ada's key and signed with ada's key)
      "data": "-----BEGIN PGP MESSAGE-----\r\n\r\nhQIMA1P90Qk1JHA+AQ\/\/WQg5VYxsz5MU8lAlvstj5825iQ1DBjUw+hvUVdPtc06P\r\nbLK1V7oTncIphZUUm5PRg5veg1nt2ZZN8lbuhatC9GeEPUekpEU6LYuQcs6hP1WN\r\nsiqtrimDGvHzvwtkHXNkpZ9k2HUSn8geMRn0O4h2EQjaO5t5H7hi4qFmcjO+uqY0\r\nKf7h7BrjYCk6MQT49FknaVlhuD9Qs9ANej6wsizkOnGg2MGvgDlcFjWUJpPf0HgL\r\nqLootwsur3QD\/AuZY82ULi6m4VRSPCencXcdX1buEgJBs4LvDuo6X7DnoyU4hFkx\r\nZ3LIKjmkPnONsWeyn\/qozsnn62w773Thn5jGJcshI5oUN\/k5q\/FbbLTB5sKS4UM6\r\nJ9dSRCUdBOa9IoByyhHOiCu+fA6CAAlx7nL8W\/nv3X8RBGx1TFPprn79OqoFGSBZ\r\ndLcnN3O2tiGnDJUF2ZrjeC8CIIFBAxaWsap\/8kvQw8Im4aSqqSovjB8BsRD8SZMr\r\nf\/ylsY+deR70e6EPLqGg2FCPbzrcgL7Cn4GsQrxXlyxXIcSfo376IFVELbPGL\/sF\r\nyBOJawEk8AXDfdg3Ty9PXSsoPkrdjmXfktAEvtXtPTkYU9M9zSzphCPghjmKPfK\/\r\nceCxaCmTmbd\/s0Ox4+dbKFrEHFrIRCKV6sa14QT+3F\/OOO+F95bP3kwsysFdSW7S\r\n6QEL\/Q9BhPi2fmKJAaTPL8LIvisq5GOpCeAr2xr8Dp3a50IQXr2qhf2L6MWnBwJQ\r\nbtosTB3ioASl12F\/Px7CI6bBkEGuOuBWPXEp8efB63R3IvHKhDt3SMVWO8lCY8r9\r\n0yOKG4SfNzekFV3XsnzyUgnKq68fNSdPIo3gxhefWufkXqGBa6rKy0IwcBQ6EVIA\r\nmUwUWRyy8RJ4mpVzI8drFfu8UjEzkUzr6s4rUhqcWB\/hQLnRlko1ivUOHhwSpTdk\r\njSt\/eD8+dJbaPvhKMvoOwMxYs3ni7z\/MqxBoH3h2MHj0lq81xtoAG1\/v4\/l7AJs7\r\nIA0x6PxPusom77ebSaXJonI9trhkQz7dxizuKk6YHDFCtfLFWM4V\/DBOifA+cYbX\r\njGKReaaT22vQcJGed1hzLu2DWq5IKeUt40R3dMOrATVE8fCE6M+o38rQplA\/IcRW\r\n1+1YZFvrYofgwnCYhG\/Ysw8N36eS7d+AmJwGdcZH1HfkMFFyY5gdyiq7c25QZA3J\r\nybG\/CmdAAAwBiPY\/iKb7AAte9wF\/CaU8RP1TNPiDlwgq169hPkE4ijiSpQVf1HQ4\r\nJS+JxK2cPa96HhtSvVqX7FH\/daC\/f4mj95SEEnVx\/YYLiyHAZdfz5vfiK0e8I3EC\r\n64Dqp1Is86h0VWfqQRqWXkCvLT5\/rO1Ikv\/uHHU7o8esohEtxcpIKw4djTFmzbZT\r\nPf5y6LV68uUhL1mgIyIaFk5cyOs+I6nFMoKvo1WKyBmewsoCo9GcM0uaCKWtqvDU\r\n45T1cVsWW6rYSWE6WsowDt5lAsuAXWQSzTvXH0jQYl3dd28n1D5KZt2YsqTa\/RPL\r\npMQ2eLcWCpjjLAS0D\/JUIgOAwLdLizvpv12cIOhcKzmcC0FL1R4yacu92nat5yR0\r\nsNH5QA==\r\n=w7yj\r\n-----END PGP MESSAGE-----",
    }];
    /*
     * const response = this.apiClient.findAll();
     * return response.body;
     */
  }
}

exports.AccountRecoveryPrivateKeyPasswordService =  AccountRecoveryPrivateKeyPasswordService;
