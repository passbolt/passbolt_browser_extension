/**
 * Grunt Task to compile passbolt EJS template
 * This is required to avoid 'unsafe-eval' CSP in the web extension
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
module.exports = function(grunt) {
  'use strict';
  var ejs = require('ejs');
  grunt.registerMultiTask('ejs_compile', 'compile ejs-compile templates', function() {
    var groups = [];

    /**
     * Compile an EJS template of a certain group
     *
     * @param group ejs template group
     * @param name ejs template name
     * @param content EJS template
     * @returns {string}
     */
    function compile(filename, content) {
      // compile
      var fn = ejs.compile(content, {
        client: true,
        compileDebug: true,
        filename: filename
      });

      // replace anonymous function definition
      // with namespaced object
      var data = fn.toString().split('\n');
      // var header = 'var templates = templates || {};';
      // header += 'templates.' + group + '= templates.' + group + ' || {};';
      // header += 'templates.' + group + '.' + name + ' = function ';
      var header = 'module.exports = function';
      data.splice(0, 1, data[0].replace(/^function anonymous/, header));
      var template = data.join('\n');

      return template;
    }

    // Loop through all EJS files, compile them and write them on disk
    this.files.forEach(function(file) {
      // Extract the subfolder and name from file path
      var path = file.src[0].split('.ejs')[0].split('/');
      var folder = path[path.length -2];
      var name = path[path.length -1];

      // read content, compile and write to file
      var content = grunt.file.read(file.src[0]);
      var template = compile(file.src[0], content);
      grunt.file.write(file.dest, template);

      // buffer group includes requires
      if (typeof groups[folder] === 'undefined') {
        var header = "window.templates = window.templates || {};\n";
        header += "window.templates." + folder + " = window.templates." + folder + " || {};\n";
        groups[folder] = header;
      }
      var require = "window.templates." + folder + "." + name + " = require('./" + folder + "/" + name + ".js');\n"
      groups[folder] += require;
      grunt.log.ok('compile success ' + file.dest);
    }, this);

    // Write the include files
    for(var group in groups) {
      var groupDest = this.data.dest + group + '.js';
      grunt.file.write(groupDest, groups[group]);
      grunt.log.ok('compile success ' + groupDest);
    }
  });
};
