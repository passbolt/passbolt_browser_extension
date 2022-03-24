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
import {defaultUserDto} from "../user/userEntity.test.data";
import {
  alternativeAccountRecoveryOrganizationPublicKeyDto,
  createAccountRecoveryOrganizationPublicKeyDto,
  createAlternativeAccountRecoveryOrganizationPublicKeyDto,
  createRevokedAccountRecoveryOrganizationPublicKeyDto,
  defaultAccountRecoveryOrganizationPublicKeyDto,
  revokedAccountRecoveryOrganizationPublicKeyDto
} from "./accountRecoveryOrganizationPublicKeyEntity.test.data";
import {
  createAccountRecoveryPrivateKeyPasswordDto,
  defaultAccountRecoveryPrivateKeyPasswordDto
} from "./accountRecoveryPrivateKeyPasswordEntity.test.data";
import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";

// Disabled account recovery organization policy

export const createDisabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = {
    policy: "disabled",
  };

  return Object.assign(defaultData, data || {});
};

export const disabledAccountRecoveryOrganizationPolicyDto = data => {
  const userId = uuidv4();
  const defaultData = createDisabledAccountRecoveryOrganizationPolicyDto({
    id: uuidv4(),
    public_key_id: null,
    creator: defaultUserDto({
      id: userId,
      gpgkey: {
        user_id: userId,
        armored_key: pgpKeys.ada.public,
        fingerprint: pgpKeys.ada.fingerprint
      }
    }),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  });

  return Object.assign(defaultData, data || {});
};

// Enabled account recovery organization policy

export const createEnabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = {
    policy: "opt-out",
    account_recovery_organization_public_key: createAccountRecoveryOrganizationPublicKeyDto(),
  };

  return Object.assign(defaultData, data || {});
};

export const enabledAccountRecoveryOrganizationPolicyDto = data => {
  const userId = uuidv4();
  const defaultData = createEnabledAccountRecoveryOrganizationPolicyDto({
    id: uuidv4(),
    public_key_id: uuidv4(),
    account_recovery_organization_public_key: defaultAccountRecoveryOrganizationPublicKeyDto(),
    creator: defaultUserDto({
      id: userId,
      gpgkey: {
        user_id: userId,
        armored_key: pgpKeys.ada.public,
        fingerprint: pgpKeys.ada.fingerprint
      }
    }),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  });

  return Object.assign(defaultData, data || {});
};

// Disabled previously enabled account recovery organization policy

export const createDisabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createDisabledAccountRecoveryOrganizationPolicyDto({
    account_recovery_organization_revoked_key: createRevokedAccountRecoveryOrganizationPublicKeyDto(),
  });

  return Object.assign(defaultData, data || {});
};

export const disabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createDisabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto({
    id: uuidv4(),
    public_key_id: null,
    account_recovery_organization_revoked_key: revokedAccountRecoveryOrganizationPublicKeyDto(),
  });

  return Object.assign(defaultData, data || {});
};

// Rotate key account recovery organization policy

export const createRotateKeyAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createEnabledAccountRecoveryOrganizationPolicyDto({
    account_recovery_organization_public_key: createAlternativeAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_organization_revoked_key: createRevokedAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_private_key_passwords: [
      createAccountRecoveryPrivateKeyPasswordDto()
    ]
  });

  return Object.assign(defaultData, data || {});
};

export const rotateKeyAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = enabledAccountRecoveryOrganizationPolicyDto({
    account_recovery_organization_public_key: alternativeAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_organization_revoked_key: revokedAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_private_key_passwords: [
      defaultAccountRecoveryPrivateKeyPasswordDto()
    ]
  });

  return Object.assign(defaultData, data || {});
};

export const optInAccountRecoveryOranizationPolicyDto = (data = {}) => {
  const defaultData = disabledAccountRecoveryOrganizationPolicyDto({
    policy: "opt-in",
    account_recovery_organization_public_key: {
      armored_key: pgpKeys.account_recovery_organization.public
    }
  });
  return Object.assign(defaultData, data);
};

export const optOutAccountRecoveryOranizationPolicyDto = (data = {}) => {
  const defaultData = disabledAccountRecoveryOrganizationPolicyDto({
    policy: "opt-out",
    account_recovery_organization_public_key: {
      armored_key: pgpKeys.account_recovery_organization.public
    }
  });
  return Object.assign(defaultData, data);
};

