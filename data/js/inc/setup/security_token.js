/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'security_token',
        'label': '4. Set a security token',
        'title': 'We need a visual cue to protect us from the bad guys..',
        'parents': ['key_info', 'backup_key'],
        'next': 'password',
        'viewData': {},
        'elts' : {
            securityTokenBgColor : '#js_security_token_background',
            securityTokenTextColor : '#js_security_token_color',
            securityTokenText : '#js_security_token_text'
        },
        'options' : {
            txtpossible : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*(){}[]:;!@#$%^&*_-+=|',
            colorpossible : 'ABCDEF0123456789'
        }
    };

    /* ==================================================================================
     *  Content code events
     * ================================================================================== */

    /**
     * On token change event.
     *
     * Triggered when the token has been modified by the user.
     */
    step.onTokenChange = function() {
        if (step.elts.$securityTokenBgColor.val().length == 7 && step.elts.$securityTokenText.val().length == 3) {
            passbolt.setup.setActionState('submit', 'enabled');
        }
        else {
            passbolt.setup.setActionState('submit', 'disabled');
        }
    }

    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implements init().
     * @returns {*}
     */
     step.init = function () {
        var def = $.Deferred();
        step.viewData.securityTokenColor = passbolt.setup.data.securityTokenColor || null;
        step.viewData.securityTokenCode = passbolt.setup.data.securityTokenCode || null;
        def.resolve();
        return def;
    };

    /**
     * Implements start().
     */
    step.start = function () {
        // Color picker.
        step._initColorPicker();

        // Set random text.
        var randomText = step._getRandomText();
        step.elts.$securityTokenText.val(randomText);

        // Set random background color.
        var randomColor = step._getRandomColor();
        step.fb.setColor('#' + randomColor);

        // Check that the pre-filled values unlock the submit button.
        if (step.elts.$securityTokenBgColor.val().length != 7 || step.elts.$securityTokenText.val().length != 3) {
            passbolt.setup.setActionState('submit', 'disabled');
        }

        // While changing the security token value.
        $(step.elts.securityTokenBgColor + ', ' + step.elts.securityTokenText).on('input', function () {
            step.onTokenChange();
        });
    };

    /**
     * Implements submit().
     * @returns {*}
     */
    step.submit = function () {
        passbolt.setup.setActionState('submit', 'processing');
        var def = $.Deferred(),
            securityTokenColor = step.elts.$securityTokenBgColor.val(),
            securityTokenTextColor =  step.elts.$securityTokenTextColor.val(),
            securityTokenCode =   step.elts.$securityTokenText.val();

        // @TODO better validation & error handling
        if ($.trim(securityTokenColor).length == 7 && $.trim(securityTokenCode).length == 3) {
            passbolt.setup.data.securityTokenColor = securityTokenColor;
            passbolt.setup.data.securityTokenTextColor = securityTokenTextColor;
            passbolt.setup.data.securityTokenCode = securityTokenCode;
            def.resolve();
        }

        return def;
    };

    /**
     * Implements cancel().
     * @returns {*}
     */
    step.cancel = function () {
        passbolt.setup.setActionState('cancel', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    /* ==================================================================================
     *  Business functions
     * ================================================================================== */

    /**
     * Init color picker.
     *
     * @private
     */
    step._initColorPicker = function() {

        step.fb = $.farbtastic('#js_colorpicker');

        // callback on color picking selection.
        step.fb.linkTo(function (color) {
            var txtcolor = step._calculateTextColor();
            step.elts.$securityTokenText
                .css('color', txtcolor)
                .css('background-color', color);
            step.elts.$securityTokenBgColor.val(color);
            step.elts.$securityTokenTextColor.val(txtcolor);
        });
    };

    /**
     * Calculate text color based on background color defined in color picker.
     *
     * @returns {string}
     * @private
     */
    step._calculateTextColor = function() {
        return step.fb.hsl[2] > 0.5 ? '#000' : '#fff';
    };

    /**
     * Get a generated random color.
     *
     * @returns {string}
     *
     * @private
     */
    step._getRandomColor = function() {
        var randomColor = '';
        for (var i = 0; i < 6; i++) {
            randomColor += step.options.colorpossible.charAt(Math.floor(Math.random() * step.options.colorpossible.length));
        }
        return randomColor;
    };

    /**
     * Get a generated random text.
     *
     * @returns {string}
     *
     * @private
     */
    step._getRandomText = function() {
        var randomText = '';
        for (var i = 0; i < 3; i++) {
            randomText += step.options.txtpossible.charAt(Math.floor(Math.random() * step.options.txtpossible.length));
        }
        return randomText;
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
