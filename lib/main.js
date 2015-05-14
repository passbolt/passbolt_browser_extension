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
var pageMods = {};

var Config = require("./model/config");
var FilepickerController = require("./controller/filepicker");
var GpgkeyController = require("./controller/gpgkey");
var SecretController = require("./controller/secret");
var ClipboardController = require("./controller/clipboard");
var SetupController = require("./controller/setup");
var UserController = require("./controller/user");

/**
 * @todo To be clearly documented.
 */
var callbacks = {};
//Config.write('baseUrl', 'http://passbolt.dev');

/**
 * @todo User to have the console, can be removed if not in debug mode.
 */
var name = "extensions.sdk.console.logLevel";
require("sdk/preferences/service").set(name, 'all');

// @todo move somewhere else, if still used
// @reference from MDN.
function escapeRegExp(string){
  return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
}

// Passbolt button on browser toolbar
var button = buttons.ActionButton({
	id: "passbolt-link",
	label: "Passbolt",
	icon: {
		"16": "./img/logo/icon-16.png",
		"32": "./img/logo/icon-32.png",
		"64": "./img/logo/icon-64.png"
	},
	onClick: function(state) {
    if (Config.read('baseUrl')) {
      tabs.open(Config.read('baseUrl'));
    }
    else {
      tabs.open('http://www.passbolt.com');
    }
	}
});

var workers = {};

pageMods.setup = pageMod.PageMod({
  include: data.url("setup.html"),
  contentScriptWhen: 'end',
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/ejs_production.js'),
    data.url('js/lib/uuid.js'),
    data.url("js/lib/farbtastic.js"),
    data.url('js/template.js'),
    data.url('js/inc/file.js'),
    data.url('js/inc/port.js'),
    data.url('js/inc/request.js'),
    data.url('js/inc/keyring.js'),
    data.url("js/inc/event.js"),
    data.url("js/inc/secret_complexity.js"),
    data.url('js/inc/setup/domain_check.js'),
    data.url('js/inc/setup/define_key.js'),
    data.url('js/inc/setup/import_key.js'),
    data.url('js/inc/setup/secret.js'),
    data.url('js/inc/setup/generate_key.js'),
    data.url('js/inc/setup/key_info.js'),
    data.url('js/inc/setup/security_token.js'),
    data.url('js/inc/setup/password.js'),
    data.url('js/setup.js')
  ],
  contentScriptOptions: {
    config: Config.readAll()
  },
  onAttach: listenSetupEvents
});

pageMods.setupBootstrap = pageMod.PageMod({
  include: new RegExp(Config.read('setupBootstrapRegex') + ".*"),
  contentScriptWhen: 'ready',
  contentStyleFile: [],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url("js/setup-bootstrap.js")
  ],
  contentScriptOptions: {
    config: Config.readAll()
  },
  onAttach: listenSetupBootstrapEvents
});

// Load the passbolt addon-on config app on config pages
pageMods.configDebug = pageMod.PageMod({
  include: data.url("config-debug.html"),
  contentScriptWhen: 'end',
  contentStyleFile: [
    data.url("css/config_debug_ff.css"),
  ],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/uuid.js'),
    data.url('js/inc/port.js'),
    data.url('js/inc/request.js'),
    data.url('js/inc/keyring.js'),
    data.url('js/inc/file.js'),
    data.url("js/config-debug.js")
  ],
  onAttach: listenConfigDebugEvents
});

