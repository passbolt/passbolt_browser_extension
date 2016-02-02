var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.data = passbolt.setup.data || {};

(function($) {
  // The current step id the user is working on.
  var currentStepId = null,
    // The past steps the user went through.
    pastSteps = [],
    // Default actions available at each step.
    defaultStepActions = {'submit': 'enabled', 'cancel': 'enabled'},
    // Actions and their default states.
    actionsStates = {
      'submit': 'enabled',
      'cancel': 'enabled'
    },
    // Actions wrapper element.
    $actionsWrapper = $('#js_step_actions'),
    // Menu wrapper element.
    $menuWrapper = $('#js_menu'),
    // Content wrapper element.
    $contentWrapper =  $('#js_step_content'),
    // Title element.
    $title = $('#js_step_title');

  /**
   * Get the potential next steps of a step.
   * @param stepId
   * @param arr
   * @returns {*|Array}
   */
  passbolt.setup.getNextSteps = function(targetStepId, arr) {
    var arr = arr || [],
      potentialChildren = [],
      favoriteChild = null;

    // Look for future.
    for (var stepId in passbolt.setup.steps) {
      if (passbolt.setup.steps[stepId].parents) {
        if (passbolt.setup.steps[stepId].parents.indexOf(targetStepId) != -1) {
          potentialChildren.push(stepId);
        }
      }
    }

    // Look for the default way.
    if (potentialChildren.length) {
      // Look for the favorite child, by default it's always the last one :D
      for (var i=0; i<potentialChildren.length; i++) {
        favoriteChild = potentialChildren[i];
        if(passbolt.setup.steps[potentialChildren[i]].favorite) {
          break;
        }
      }
      arr.push(favoriteChild);
      passbolt.setup.getNextSteps(favoriteChild, arr);
    }

    return arr;
  };

  /**
   * Get the workflow.
   * @param targetStepId
   * @param arr
   * @returns {*|Array}
   */
  passbolt.setup.getWorkflow = function() {
    var workflow = pastSteps.slice(0);
    workflow.push(currentStepId);
    workflow = workflow.concat(passbolt.setup.getNextSteps(currentStepId));
    return workflow;
  };

  /**
   * Get the menu items.
   * @returns {*|Array}
   */
  passbolt.setup.getMenuSteps = function(targetStepId) {
    if (targetStepId == undefined) {
      targetStepId = currentStepId;
    }

    // Get the current workflow.
    var workflow = passbolt.setup.getWorkflow(targetStepId),
      menuSteps = [],
      state = null;

    for (var i in workflow) {
      var stepId = workflow[i],
        step = passbolt.setup.steps[stepId];

      // If the task is a subStep, so it is not visible, and its parent become current
      if (step.subStep) {
        if (step.id == targetStepId) {
          menuSteps[menuSteps.length - 1].state = 'current';
        }
        continue;
      }

      // If the step is the current step.
      if (step.id == targetStepId) {
        state = 'current';
      }
      // If the latest state was current or future, this step is in the future.
      else if (menuSteps.length && (menuSteps[menuSteps.length - 1].state == 'current'
        || menuSteps[menuSteps.length - 1].state == 'future')) {
        state = 'future';
      }
      // The step is a past step
      else {
        state = 'past';
      }

      menuSteps.push({
        'stepId': stepId,
        'state': state
      });
    }

    return menuSteps;
  };

  /**
   * Set an action state.
   * @param action
   * @param state
   */
  passbolt.setup.setActionState = function(action, state) {
    // Go out of the previous state.
    var $action = $('#js_setup_' + action + '_step');
    // Remove the previous state class.
    $action.removeClass (function (index, css) {
      return (css.match (/(^|\s)js-state-\S+/g) || []).join(' ');
    });
    $action.removeClass('disabled hidden enabled processing');

    // Go in the new state.
    actionsStates[action] = state;
    // Add the new state class.
    $action.addClass('js-state-' + state).addClass(state);
  };

  /**
   * Init action buttons for the step according to what is defined
   * in the step data.
   *
   * @param stepId
   *   step Id.
   */
  passbolt.setup.initActionButtons = function(stepId) {
    var step = passbolt.setup.steps[stepId];

    // Empty actions container.
    $actionsWrapper.empty();

    // Get template for actions, and render it.
    getTpl('./tpl/setup/action_buttons.ejs', function(tpl) {

      // Render.
      $actionsWrapper.html(new EJS({text: tpl}).render());

      // Define which actions are available, as well as their states.
      // This is based on defaultActions, and extended with step actions if defined.
      var actions = defaultStepActions;
      if (step.defaultActions != undefined) {
        actions = $.extend({}, defaultStepActions, step.defaultActions);
      }

      // Set appropriate state for each action, as per final settings.
      for(var action in actions) {
        var state = actions[action];
        passbolt.setup.setActionState(action, state);
      }

      // Define action elements in dom.
      var $nextButton = $('#js_setup_submit_step'),
        $cancelButton = $('#js_setup_cancel_step');

      // Bind click on the go to next step button.
      $nextButton.click(function(ev) {
        ev.preventDefault();
        if(actionsStates['submit'] != 'enabled') {
          return;
        }

        step.submit().then(function() {
          passbolt.setup.goForward(step.next);
        });
      });

      // Bind click on the cancel step button.
      $cancelButton.click(function(ev) {
        ev.preventDefault();
        if(actionsStates['cancel'] != 'enabled') {
          return;
        }

        var previousStepId = null;
        step.cancel().then(function() {
          for(var i in step.parents) {
            if ((previousStepId = pastSteps.indexOf(step.parents[i])) != -1) {
              passbolt.setup.goBackward(pastSteps[previousStepId]);
            }
          }
        });
      });
    });
  }

  /**
   * Init and render menu according to the step provided.
   *
   * @param stepId
   *   step id
   */
  passbolt.setup.initMenu = function(stepId) {
    var menuSteps = passbolt.setup.getMenuSteps();

    // Empty menu container.
    $menuWrapper.empty();

    getTpl('./tpl/setup/menu.ejs', function(tpl) {
      var data = {
        'steps': passbolt.setup.steps,
        'menuSteps': menuSteps,
        'currentStepId': stepId
      };
      $menuWrapper.html(new EJS({text: tpl}).render(data));
    });
  }

  /**
   * Init and render step content according to the step provided in argument.
   * Also set the title.
   *
   * @param stepId
   *   step id
   */
  passbolt.setup.initContent = function(stepId) {
    var step = passbolt.setup.steps[stepId];

    // Empty content container.
    $contentWrapper.empty();

    // Set the page title.
    $title.html(step.title);

    // Initialize the step.
    step.init();

    // Load the template relative to the step and start the step.
    getTpl('./tpl/setup/' + currentStepId + '.ejs', function(tpl) {
      $contentWrapper.html(new EJS({text: tpl}).render(step.viewData));

        // Get elements for all selectors.
        if (step.elts != undefined) {
            for (name in step.elts) {
                step.elts['$' + name] = $(step.elts[name]);
            }
        }

      // Start the step.
      step.start();
    });
  }

  /**
   * Go to the step.
   * @param targetStepId
   */
  passbolt.setup.goToStep = function(targetStepId) {

    // Initialize and render menu.
    passbolt.setup.initMenu(targetStepId);

    // Init step action buttons.
    passbolt.setup.initActionButtons(targetStepId);

    // Init content.
    // Is done at the end because this step will take care of initializing the button states too.
    passbolt.setup.initContent(targetStepId);
  };

  /**
   * Switch to step.
   * @param targetStepId
   */
  passbolt.setup.switchToStep = function(targetStepId) {
    currentStepId = targetStepId;
    passbolt.setup.goToStep(currentStepId);
  };

  /**
   * Go forward.
   * @param targetStepId
   */
  passbolt.setup.goForward = function(targetStepId) {
    // Add the latest current step to the steps history.
    if (currentStepId != null) {
      pastSteps.push(currentStepId);
    }
    currentStepId = targetStepId;
    passbolt.setup.goToStep(currentStepId);
  };

  /**
   * Go backward.
   * @param targetStepId
   */
  passbolt.setup.goBackward = function(targetStepId) {
    // If the user is on the first step.
    if (!pastSteps.length){
      return;
    }
    // remove the latest steps from the step the user has been through.
    pastSteps = pastSteps.slice(0, pastSteps.indexOf(targetStepId));
    currentStepId = targetStepId;
    passbolt.setup.goToStep(currentStepId);
  };

  /**
   * init the setup
   * @param targetStepId
   */
  passbolt.setup.init = function(data) {
    passbolt.setup.data = data;

    // Go to the first step.
    passbolt.setup.goForward('domain_check');
  };


  // The addon initialise the setup.
  passbolt.message('passbolt.setup.init')
    .subscribe(function(domain, userId, token) {
      passbolt.setup.init(domain, userId, token);
    });

})(jQuery);
