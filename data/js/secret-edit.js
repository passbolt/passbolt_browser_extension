// When the page has been initialized.
$(document).bind('template-ready', function() {

    var isDecrypted = true,
        $secret = $('#js_secret'),
        $secretClear = $('#js_secret_clear'),
        $viewSecretButton = $('#js_secret_view'),
        $secretStrength = $('#js_secret_strength'),
        $securityToken = $('.security-token'),
        $generateSecretButton = $('#js_secret_generate'),
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
     * The secret is still encrypted, decrypt it.
     */
    var decryptSecret = function() {
        var armored = passbolt.context['armoredSecret'];
        if (typeof armored != 'undefined' && !armored) {
            var deferred = $.Deferred();
            deferred.resolveWith('');
            return deferred;
        } else {
            var deferred = passbolt.request('passbolt.secret.decrypt', armored);
            deferred.then(function(secret) {
                isDecrypted = true;
                originalSecret = secret;
                $secret
                    .val(secret)
                    .attr('placeholder', initialSecretPlaceholder)
                    .focus()
                    .trigger('change')
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
    passbolt.message('passbolt.secret_edition.is_updated')
        .subscribe(function(token) {
            passbolt.message('passbolt.secret_edition.is_updated.complete')
                .publish(token, 'SUCCESS', secretIsUpdated());
        });

    // Listen when the user wants to encrypt the secret for all the users the resource is shared with.
    passbolt.message('passbolt.secret_edition.encrypt')
        .subscribe(function(token, usersIds) {
            passbolt.request('passbolt.secret.encrypt', currentSecret, usersIds)
                .then(function(armoreds, usersIds) {
                    passbolt.message('passbolt.secret_edition.encrypt.complete')
                        .publish(token, 'SUCCESS', armoreds, usersIds);
                })
                .progress(function(armored, userId, completedGoals) {
                    // Notify about the progression.
                    passbolt.message('passbolt.secret_edition.encrypt.progress')
                        .publish(token, armored, userId, completedGoals);
                })
                .fail(function() {
                    throw 'ENCRYPTION_FAILED';
                });
        });

    // Listen to when the context is passed.
    passbolt.message('passbolt.context.set')
        .subscribe(function(token, status) {
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
				passbolt.messageOn('App', 'passbolt.event.trigger_to_page', 'secret_edition_secret_changed');
			}
        } else {
            decryptSecret();
        }
    });

    // When a user click on the secret/password field
    $secret.on('focus', function(ev) {
        if (!isDecrypted) {
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
