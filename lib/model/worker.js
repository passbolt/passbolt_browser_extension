/**
 * Config model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');
var Crypto = require("./crypto").Crypto;

var getContextId = function(worker) {
	return Crypto.uuid(worker.tab.id);
};

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
		contextId = getContextId(worker);

	if (exists(key, worker)) {
		console.warn('[WARNING] the worker ' + key + ' already exists, it has been added but weird behaviors are expected.');
	}

	// Add the worker to the list of active app workers.
	if (typeof app.workers[contextId] == 'undefined') {
		app.workers[contextId] = {};
	}
	app.workers[contextId][key] = worker;

	// When the worker get detached.
	worker.on('detach', function() {
		if (exists(key, this)) {
			remove(key, this);
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
 * Unreference a worker
 *
 * @param key
 */
var remove = function(key, worker) {
	var contextId = getContextId(worker);
	if (!exists(key, worker)) {
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
 * @param key
 */
var get = function(key, srcWorker) {
	var contextId = getContextId(srcWorker);
	if (app.workers[contextId][key]) {
		return app.workers[contextId][key];
	}
	return null;
};
exports.get = get;

/**
 * Get all workers keys.
 *
 * @return array
 */
var getAllKeys = function(srcWorker) {
	var contextId = getContextId(srcWorker);
	return Object.keys(app.workers[contextId]);
};
exports.getAllKeys = getAllKeys;

/**
 * Checks that a worker exists.
 *
 * @param key
 * @return bool
 */
var exists = function(key, srcWorker) {
	var contextId = getContextId(srcWorker);
	if (typeof app.workers[contextId] != 'undefined' && typeof app.workers[contextId][key] != 'undefined') {
		return true;
	}
	return false;
};
exports.exists = exists;
