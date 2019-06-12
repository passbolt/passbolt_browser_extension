/**
 * Favorite model.
 *
 * Provides utility functions to handle favorites.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const FavoriteService = require("../service/favorite").FavoriteService;
const ResourceLocalStorage = require('../service/local_storage/resource').ResourceLocalStorage;

class Favorite {

  static async add(resourceId) {
    const favorite = await FavoriteService.add(resourceId);
    // Update the resources local storage.
    const resource = await ResourceLocalStorage.getResourceById(resourceId);
    resource.favorite = favorite;
    await ResourceLocalStorage.updateResource(resource);

    return favorite;
  }

  static async delete(resourceId) {
    const resource = await ResourceLocalStorage.getResourceById(resourceId);
    await FavoriteService.delete(resource.favorite.id);
    resource.favorite = null;
    // Update the resources local storage.
    await ResourceLocalStorage.updateResource(resource);
  }
};

exports.Favorite = Favorite;
