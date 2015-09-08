var openpgp = require("../openpgp");
var storage = new (require('../node-localstorage').LocalStorage)();
var Request = require("sdk/request").Request;
const { defer } = require('sdk/core/promise');
var Config = require("../model/config");
var User = require("../model/user").User;
var user = new User();

/**
 * Get the current user.
 * @returns {*}
 */
var findCurrentUser = function() {
  return user.getCurrent();
}
exports.findCurrentUser = findCurrentUser;