export const optOutWithNewOrkAccountRecoveryOranizationPolicyDto = (data = {}) => {
  const defaultData = optOutAccountRecoveryOranizationPolicyDto({
    account_recovery_organization_public_key: {
      armored_key: pgpKeys.account_recovery_organization_alternative.public
    }
  });
  return Object.assign(defaultData, data);
};

export const read3ExistingPrivatePasswords = () => [
  //data clear text: 'user1password' (encrypted with ada's key and signed with ada's key)
  defaultAccountRecoveryPrivateKeyPasswordDto({data: "-----BEGIN PGP MESSAGE-----\n\nhQIMA1P90Qk1JHA+AQ\/+M3hfKOJDHPfkfumXsKYnp6G5nOgoNC0i2VB1GVE1QELz\nKmfVqdWkZs6NtdmxtEYDGh2XMBXa74yY4sMN4IRP3tBydj6C7x4xCFZ9rpr423yp\nZrJ1wpLNSqE2G86snx14DFUzwmUbIuPy9oKSt1zvvNq6+EqBtDXZ8koHeD4szybm\n39mZC3wz4lLftfSrcg55X61OnWrq760\/sLnrvI9WFEueuucgXnQqV0YaFM4U1zih\ngtuPEqJhCSiPWFaOevlFiJ+NQOAlfwiP3jGDbi0Qawky1NmA2\/8td6K0Q8QauaC\/\nlVSMDhgEb1\/Rnx+Lg9xCjC8TbF4ZiNEKHjKri5bfcGRS+3kQhtzngpX0e+22Zy3h\nebUxGdJm4ozaMT1LZwSNJpTbZO6\/yZXmBm0r19OLK0y6quF\/dTuRKk8cXtp6NjWF\nLC5kDTXtjG+3h5wk1TJXQTegG5oFhcNH9QIUhKiGADKBbNIAltd1YVz1et5mHejG\n75qYe+9eD\/H1De3+H7EyHXnED4eo25i2KDv49tifoC5eLWe96OrW3YfJ5tmuvA5K\no04zW4nZ1CV9PN40BR7auaOJGImk7wEVg4hL+RIZqM6VPXcRRbEAbmNpOHOVHLsS\ngWMEP7FviylRpVPOLhHvU2i54CBkZOg2EzaFz0OuXcViRJ8\/z1WAPWf32ph6DkrS\n6QFzXj7mt9+EyBWCNNxvBayo5g9vS+Rrov7piIOao136dkBU2dC7eBkzkmnX3o56\n\/H2a8nII3Ws8cE+C7l6oT+\/\/Uili4SrT4S3XNVR8siBE86rz3uKF9N\/pP21JBVIH\nxtCh5wU\/yOITRhUWbZErBC6+2nOZUcaJQW7QICIpHBgbBT37MiPAUr3xw+LnQZZl\nTl\/UrG8p0RLUWw5s36KH2TomqIqqQZET1f7Kc0uthewR42HkGQz4aoXBvqg5xerd\ntM7uclvV156\/USTeW9V9O9KjlgK12UjuVnDTKO4n8PMaDNcXHZMuAx56VyqI9pUd\nQxxF20QD9bI4R1D9TdK3VarnN0ZQ5RVNxsqaF+JTt8h4Yh47q0bvcrfYHBOQCq+K\n1+D5wx+\/WY8r6o\/UQyLCHF9c3GwKqDtND8oHyhWbw9sFEGMDJuRr1tOQJi52wOa5\nZVql5rDPCWBQYoLhDkuqow+QNUVlmyIerimQa1ziZg4gxV+6MPWZmUcnqVEmvS8d\nKJD7i2YQHOjapdNZ5e7FtAjLqYODOC41CGIUW1QRdH6RiZ\/E0Sk39f5V\/HYmdc5Q\nEIl1dARKBltfBEPG\/CTwvoK0g9WO\/ExZMYuoHiJni8DIYq6j\/5btmdPqwbLOSMJ+\nksTmz\/cvtq+ABPC6f9TVOUrLOi72c0iCI2fBPxWaMWpiovMOsnscVrK2cFBRyRc6\ntsd4KPFbhWLyOvAffuB4gAgIAyogcfyaxI3F3nb1sW9dFshR\/FQGnIZN0jzP34fT\n+EhznVfRnnKYXL2t6JVFwS1Q\/mWteDcV3O7x\/ObC+98krBtz3EVho80FjwQEIs89\ndGSUh+DU7FHNd7ZcmcQd1Dw3IWW+515IlDt+Cpp8DXpn+Oc5kclhu+j2HN+yiBCX\nzKKgpQ==\n=vljc\n-----END PGP MESSAGE-----"}),
  //data clear text: 'user2password' (encrypted with ada's key and signed with ada's key)
  defaultAccountRecoveryPrivateKeyPasswordDto({data: "-----BEGIN PGP MESSAGE-----\n\nhQIMA1P90Qk1JHA+AQ\/+IPo5CxKAsFJWrMdGkc3zmUzYFtBiZMmmDDeeZDzxE4g9\nBUbL+Hz3IZKycGd5rasUw+noYi3OvApYwNSTIb7OBnXmwwxwEgsk3RRhdzEMIz3c\nsQc5VQrazpf7QonrVpxV9VSTFTf\/y+Ui2NinQwDjMEZ6S2aqw1q2iZJtbTgFC+Oz\nEoqxFgo3bX9OmU+14pani9wUvszzlz+tS4NjXmLNwr3kNkR\/vnXy15YQPK52nACE\nLWluNyjRfxsA7EZOCM0NuWdIskHDVIVYA0vwB\/I1ZF6LjWML2dj8jRYT6KdzLKqt\nwn6BYo4qt+DrA9E0uPLQS5KFDW0wraplA\/FYesoP0wtHdDpzWg0w+3p75V0\/OkC2\nuIGWdA0MxIYleAuxhbGg+b6Qnrm0dsD6EzRLezoga5E3R6s3ziJd5k+hfH+U9Yvu\nEG0RtTTwcEtwLtFUXcbEhruyyFn08v8oZHRbI9oAtqJ+kiNUpiQwMcV4dVDOMNDe\nqYh+TY7fp6+05\/xI7ZySwiQmznY3tz23MsXWT+J1hZgo2mkVT133yDtdmp58cXll\n1D0EH8S7VNG3UHXk0ZIfYbbRqTt\/sxl1otqW\/\/ugQs\/A1HyS6rklDsZsxZTo8mLs\n1qY56uTBYFcoSdaTM2IkD8WlKABIFmB1XS3RLJoXPfGw6w5D9aX2vz3OpinllGXS\n6QENxNxmfh0toVW\/pUxJUNTZj+xmlktXYiVf0\/oa6I\/VGVc4zmvD1EG6hSbirh\/K\nFTz9VMsHhH4WUo7cayW7s1s\/MdBIug\/g2YfcBZfQbQvhdiFBwlnKIVcWTy7sqfbt\nJbICTEbbjg9nQEXqPKJN7w62vra0y2+BOhD1A8XXr9TYUkHYUcccgqsD2RJjfWlE\nx7z6t8GMdPcgWJkr6Lq1zqXySCacgtCWJcpx\/mD1mfJKPYH6Zh\/wAXt9QpwAh4PW\nzyLLduxMJMByV6M0nWRkjhqGsYqWn57gryxSH0wg9N1n46n1K\/VJIDxz7yceC4O+\n8tB5iDA5Bnq9c0UitiEgJuI4cdOyjalRfR850P2LldGVc\/+eDasj+MwLUoHVXMCp\nN1kbkUT9xhujk5GePUoAbr7xbjYjE98kv+mOOzR98an8xuZJUo1j+mgmWkQ3eWGg\nednQf9yH+1RE3eohCREGCpGVEJwEOwA3C8a5nE04hPrGmtjHC8Bh35MJdYTi9GJ3\ncAmwudd7UvZFdxsw86OYFRAvfMP+z0umOF5cCbgZZ27dXJtWYfydTGok6QOStba7\nPfiA0m4cD6gjhdEEfS4FoLFGvTGp65bGFYKOclBGitW4PbCUyY5oz4mAMEFIPktE\n7e6vlZ72Dhztzw5ZWm\/kWDMqWRgvFgHujCDr3ocfKcbtonlrLrrudA5Amdlmlz1Z\nBzkb8B642w0sYNMRjB+GRq5\/B4HeYTRo5tfIDOl5lJ5X1H+F3ZDCnlCAcs68JtQ+\nin74QQ62kmmevWcslyG0kL54SONpCctw4wjqjXZIfHPDYuzxIodlgT6ooSSuJqak\n0e0PmRZSjfSVuLhpzgA+P2Zsik\/gsHIM811cGOnFvLgRkPmGMIeBMdNyXZS7ovQ2\nrl8NYg==\n=Kh5f\n-----END PGP MESSAGE-----"}),
  //data clear text: 'user3password' (encrypted with ada's key and signed with ada's key)
  defaultAccountRecoveryPrivateKeyPasswordDto({data: "-----BEGIN PGP MESSAGE-----\n\nhQIMA1P90Qk1JHA+AQ\/\/WQg5VYxsz5MU8lAlvstj5825iQ1DBjUw+hvUVdPtc06P\nbLK1V7oTncIphZUUm5PRg5veg1nt2ZZN8lbuhatC9GeEPUekpEU6LYuQcs6hP1WN\nsiqtrimDGvHzvwtkHXNkpZ9k2HUSn8geMRn0O4h2EQjaO5t5H7hi4qFmcjO+uqY0\nKf7h7BrjYCk6MQT49FknaVlhuD9Qs9ANej6wsizkOnGg2MGvgDlcFjWUJpPf0HgL\nqLootwsur3QD\/AuZY82ULi6m4VRSPCencXcdX1buEgJBs4LvDuo6X7DnoyU4hFkx\nZ3LIKjmkPnONsWeyn\/qozsnn62w773Thn5jGJcshI5oUN\/k5q\/FbbLTB5sKS4UM6\nJ9dSRCUdBOa9IoByyhHOiCu+fA6CAAlx7nL8W\/nv3X8RBGx1TFPprn79OqoFGSBZ\ndLcnN3O2tiGnDJUF2ZrjeC8CIIFBAxaWsap\/8kvQw8Im4aSqqSovjB8BsRD8SZMr\nf\/ylsY+deR70e6EPLqGg2FCPbzrcgL7Cn4GsQrxXlyxXIcSfo376IFVELbPGL\/sF\nyBOJawEk8AXDfdg3Ty9PXSsoPkrdjmXfktAEvtXtPTkYU9M9zSzphCPghjmKPfK\/\nceCxaCmTmbd\/s0Ox4+dbKFrEHFrIRCKV6sa14QT+3F\/OOO+F95bP3kwsysFdSW7S\n6QEL\/Q9BhPi2fmKJAaTPL8LIvisq5GOpCeAr2xr8Dp3a50IQXr2qhf2L6MWnBwJQ\nbtosTB3ioASl12F\/Px7CI6bBkEGuOuBWPXEp8efB63R3IvHKhDt3SMVWO8lCY8r9\n0yOKG4SfNzekFV3XsnzyUgnKq68fNSdPIo3gxhefWufkXqGBa6rKy0IwcBQ6EVIA\nmUwUWRyy8RJ4mpVzI8drFfu8UjEzkUzr6s4rUhqcWB\/hQLnRlko1ivUOHhwSpTdk\njSt\/eD8+dJbaPvhKMvoOwMxYs3ni7z\/MqxBoH3h2MHj0lq81xtoAG1\/v4\/l7AJs7\nIA0x6PxPusom77ebSaXJonI9trhkQz7dxizuKk6YHDFCtfLFWM4V\/DBOifA+cYbX\njGKReaaT22vQcJGed1hzLu2DWq5IKeUt40R3dMOrATVE8fCE6M+o38rQplA\/IcRW\n1+1YZFvrYofgwnCYhG\/Ysw8N36eS7d+AmJwGdcZH1HfkMFFyY5gdyiq7c25QZA3J\nybG\/CmdAAAwBiPY\/iKb7AAte9wF\/CaU8RP1TNPiDlwgq169hPkE4ijiSpQVf1HQ4\nJS+JxK2cPa96HhtSvVqX7FH\/daC\/f4mj95SEEnVx\/YYLiyHAZdfz5vfiK0e8I3EC\n64Dqp1Is86h0VWfqQRqWXkCvLT5\/rO1Ikv\/uHHU7o8esohEtxcpIKw4djTFmzbZT\nPf5y6LV68uUhL1mgIyIaFk5cyOs+I6nFMoKvo1WKyBmewsoCo9GcM0uaCKWtqvDU\n45T1cVsWW6rYSWE6WsowDt5lAsuAXWQSzTvXH0jQYl3dd28n1D5KZt2YsqTa\/RPL\npMQ2eLcWCpjjLAS0D\/JUIgOAwLdLizvpv12cIOhcKzmcC0FL1R4yacu92nat5yR0\nsNH5QA==\n=w7yj\n-----END PGP MESSAGE-----"}),
];
