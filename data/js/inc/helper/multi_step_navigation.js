var passbolt = passbolt || {};
passbolt.helper = passbolt.helper || {};
passbolt.helper.multiStepNavigation = passbolt.helper.multiStepNavigation || {};

(function (passbolt) {

    /**
     * Constructor.
     * @param options
     */
    passbolt.helper.multiStepNavigation = function(options) {

        // Default settings.
        this.settings = {
            // First step id.
            firstStepId : 'domain_check',

            defaultStepActions : {
                'submit': 'enabled',
                'cancel': 'enabled'
            },
            // Actions and their default states.
            actionsStates : {
                'submit': 'enabled',
                'cancel': 'enabled'
            },
            // Actions wrapper element.
            actionsWrapperSelector: '#js_step_actions',
            // Menu wrapper element.
            menuWrapperSelector: '#js_menu',
            // Content wrapper element.
            contentWrapperSelector: '#js_step_content',
            // Title element.
            titleSelector: '#js_step_title'
        };

        // Extend default settings with given options.
        this.settings = $.extend(this.settings, options);

        // Init elements.
        this.$actionsWrapper = $(this.settings.actionsWrapperSelector);
        this.$menuWrapper = $(this.settings.menuWrapperSelector);
        this.$contentWrapper = $(this.settings.contentWrapperSelector);
        this.$title = $(this.settings.titleSelector);
    };

    /**
     *
     */
    passbolt.helper.multiStepNavigation.prototype.goForward = function() {

    };

})( passbolt );