const { defer } = require('sdk/core/promise');
var Request = require("sdk/request").Request;
var User = require("./user").User;
var __ = require("sdk/l10n").get;

var Auth = function () {
    this._user = new User();
    this.URL_VERIFY = 'auth/verify';
    this.URL_LOGIN = 'auth/login';
};


/**
 * Verify Server Identify
 * @returns {*}
 */
Auth.prototype.verify = function() {

};
