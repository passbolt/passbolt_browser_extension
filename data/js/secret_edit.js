// When the page has been initialized.
$(document).bind('template-ready', function() {

  var isDecrypted = false,
    $secret = $('#js_secret'),
    $secretClear = $('#js_secret_clear'),
    $viewSecretButton = $('#js_secret_view'),
    $secretStrength = $('#js_secret_strength'),
    $generateSecretButton = $('#js_secret_generate'),
    currentSecret = 'test est';

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
   * Decrypt the secret field.
   */
  var decryptSecretField = function() {
    return passbolt.cipher.decrypt(passbolt.context['armoredSecret'])
      .then(function(secret) {
        isDecrypted = true;
        $secret.val(secret)
          .trigger('change');
      });
  };

  // When the user explicitly wants to view the secret.
  $viewSecretButton.on('click', function(ev) {
    ev.preventDefault();
    // The operation requires the secret to be decrypted.
    if (isDecrypted) {
      toggleViewSecret();
    } else {
      decryptSecretField()
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
      decryptSecretField();
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
      decryptSecretField();
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
        .fail(function() {
          throw 'ENCRYPTION_FAILED';
        });
    });

});

// Init the page with a template.
initPageTpl();
