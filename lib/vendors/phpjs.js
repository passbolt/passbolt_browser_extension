
exports.stripslashes = function stripslashes(str) {
    // @credit: http://phpjs.org/functions/stripslashes/
    return (str + '')
        .replace(/\\(.?)/g, function(s, n1) {
            switch (n1) {
                case '\\':
                    return '\\';
                case '0':
                    return '\u0000';
                case '':
                    return '';
                default:
                    return n1;
            }
        });
};

exports.urldecode = function(str) {
    // @credit: http://phpjs.org/functions/urldecode/
    return decodeURIComponent((str + '')
        .replace(/%(?![\da-f]{2})/gi, function() {
            // PHP tolerates poorly formed escape sequences
            return '%25';
        })
        .replace(/\+/g, '%20'));
};
