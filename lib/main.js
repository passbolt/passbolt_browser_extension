// SDK includes
var debug = 1;
var pageMod = require("sdk/page-mod");
var tabs = require('sdk/tabs');
var buttons = require('sdk/ui/button/action');
var self = require("sdk/self");
var data = require("sdk/self").data;
var fileIO = require("sdk/io/file");
const { defer } = require('sdk/core/promise');
var openpgp = require("openpgp");
var FilepickerController = require("./controller/filepicker.js");
var GpgkeyController = require("./controller/gpgkey");
var CipherController = require("./controller/cipher");
var ClipboardController = require("./controller/clipboard");
var config = require("./config/config.js");
var callbacks = {};

var name = "extensions.sdk.console.logLevel";
require("sdk/preferences/service").set(name, 'all');

// @todo Relocate the sync.
// Sync the public key.
GpgkeyController.sync();

// Passbolt button on browser toolbar
var button = buttons.ActionButton({
	id: "passbolt-link",
	label: "Passbolt",
	icon: {
		"16": "./img/icon-16.png",
		"32": "./img/icon-32.png",
		"64": "./img/icon-64.png"
	},
	onClick: function(state) {
		tabs.open(data.url("config.html"));
	}
});

// Load the passbolt addon-on config app on config pages
pageMod.PageMod({
  include: data.url("config.html"),
  contentScriptWhen: 'end',
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/uuid.js'),
    data.url('js/lib/port.js'),
    data.url('js/lib/request.js'),
    data.url('js/lib/keyring.js'),
    data.url('js/lib/file.js'),
    data.url("js/config.js")
  ],
  onAttach: listenConfigEvents
});

pageMod.PageMod({
  include: 'about:blank?passbolt=masterInline*',
  contentStyleFile: [
    data.url("css/default/main.css")
  ],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/ejs_production.js'),
    data.url('js/lib/uuid.js'),
    data.url('js/template.js'),
    data.url('js/lib/port.js'),
    data.url('js/lib/request.js'),
    data.url('js/lib/keyring.js'),
    data.url("js/lib/event.js"),
    data.url('js/master.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: data.url(),
    templatePath: './tpl/keyring/master-password.ejs'
  },
  onAttach: listenMasterEvents
});

pageMod.PageMod({
  include: 'about:blank?passbolt=decryptInline*',
  contentStyleFile: [
    data.url("css/default/main.css")
  ],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/ejs_production.js'),
    data.url('js/lib/uuid.js'),
    data.url('js/template.js'),
    data.url('js/lib/port.js'),
    data.url('js/lib/request.js'),
    data.url("js/lib/cipher.js"),
    data.url('js/lib/secret_complexity.js'),
    data.url('js/lib/event.js'),
    data.url('js/secret_edit.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: data.url(),
    templatePath: './tpl/secret/edit.ejs'
  },
  onAttach: listenSecretsEvents
});

// Load the passbolt add-on main app on every page
pageMod.PageMod({
  include: /.*passbolt\.dev.*/,
  contentScriptWhen: 'ready',
  contentStyleFile: [
    data.url("css/default/dialog.css")
  ],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/uuid.js'),
    data.url("js/lib/event.js"),
    data.url('js/lib/port.js'),
    data.url('js/lib/request.js'),
    data.url("js/lib/cipher.js"),
    data.url("js/lib/clipboard.js"),
    data.url("js/app.js")
  ],
  contentScriptOptions: {
    config: config,
    data_path: data.url()
  },
  onAttach: listenAppEvents
});

var workers = {};

var includeTemplateListeners = function (worker) {
  // A template is requested.
  worker.port.on('passbolt.template.get', function (tplPath, token) {
    var tpl = data.load(tplPath);
    worker.port.emit('passbolt.template.send', tpl, token);
  });
};

var masterPasswordRequiredFor = function(func, token) {
  var deferred = defer(),
    masterPassword = null,
    funcArgs = Array.slice(arguments, 2),
    funcResult = null,
    tries = 0,
    _loop = function(masterPassword) {
      var masterPassword = typeof masterPassword != 'undefined' ? masterPassword : null;

      // 3 tries authorized.
      if (tries > 2) {
        deferred.reject();
        workers['App'].port.emit('passbolt.keyring.master.request.close', token);
        return;
      }

      // Try to perform the operation til the user succeed or tried 3 times.
      try {
        // The function should throw a REQUEST_MASTER_PASSWORD exception if the one provided doesn't help to decrypt the key.
        var funcArgsWithMp = Array.slice(funcArgs);
        funcArgsWithMp.push(masterPassword);
        funcResult = func.apply(null, funcArgsWithMp);
        workers['App'].port.emit('passbolt.keyring.master.request.close', token);
        deferred.resolve(funcResult);
      }
      catch(exception) {
        if (masterPassword !== null) {
          workers['MasterPassword'].port.emit('passbolt.keyring.master.request.complete', token, 'ERROR');
        } else {
          callbacks[token] = function(token, masterPassword) {
            _loop(masterPassword);
          };
          workers['App'].port.emit('passbolt.keyring.master.request', token);
        }
      }
      tries++;
    };
  _loop();

  return deferred.promise;
};

