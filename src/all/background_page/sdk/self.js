/**
 * Self chrome wrapper
 */
const data =  {
  url: function(url) {
    if (typeof url === 'undefined') { url = ''; }
    return `chrome-extension://${chrome.runtime.id}/data/${url}`;
  }
};
exports.data = data;
