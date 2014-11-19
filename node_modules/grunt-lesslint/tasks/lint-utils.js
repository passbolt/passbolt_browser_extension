(function() {
  var findLessMapping, findPropertyLineNumber, getPropertyName, _;

  _ = require('underscore');

  getPropertyName = function(line) {
    var colon, curly, propertyName;
    if (line == null) {
      line = '';
    }
    line = line.trim();
    if (line.slice(0, 2) === '/*') {
      return null;
    }
    colon = line.indexOf(':');
    if (colon > 0) {
      propertyName = line.substring(0, colon);
      curly = propertyName.indexOf('{');
      if (curly !== -1) {
        propertyName = propertyName.substring(curly + 1).trim();
      }
      return propertyName;
    } else {
      return null;
    }
  };

  findLessMapping = function(css, lineNumber) {
    var commentLine, filePath, lessLineNumber, lines, match;
    if (css == null) {
      css = '';
    }
    if (lineNumber == null) {
      lineNumber = 0;
    }
    if (_.isString(css)) {
      lines = css.split('\n');
    } else {
      lines = css;
    }
    lineNumber = Math.max(0, Math.min(lineNumber, lines.length - 1));
    commentLine = lineNumber;
    lessLineNumber = -1;
    while (commentLine >= 0) {
      if (match = /^\s*\/\* line (\d+), (.+) \*\/\s*$/.exec(lines[commentLine])) {
        lineNumber = parseInt(match[1]) - 1;
        filePath = match[2];
        return {
          lineNumber: lineNumber,
          filePath: filePath
        };
      }
      commentLine--;
    }
    return {
      lineNumber: -1,
      filePath: null
    };
  };

  findPropertyLineNumber = function(contents, lineNumber, propertyName) {
    var lines;
    if (contents == null) {
      contents = '';
    }
    if (lineNumber == null) {
      lineNumber = 0;
    }
    if (propertyName == null) {
      propertyName = '';
    }
    if (!(contents && propertyName)) {
      return -1;
    }
    if (_.isString(contents)) {
      lines = contents.split('\n');
    } else {
      lines = contents;
    }
    lineNumber = Math.max(0, Math.min(lineNumber, lines.length - 1));
    while (lineNumber < lines.length) {
      if (propertyName === getPropertyName(lines[lineNumber])) {
        return lineNumber;
      }
      lineNumber++;
    }
    return -1;
  };

  module.exports = {
    getPropertyName: getPropertyName,
    findLessMapping: findLessMapping,
    findPropertyLineNumber: findPropertyLineNumber
  };

}).call(this);
