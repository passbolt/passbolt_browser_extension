/**
 * Config model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');

/**
 * Get the context of a given worker
 *
 * @param worker The worker to get the context for
 * @returns {string} The worker identifier
 */
var getContext = function(worker) {
	return worker.tab.id;
};
exports.getContext = getContext;

/**
 * Reference a worker
 *
 * @param key
 * @param worker
 */
var add = function(key, worker, options) {
	console.debug('add worker ' + key);
	options = options || {};
	var removeOnTabUrlChange = options.removeOnTabUrlChange || false,
		contextId = getContext(worker);

	if (exists(key, contextId)) {
		console.warn('[WARNING] the worker ' + key + ' already exists, it has been added but weird behaviors are expected.');
	}

	// Add the worker to the list of active app workers.
	if (typeof app.workers[contextId] == 'undefined') {
		app.workers[contextId] = {};
	}
	app.workers[contextId][key] = worker;

	// When the worker get detached.
	worker.on('detach', function() {
		if (exists(key, contextId)) {
			remove(key, contextId);
		}
	});

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
 * Remove a worker
 *
 * @param key The identifier of the worker
 * @param contextId The worker context identifier
 */
var remove = function(key, contextId) {
	if (!exists(key, contextId)) {
		console.warn('[WARNING] Unable to remove the worker ' + key + ', it doesn\'t exist on the tab ' + contextId + ' .');
	} else {
		console.debug('remove worker ' + key);
		delete app.workers[contextId][key];
	}
};
exports.remove = remove;

/**
 * Get a worker
 *
 * @param key The worker identifier
 * @param contextId The worker context identifier
 * @return the worker if found or null
 */
var get = function(key, contextId) {
	if (app.workers[contextId][key]) {
		return app.workers[contextId][key];
	}
	return null;
};
exports.get = get;

/**
 * Get all workers keys
 *
 * @param contextId The context identifier to look into
 * @return array
 */
var getAllKeys = function(contextId) {
	return Object.keys(app.workers[contextId]);
};
exports.getAllKeys = getAllKeys;

/**
 * Checks that a worker exists
 *
 * @param key
 * @param contextId The worker context identifier
 * @return bool
 */
var exists = function(key, contextId) {
	if (typeof app.workers[contextId] != 'undefined'
		&& typeof app.workers[contextId][key] != 'undefined') {
		return true;
	}
	return false;
};
exports.exists = exists;
