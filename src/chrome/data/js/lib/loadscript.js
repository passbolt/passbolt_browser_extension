// loads an individual script
var loadScript = function (path) {
  // generate promise
  return new Promise(function (fulfill, reject) {
    // create object
    var script = document.createElement('script');

    // when it loads or the ready state changes
    script.onload = script.onreadystatechange = function () {
      // make sure it's finished, then fullfill the promise
      if (!this.readyState || this.readyState == 'complete') fulfill(this);
    };

    // begin loading it
    script.src = path;

    // add to head
    document.getElementsByTagName('head')[0].appendChild(script);
  });
};

// this is the one you want
var loadScripts = function (scripts) {
  return scripts.reduce(function (queue, path) {
    // once the current item on the queue has loaded, load the next one
    return queue.then(function () {
      // individual script
      return loadScript(path);
    });
  }, Promise.resolve() /* this bit is so queue is always a promise */);
};
