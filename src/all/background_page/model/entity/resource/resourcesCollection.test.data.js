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
 * @since         3.8.0
 */
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {ownerPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data.js";
import {readSecret} from "../secret/secretEntity.test.data";

export const defaultResourceDtosCollection = () => {
  const resource1 = defaultResourceDto({name: "Resource1"});
  resource1.secrets = [readSecret({resource_id: resource1.id})];
  resource1.permission = ownerPermissionDto({aco_foreign_key: resource1.id});
  resource1.permissions = [resource1.permission];
  const resource2 = defaultResourceDto({name: "Resource2"});
  resource2.secrets = [readSecret({resource_id: resource2.id})];
  resource2.permission = ownerPermissionDto({aco_foreign_key: resource2.id});
  resource2.permissions = [resource2.permission];
  const resource3 = defaultResourceDto({name: "Resource3"});
  resource3.secrets = [readSecret({resource_id: resource3.id})];
  resource3.permission = ownerPermissionDto({aco_foreign_key: resource3.id});
  resource3.permissions = [resource3.permission];
  const resource4 = defaultResourceDto({name: "Resource4"});
  resource4.secrets = [readSecret({resource_id: resource4.id})];
  resource4.permission = ownerPermissionDto({aco_foreign_key: resource4.id});
  resource4.permissions = [resource4.permission];
  return [resource1, resource2, resource3, resource4];
};
