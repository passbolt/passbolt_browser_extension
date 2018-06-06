const whitelist = ['default', 'midgar'];
const url = new URL(window.location.href);
let theme = url.searchParams.get('theme');
if(typeof theme === 'undefined' || whitelist.indexOf(theme) === -1) {
  theme = 'default';
}
const link = document.createElement('link');
link.href = `css/themes/${theme}/ext_iframe.min.css`;
link.type = 'text/css';
link.rel = 'stylesheet';
link.media = 'all';
document.getElementsByTagName("head")[0].appendChild(link);
