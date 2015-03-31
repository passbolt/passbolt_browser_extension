// When the page has been initialized.
$(document).bind('template-ready', function() {

  var isDecrypted = false,
    $secret = $('#js_secret'),
    $secretClear = $('#js_secret_clear'),
    $viewSecretButton = $('#js_secret_view'),
    $secretStrength = $('#js_secret_strength'),
    $generateSecretButton = $('#js_secret_generate'),
    currentSecret = '';

  /**
   * show / hide the secret.
   */
  var toggleViewSecret = function() {
    if ($secret.hasClass('hidden')) {
      $secret.removeClass('hidden');
      $secretClear.addClass('hidden');
      $viewSecretButton.removeClass('selected');
    } else {
      $secret.addClass('hidden');
      $secretClear.removeClass('hidden');
      $secretClear.val($secret.val());
      $viewSecretButton.addClass('selected');
    }
  };

  /**
   * Update the secret strength component.
   * @param secret
   */
  var updateSecretStrength = function(secret) {
    getTpl('./tpl/secret/strength.ejs', function(tpl) {
      var strength = secretComplexity.strength(secret);
      var data = {
        strengthId: secretComplexity.STRENGTH[strength].id,
        strengthLabel: secretComplexity.STRENGTH[strength].label
      };
      $secretStrength.html(new EJS({text: tpl}).render(data));
    });
  };

  /**
   * The secret is still encrypted, decrypt it.
   */
  var decryptSecret = function() {
    var armored = passbolt.context['armoredSecret'];
    if (typeof armored != 'undefined' && !armored) {
      var deferred = $.Deferred();
      deferred.resolveWith('');
      return deferred;
    } else {
      var deferred = passbolt.cipher.decrypt(armored);
      deferred.then(function(secret) {
          isDecrypted = true;
          $secret.val(secret)
            .trigger('change');
        });
      return deferred;
    }
  };

  // When the user explicitly wants to view the secret.
  $viewSecretButton.on('click', function(ev) {
    ev.preventDefault();
    // The operation requires the secret to be decrypted.
    if (isDecrypted) {
      toggleViewSecret();
    } else {
      decryptSecret()
        .then(function(secret) {
          toggleViewSecret();
        });
    }
  });

  // When the secret is updated.
  $secret.on('input change', function(ev) {
    // Because change is triggered even if input has been triggered previously
    // (1. user changes the input (input triggered); 2. users moves the focus (change triggered);)
    // Isolate the input binding and trigger change manually to avoid the double change call is useless.
    if ($secret.val() == currentSecret) {
      return;
    }
    currentSecret = $secret.val();

    // The operation requires the secret to be decrypted.
    if (isDecrypted) {
      var secret = $secret.val();
      $secretClear.val(secret);
      updateSecretStrength(secret);
    } else {
      decryptSecret();
    }
  });

  // When the clear secret is updated.
  $secretClear.on('input', function() {
    $secret.val($secretClear.val())
      .trigger('change');
  });

  // When the generate a new secret button is clicked.
  $generateSecretButton.on('click', function(ev) {
    ev.preventDefault();

    // The operation requires the secret to be decrypted.
    if (isDecrypted) {
      $secret.val(secretComplexity.generate())
        .trigger('change');
    } else {
      decryptSecret();
    }
  });

  // Listen when the user wants to encrypt the secret for all the users the resource is shared with.
  passbolt.message('passbolt.secret_edition.encrypt')
    .subscribe(function(token, usersIds) {
      passbolt.cipher.encrypt(currentSecret, usersIds)
        .then(function(armoreds, usersIds) {
          passbolt.message('passbolt.secret_edition.encrypt.complete')
            .publish(token, 'SUCCESS', armoreds, usersIds);
        })
        .progress(function(armored, userId, completedGoals) {
          // Notity about the progression.
          passbolt.message('passbolt.secret_edition.encrypt.progress')
            .publish(token, armored, userId, completedGoals);
        })
        .fail(function() {
          throw 'ENCRYPTION_FAILED';
        });
    });

});

// Init the page with a template.
initPageTpl();
