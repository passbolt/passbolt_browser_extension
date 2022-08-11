/**
 * Favorite events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import User from "../model/user";
import FavoriteModel from "../model/favorite/favoriteModel";

const listen = function(worker) {
  /*
   * Mark a resource as favorite
   *
   * @listens passbolt.favorite.add
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource id
   */
  worker.port.on('passbolt.favorite.add', async(requestId, resourceId) => {
    try {
      const apiClientOption = await User.getInstance().getApiClientOptions();
      const favoriteModel = new FavoriteModel(apiClientOption);
      const favoriteEntity = await favoriteModel.addResourceToFavorite(resourceId);
      worker.port.emit(requestId, 'SUCCESS', favoriteEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Unmark a resource as favorite
   *
   * @listens passbolt.favorite.add
   * @param requestId {uuid} The request identifier
   * @param resourceId {uuid} The resource id
   */
  worker.port.on('passbolt.favorite.delete', async(requestId, resourceId) => {
    try {
      const apiClientOption = await User.getInstance().getApiClientOptions();
      const favoriteModel = new FavoriteModel(apiClientOption);
      await favoriteModel.removeResourceFromFavorite(resourceId);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const FavoriteEvents = {listen};