pageMods.iframeMasterPwd = pageMod.PageMod({
  include: 'about:blank?passbolt=masterInline*',
  contentStyleFile: [
    data.url("css/main_ff.css")
  ],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/ejs_production.js'),
    data.url('js/lib/uuid.js'),
    data.url('js/template.js'),
    data.url('js/inc/port.js'),
    data.url('js/inc/request.js'),
    data.url('js/inc/keyring.js'),
    data.url("js/inc/event.js"),
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

pageMods.iframeProgress = pageMod.PageMod({
  include: 'about:blank?passbolt=progressInline*',
  contentStyleFile: [
    data.url("css/main_ff.css")
  ],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/ejs_production.js'),
    data.url('js/lib/uuid.js'),
    data.url('js/template.js'),
    data.url('js/inc/port.js'),
    data.url("js/inc/event.js"),
    data.url('js/progress.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: data.url(),
    templatePath: './tpl/progress/progress.ejs'
  },
  onAttach: listenProgressEvents
});

pageMods.iframeDecrypt = pageMod.PageMod({
  include: 'about:blank?passbolt=decryptInline*',
  contentStyleFile: [
    data.url("css/main_ff.css")
  ],
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    data.url('js/lib/ejs_production.js'),
    data.url('js/lib/uuid.js'),
    data.url('js/template.js'),
    data.url('js/inc/port.js'),
    data.url('js/inc/request.js'),
    data.url("js/inc/secret.js"),
    data.url('js/inc/secret_complexity.js'),
    data.url('js/inc/event.js'),
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

// Init the passbolt pageMod.
var initPassboltAppPageMod = function() {
  pageMods.passboltApp = pageMod.PageMod({
    include: Config.read('baseUrl') + "*",
    contentScriptWhen: 'ready',
    contentStyleFile: [
      data.url("css/external.css")
    ],
    contentScriptFile: [
      data.url("js/lib/jquery-2.1.1.min.js"),
      data.url('js/lib/uuid.js'),
      data.url("js/inc/event.js"),
      data.url('js/inc/port.js'),
      data.url('js/inc/request.js'),
      data.url("js/inc/secret.js"),
      data.url("js/inc/clipboard.js"),
      data.url("js/app.js")
    ],
    contentScriptOptions: {
      config: Config.readAll()
    },
    onAttach: listenAppEvents
  });
};
initPassboltAppPageMod();

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

var includeGpgkeyListeners = function (worker) {
  // Listen on secret encrypt request event.
  worker.port.on("passbolt.gpgkey.generate_key_pair", function(token, keyInfo) {
    // Build userId.
    var userId = keyInfo.name +
      (keyInfo.comment != '' ? " (" + keyInfo.comment + ")" : "") +
      " <" + keyInfo.email + ">";
    var key = GpgkeyController
      .generateKeyPair(worker, userId, keyInfo.masterKey, keyInfo.lgth);
    worker.port.emit(
      "passbolt.gpgkey.generate_key_pair.complete",
      token,
      'SUCCESS',
      key
    );
  });

  // Retrieve the public key information.
  worker.port.on("passbolt.gpgkeys.sync", function(token) {
    GpgkeyController.sync(worker)
      .then(function(keysCount) {
        worker.port.emit("passbolt.gpgkeys.sync.complete", token, 'SUCCESS', keysCount);
      });
  });

  // Retrieve the public key information.
  worker.port.on("passbolt.gpgkey.publicKeyInfo", function(token, publicArmoredKey) {
    var info = GpgkeyController.publicKeyInfo(worker, publicArmoredKey);
    worker.port.emit("passbolt.gpgkey.publicKeyInfo.complete", token, 'SUCCESS', info);
  });
}

var includeUserListeners = function(worker) {
  // Retrieve the current user.
  worker.port.on("passbolt.user.me", function(token) {
    UserController.findCurrentUser()
      .then(
      function(user) {
        worker.port.emit("passbolt.user.me.complete", token, 'SUCCESS', user)
      },
      function(response) {
        worker.port.emit("passbolt.user.me.complete", token, 'ERROR', response)
      });

  });
}

var includeSecretListeners = function (worker) {
  // Listen on secret decrypt request event.
  worker.port.on("passbolt.secret.decrypt", function(token, txt) {
    var decrypted = null;

    // Master pwd is required to decrypt a secret.
    masterPasswordRequiredFor(SecretController.decrypt, token, worker, txt)
      .then(function(decrypted) {
        worker.port.emit('passbolt.secret.decrypt.complete', token, 'SUCCESS', decrypted);
      });
  });

  // Listen on secret encrypt request event.
  worker.port.on("passbolt.secret.encrypt", function(token, unarmored, usersIds) {
    // Ensure the keyring of public keys is in sync.
    GpgkeyController.sync()
      .then(function(keysCount) {
        // The encrypted results.
        var armoreds = {},
          completedGoals = 0;

        // If at least one public key has been updated, notify the application.
        if (keysCount) {
          var keysUpdatedTxt = ' key was updated';
          if (keysCount > 1) {
            keysUpdatedTxt = ' keys were updated'
          }
          var notification = {
            'status': 'success',
            'title': keysCount + keysUpdatedTxt,
            'message': ''
          };
          workers['App'].port.emit('passbolt.event.trigger_to_page', 'passbolt_notify', notification);
        }

        for (var i in usersIds) {
          var armored = SecretController.encrypt(worker, unarmored, usersIds[i]);
          armoreds[usersIds[i]] = armored;
          completedGoals ++;
          worker.port.emit('passbolt.secret.encrypt.progress', token, armored, usersIds[i], completedGoals);
        }
        worker.port.emit('passbolt.secret.encrypt.complete', token, 'SUCCESS', armoreds, usersIds);
      });
  });
};

var includeConfigListeners = function (worker) {
  // Listen on config read events.
  worker.port.on("passbolt.config.read", function(token, name) {
    worker.port.emit("passbolt.config.read.complete", token, 'SUCCESS', Config.read(name));
  });

  // Listen on config read all events, and return several entries of config.
  worker.port.on("passbolt.config.readAll", function(token, names) {
    var conf = {};
    for (i in names) {
      conf[names[i]] = Config.read(names[i]);
    }
    worker.port.emit("passbolt.config.readAll.complete", token, 'SUCCESS', conf);
  });

  // Debug the config.
  worker.port.on("passbolt.config.debug", function(token) {
    if (Config.read("debug") == true) {
      tabs.activeTab.url = data.url("config-debug.html");
    }
    worker.port.emit("passbolt.config.debug.complete", token, 'SUCCESS');
  });

  // If config is in debug mode, we allow to write in the config.
  if (Config.read('debug') == true) {
    // Listen on config read events.
    worker.port.on("passbolt.config.write", function(token, name, value) {
      var write = Config.write(name, value);
      if (write) {
        worker.port.emit("passbolt.config.write.complete", token, 'SUCCESS');
      }
    });
  }
}

var includeClipboardListeners = function (worker) {
  // Listen on copy to clipboard event.
  worker.port.on("passbolt.clipboard.copy", function(txt) {
    ClipboardController.copy(worker, txt);
  });
};

var includeKeyringListeners = function (worker) {
  // Send the private key information to the content code.
  worker.port.on("passbolt.keyring.privateKeyInfo", function(token) {
    var info = GpgkeyController.privateKeyInfo(worker);
    worker.port.emit("passbolt.keyring.privateKeyInfo.complete", token, 'SUCCESS', info);
  });

  // Send the private key information to the content code.
  worker.port.on("passbolt.keyring.publicKeyInfo", function(token, publicKeyArmored) {
    var info = GpgkeyController.publicKeyInfo(worker, publicKeyArmored);
    worker.port.emit("passbolt.keyring.publicKeyInfo.complete", token, 'SUCCESS', info);
  });

  // Find the public key for a given user.
  worker.port.on("passbolt.keyring.findPublicKey", function(token, userId) {
    var publicKey = GpgkeyController.findPublicKey(worker, userId);
    worker.port.emit("passbolt.keyring.findPublicKey.complete", token, 'SUCCESS', publicKey);
  });

  // Extract the public key from a private armored key.
  worker.port.on("passbolt.keyring.extractPublicKey", function(token, privateKeyArmored) {
    var publicKeyArmored = GpgkeyController.extractPublicKey(worker, privateKeyArmored);
    worker.port.emit("passbolt.keyring.extractPublicKey.complete", token, 'SUCCESS', publicKeyArmored);
  });

  // Listen on import private key event.
  worker.port.on("passbolt.keyring.private.import", function(token, txt) {
    var result = true;
    if ((result = GpgkeyController.importPrivate(worker, txt)) !== true) {
      worker.port.emit("passbolt.keyring.private.import.complete", token, 'ERROR', result);
    } else {
      worker.port.emit("passbolt.keyring.private.import.complete", token, 'SUCCESS');
    }
  });

  // Listen on import public key event.
  worker.port.on("passbolt.keyring.public.import", function(token, txt, meta) {
    var result = true;
    if ((result = GpgkeyController.importPublic(worker, txt, meta)) !== true) {
      worker.port.emit("passbolt.keyring.public.import.complete", token, 'ERROR', result);
    } else {
      worker.port.emit("passbolt.keyring.public.import.complete", token, 'SUCCESS');
    }
  });
}

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

  // Dispatch a request to another worker.
  var callbacks = {};
  var completedCallback = function(token) {
    // If a callback exists for the given token, execute it.s
    if(callbacks[token]) {
      var request = callbacks[token].request,
        args = Array.slice(arguments);
      // Add the message to the message's arguments.
      args.unshift(request + '.complete');
      // Launch the callback associated to the request.
      callbacks[token].completedCallback.apply(null, args);
      // Remove the listener on the complete event.
      workers[callbacks[token].toWorker].port.removeListener(request + '.complete', callbacks[token].completedCallback);
      // Remove the listener on the progress event.
      workers[callbacks[token].toWorker].port.removeListener(request + '.progress', callbacks[token].progressCallback);
      // Delete the callback in the callback stack.
      delete(callbacks[token]);
    }
  };
  var progressCallback = function(token) {
    // If a callback exists for the given token, execute it.s
    if(callbacks[token]) {
      var request = callbacks[token].request,
        args = Array.slice(arguments);
      // Add the message to the message's arguments.
      args.unshift(request + '.progress');
      // Launch the callback associated to the request.
      callbacks[token].progressCallback.apply(null, args);
    }
  };
  worker.port.on("passbolt.request.dispatch", function(toWorker, request, token) {
    // @todo For now the common behavior is : if the worker doesn't exist, don't dispatch. No error, no exception.
    if (!workers[toWorker]) {
      return;
    }
    callbacks[token] = {
      request: request,
      toWorker: toWorker,
      completedCallback: function() {
        worker.port.emit.apply(null, Array.slice(arguments));
      },
      progressCallback: function() {
        worker.port.emit.apply(null, Array.slice(arguments));
      }
    };

    // Listen to the complete message on the worker we emit the request.
    workers[toWorker].port.on(request + '.complete', completedCallback);
    // Listen to the progress message on the worker we emit the request.
    workers[toWorker].port.on(request + '.progress', progressCallback);
    // Emit the message on the target worker.
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

// Listen from master pagemod messages
function listenMasterEvents(worker) {
  workers['MasterPassword'] = worker;

  includeTemplateListeners(worker);
  includeEventListeners(worker);
  includeConfigListeners(worker);

  worker.port.on('passbolt.keyring.master.request.submit', function(token, masterPassword) {
    callbacks[token](token, masterPassword);
  });
}

// Listen from application pagemod messages
function listenProgressEvents(worker) {
  workers['Progress'] = worker;

  includeTemplateListeners(worker);
  includeEventListeners(worker);
}

// Listen from application pagemod messages
function listenSecretsEvents(worker) {
  workers['Secret'] = worker;
  includeTemplateListeners(worker);
  includeSecretListeners(worker);
  includeContextListeners(worker);
  includeEventListeners(worker);
  includeConfigListeners(worker);
}

// Listen from application pagemod messages
function listenAppEvents(worker) {
  workers['App'] = worker;
  includeTemplateListeners(worker);
  includeSecretListeners(worker);
  includeClipboardListeners(worker);
  includeContextListeners(worker);
  includeEventListeners(worker);
  includeConfigListeners(worker);

  worker.port.on('passbolt.iframe.context', function(name, value) {
    workers['Secret'].port.emit('passbolt.iframe.context', name, value);
  });
}

// Listen from setup bootstrap pagemod messages
function listenSetupBootstrapEvents(worker) {
  worker.port.on('passbolt.setup.plugin_check', function(info) {
    // Redirect the user to the second step.
    tabs.activeTab.url = data.url("setup.html");
    // Once the tab is ready, init the setup with the information already gathered.
    tabs.activeTab.on('ready', function() {
      workers['Setup'].port.emit("passbolt.setup.init", info);
    });
  });
}

// Listen from setup pagemod messages
function listenSetupEvents(worker) {
  workers['Setup'] = worker;
  includeTemplateListeners(worker);
  includeClipboardListeners(worker);
  includeContextListeners(worker);
  includeGpgkeyListeners(worker);
  includeEventListeners(worker);
  includeFileListeners(worker);
  includeKeyringListeners(worker);

  // Init / Reset the setup. (delete config, flush keyring, etc..)
  worker.port.on("passbolt.setup.init", function(token) {
    SetupController.reset();
    worker.port.emit("passbolt.setup.init.complete", token, 'SUCCESS');
  });

  // The setup has been completed, save the information
  worker.port.on("passbolt.setup.save", function(token, data) {
    SetupController.save(data)
      .then(function() {
        // Destroy the passbolt application pageMod.
        pageMods.passboltApp.destroy();
        // And restart it to make it able to be initialized regarding the variables we gathered during the setup.
        initPassboltAppPageMod();
        worker.port.emit("passbolt.setup.save.complete", token, 'SUCCESS');
      });
  });
}

// Listen from setup pagemod messages
function listenConfigDebugEvents(worker) {
  workers['ConfigDebug'] = worker;
  includeTemplateListeners(worker);
  includeContextListeners(worker);
  includeGpgkeyListeners(worker);
  includeEventListeners(worker);
  includeFileListeners(worker);
  includeKeyringListeners(worker);
  includeConfigListeners(worker);
  includeUserListeners(worker);
}

