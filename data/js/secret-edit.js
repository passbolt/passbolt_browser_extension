/**
 * Edit a secret.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

// When the page has been initialized.
$(document).bind('template-ready', function() {

    var isDecrypted = true,
        $secret = $('#js_secret'),
        $secretClear = $('#js_secret_clear'),
        $viewSecretButton = $('#js_secret_view'),
        $secretStrength = $('#js_secret_strength'),
        $securityToken = $('.security-token'),
        $generateSecretButton = $('#js_secret_generate'),
        $feedback = $('#js_field_password_feedback'),
        currentSecret = '',
        originalSecret = '',
        initialSecretPlaceholder = $secret.attr('placeholder');


    /* ==================================================================================
     *  Business Events
     * ================================================================================== */

    /**
     * Show / hide the secret.
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
            // Add class on the top container.
            var containerClasses = $secretStrength.attr('class').split(' ');
            if (containerClasses.length > 1) {
                $secretStrength.removeClass(containerClasses.pop());
            }
            $secretStrength.addClass(secretComplexity.STRENGTH[strength].id);
        });
    };

    /**
    * Validate the secret.
    */
    var validate = function() {
        var deferred = null;

        // If the secret hasn't been decrypted, we consider it is valid.
        if (!isDecrypted) {
            deferred = $.Deferred();
            deferred.resolveWith(true);
        } else {
            deferred = passbolt.request('passbolt.secret.validate', {data: $secret.val()});
            deferred.then(function(){
                // If the validation is a success, hide the error feedback.
                $feedback.hide();

                // Unmark the field.
                $secret.removeClass('error');
                $secretClear.removeClass('error');

                // Resize the iframe to fit the content.
                passbolt.helper.html.resizeIframe('#passbolt-iframe-secret-edition', {
                    width: '100%'
                });
            }).then(null, function(message, validationErrors){
                var error = '';

                // Mark the field.
                $secret.addClass('error');
                $secretClear.addClass('error');

                // Display the error feedback.
                for (var i in validationErrors) {
                    for (var fieldName in validationErrors[i])
                    error += validationErrors[i][fieldName] + ' ';
                }
                $feedback
                  .html(error)
                  .show();

                // Resize the iframe to fit the content.
                passbolt.helper.html.resizeIframe('#passbolt-iframe-secret-edition', {
                    width: '100%'
                });
            });
        }

        return deferred;
    };

    /**
     * The secret is still encrypted, decrypt it.
     */
    var decryptSecret = function() {
        // If a decryption is already happening, don't trigger it twice.
        if ($secret.hasClass("decrypting")) {
            return;
        }

        var armored = passbolt.context['armoredSecret'];
        if (typeof armored != 'undefined' && !armored) {
            var deferred = $.Deferred();
            deferred.resolveWith('');
            return deferred;
        } else {
            // Add class decrypting to show something is happening.
            $secret.addClass("decrypting");

            // Change placeholder text.
            $secret.attr("placeholder", "decrypting...");

            var deferred = passbolt.request('passbolt.secret.decrypt', armored);
            deferred.then(function(secret) {
                isDecrypted = true;
                originalSecret = secret;

                $secret
                    .val(secret)
                    .attr('placeholder', initialSecretPlaceholder)
                    .focus()
                    .trigger('change')
                    .removeClass("decrypting")
                    .parent().removeClass('has-encrypted-secret');

                $generateSecretButton
                    .removeClass('disabled')
                    .removeAttr('disabled');
            });
            return deferred;
        }
    };

	/**
	 * Check if the secret has been updated.
	 * @returns {boolean}
	 */
	var secretIsUpdated = function() {
		return isDecrypted && (originalSecret != currentSecret);
	};

    /* ==================================================================================
     *  Add-on Code Events Listeners
     * ================================================================================== */

    // Listen when the app wants to know whether the secret has been updated in the secret field.
    // updated means both decrypted, and changed.
    passbolt.message.on('passbolt.secret_edition.is_updated', function(token) {
            passbolt.message.emit('passbolt.secret_edition.is_updated.complete', token, 'SUCCESS', secretIsUpdated());
        });

    // Listen when the app wants to validate the secret.
    passbolt.message.on('passbolt.secret_edition.validate', function(token) {
          validate()
            .then(function() {
              passbolt.message.emit('passbolt.secret_edition.validate.complete', token, 'SUCCESS');
            })
            .then(null, function(message, validationErrors) {
                passbolt.message.emit('passbolt.secret_edition.validate.complete', token, 'ERROR');
            });
      });

    // Listen when the user wants to encrypt the secret for all the users the resource is shared with.
    passbolt.message.on('passbolt.secret_edition.encrypt', function(token, usersIds) {
            passbolt.request('passbolt.secret.encrypt', currentSecret, usersIds)
                .then(function(armoreds, usersIds) {
                    passbolt.message.emit('passbolt.secret_edition.encrypt.complete', token, 'SUCCESS', armoreds, usersIds);
                })
                .progress(function(armored, userId, completedGoals) {
                    // Notify about the progression.
                    passbolt.message.emit('passbolt.secret_edition.encrypt.progress', token, armored, userId, completedGoals);
                })
                .then(null, function() {
                    throw 'ENCRYPTION_FAILED';
                });
        });

    // Listen to when the context is passed.
    passbolt.message.on('passbolt.context.set', function(token, status) {
            // If armoredSecret is given,
            if (passbolt.context['armoredSecret'] != undefined && passbolt.context['armoredSecret'] != '') {
                isDecrypted = false;
                $secret
                    .attr('placeholder', 'click here to unlock')
                    .parent().addClass('has-encrypted-secret');
                $generateSecretButton
                    .addClass('disabled')
                    .attr('disabled', 'disabled');
            }
        });

    // Listen to focus event.
    passbolt.message.on('passbolt.secret.focus', function(token) {
            // Set focus on the secret field.
            $secret.focus();
        });

    /* ==================================================================================
     *    View Events Listeners
     * ================================================================================== */

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
			// Notify the application regarding the change.
			if (secretIsUpdated()) {
				passbolt.message.emitOn('App', 'passbolt.event.trigger_to_page', 'secret_edition_secret_changed');
			}
        } else {
            decryptSecret();
        }
    });

    // When a user click on the secret/password field
    $secret.on('focus', function(ev) {
        if (!isDecrypted) {
            // If click is done while on the non decrypted state,
            // we remove the focus.
            // We do that because the focus will be needed by the passphrase dialog.
            $secret.blur();

            // Launch decryption.
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
        if ($(this).attr('disabled') == 'disabled') {
            return false;
        }
        // The operation requires the secret to be decrypted.
        if (isDecrypted) {
            $secret.val(secretComplexity.generate())
                .trigger('change');
        } else {
            decryptSecret();
        }
    });

    // When tab is pressed in secret field, inform app, so it can put the focus on the next field.
    $secret.keydown(function(ev) {
        if (!isDecrypted) {
            ev.preventDefault();
            return false;
        }
        var code = ev.keyCode || ev.which;
        // Backtab key.
        if (code == '9' && ev.shiftKey) {
            $secret.blur();
            passbolt.message.emitOn('App', 'passbolt.event.trigger_to_page', 'secret_backtab_pressed');
        }
        // Tab key.
        else if (code == '9') {
            $secret.blur();
            passbolt.message.emitOn('App', 'passbolt.event.trigger_to_page', 'secret_tab_pressed');
        }
    });

    /* ==================================================================================
     *    Dialog init
     * ================================================================================== */

    var init = function() {

        // Get config regarding security token, and display it.
        passbolt.request('passbolt.user.settings.get.securityToken')
            .then(
            function success(securityToken) {
                $securityToken.text(securityToken.code);
                securityToken.id = '#js_secret';
                getTpl('./tpl/secret/securitytoken-style.ejs', function (tpl) {
                    var html = new EJS({text: tpl}).render(securityToken);
                    $('head').append(html);
                });
            },
            function fail(error) {
                throw error;
            }
        );

        // Update the strength if the secret is already decrypted
        if (isDecrypted) {
            updateSecretStrength($secret.val());
        }

    };
    init();

});

// Init the page with a template.
initPageTpl();
