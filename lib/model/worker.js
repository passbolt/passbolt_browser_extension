/**
 * Config model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');

/**
 * Reference a worker
 *
 * @param key
 * @param worker
 */
var add = function(key, worker, options) {
	console.debug('add worker ' + key);
	options = options || {};
	var removeOnTabUrlChange = options.removeOnTabUrlChange || false;

	if (exists(key)) {
		console.warn('[WARNING] the worker ' + key + ' already exists, it has been added but weird behaviors are expected.');
	}

	// Add the worker to the list of active app workers.
	app.workers[key] = worker;

	// If the worker should be destroyed on tab change.
	if (removeOnTabUrlChange) {
		var url = worker.tab.url,
			onTabReady = function(tab) {
				if(url != tab.url){
					console.debug('tab url has changed for ' + key + ' : ' + url);
					worker.tab.removeListener('ready', onTabReady);
					worker.destroy();
				}
			};
		worker.tab.on('ready', onTabReady);
	}
};
exports.add = add;

/**
 * Unreference a worker
 *
 * @param key
 */
var remove = function(key) {
	if (!exists(key)) {
		console.warn('[WARNING] Unable to remove the worker ' + key + ', it doesn\'t exist.');
	} else {
		console.debug('remove worker ' + key);
		delete app.workers[key];
	}
};
exports.remove = remove;

/**
 * Get a worker
 *
 * @param key
 */
var get = function(key) {
	if (app.workers[key]) {
		return app.workers[key];
	}
	return null
};
exports.get = get;

/**
 * Get all workers keys.
 *
 * @return array
 */
var getAllKeys = function() {
	return Object.keys(app.workers);
};
exports.getAllKeys = getAllKeys;

/**
 * Checks that a worker exists.
 *
 * @param key
 * @return bool
 */
var exists = function(key) {
	if (app.workers[key]) {
		return true;
	}
	return false;
};
exports.exists = exists;