var includeCipherListeners = function (worker) {
  // Listen on cipher decrypt request event.
  worker.port.on("passbolt.cipher.decrypt", function(token, txt) {
    var decrypted = null;

    // Master pwd is required to decrypt a secret.
    masterPasswordRequiredFor(CipherController.decrypt, token, worker, txt)
      .then(function(decrypted) {
        worker.port.emit('passbolt.cipher.decrypt.complete', token, 'SUCCESS', decrypted);
      });
  });
  // Listen on cipher encrypt request event.
  worker.port.on("passbolt.cipher.encrypt", function(token, unarmored, usersIds) {
    var armoreds = CipherController.encrypt(worker, unarmored, usersIds);
    worker.port.emit('passbolt.cipher.encrypt.complete', token, 'SUCCESS', armoreds, usersIds);
  });
};

// Listen from application pagemod messages
function listenMasterEvents(worker) {
  workers['MasterPassword'] = worker;

  includeTemplateListeners(worker);
  includeEventListeners(worker);

  worker.port.on('passbolt.keyring.master.request.submit', function(token, masterPassword) {
    callbacks[token](token, masterPassword);
  });
}

var includeClipboardListeners = function (worker) {
  // Listen on copy to clipboard event.
  worker.port.on("passbolt.clipboard.copy", function(txt) {
    ClipboardController.copy(worker, txt);
  });
};

var includeContextListeners = function (worker) {
  // Set context variables on the target worker.
  worker.port.on("passbolt.context.dispatch", function(toWorker, name, value) {
    workers[toWorker].port.emit('passbolt.context.set', name, value);
  });
};

var includeEventListeners = function (worker) {
  // Dispatch an event to another worker.
  worker.port.on("passbolt.event.dispatch", function(toWorker, eventName) {
    var args = Array.slice(arguments, 1);
    workers[toWorker].port.emit.apply(null, args);
  });

  // Dispatch an request to another worker.
  var callbacks = {};
  var disptacherFunc = function(token) {
    if(callbacks[token]) {
      var request = callbacks[token].request,
        args = Array.slice(arguments);
      args.unshift(request + '.complete');
      callbacks[token].func.apply(null, args);
      workers[callbacks[token].toWorker].port.removeListener(request + '.complete', callbacks[token].func);
      delete(callbacks[token]);
    }
  };
  worker.port.on("passbolt.request.dispatch", function(toWorker, request, token) {
    callbacks[token] = {
      request: request,
      toWorker: toWorker,
      func: function() {
        worker.port.emit.apply(null, Array.slice(arguments));
      }
    };

    workers[toWorker].port.on(request + '.complete', disptacherFunc);
    workers[toWorker].port.emit.apply(null, Array.slice(arguments, 1));
  });
};

var includeFileListeners = function (worker) {
  // Listen on request to prompt a file.
  worker.port.on("passbolt.file.prompt", function(token) {
    var path = FilepickerController.promptForFile();
    if(fileIO.isFile(path)) {
      var fileContent = fileIO.read(path);
      worker.port.emit("passbolt.file.prompt.complete", token, 'SUCCESS', fileContent);
    }
  });
};

// Listen from application pagemod messages
function listenSecretsEvents(worker) {
  workers['Secret'] = worker;

  includeTemplateListeners(worker);
  includeCipherListeners(worker);
  includeContextListeners(worker);
  includeEventListeners(worker);
}

// Listen from application pagemod messages
function listenAppEvents(worker) {
  workers['App'] = worker;

  includeTemplateListeners(worker);
  includeCipherListeners(worker);
  includeClipboardListeners(worker);
  includeContextListeners(worker);
  includeEventListeners(worker);

  worker.port.on('passbolt.iframe.context', function(name, value) {
    workers['Secret'].port.emit('passbolt.iframe.context', name, value);
  });
}

// Listen from config pagemod messages
function listenConfigEvents(worker) {
  includeFileListeners(worker);

  // Send the private key information to the content code.
  var privInfo = GpgkeyController.privateKeyInfo(worker);
  worker.port.emit("passbolt.keyring.privateKeyInfo", privInfo);

  // Listen on import private key event.
  worker.port.on("passbolt.keyring.private.import", function(token, txt) {
    var result = true;
    if ((result = GpgkeyController.importPrivate(worker, txt)) !== true) {
      worker.port.emit("passbolt.keyring.private.import.complete", token, 'ERROR', result);
    } else {
      worker.port.emit("passbolt.keyring.private.import.complete", token, 'SUCCESS');
    }
  });

  // Listen on the visual code save event.
  worker.port.on("passbolt.settings.visual_code.save", function(token, code, label) {
    if ((result = SettingsController.saveVisualCode(code, label)) !== true) {
      worker.port.emit("passbolt.settings.visual_code.save.complete", token, 'ERROR', result);
    } else {
      worker.port.emit("passbolt.settings.visual_code.save.complete", token, 'SUCCESS', result);
    }
  });

}

//tabs.open(data.url("config.html"));
