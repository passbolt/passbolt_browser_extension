var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.data = passbolt.setup.data || {};

(function($) {
  // The current step id the user is working on.
  var currentStepId = null,
    // The past steps the user went through.
    pastSteps = [],
    // Default actions available at each step.
    defaultStepActions = ['submit', 'cancel'],
    // Actions states.
    actionsStates = {
      'submit': 'enabled',
      'cancel': 'enabled'
    };

  /**
   * Get the potential next steps of a step.
   * @param stepId
   * @param arr
   * @returns {*|Array}
   */
  passbolt.setup.getNextSteps = function(targetStepId, arr) {
    var arr = arr || []
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
  passbolt.setup.getMenuSteps = function() {
    // Get the current workflow.
    var workflow = passbolt.setup.getWorkflow(currentStepId),
      menuSteps = [],
      state = null;

    for (var i in workflow) {
      var stepId = workflow[i],
        step = passbolt.setup.steps[stepId];

      // If the task is a subStep, so it is not visible, and its parent become current
      if (step.subStep) {
        if (step.id == currentStepId) {
          menuSteps[menuSteps.length - 1].state = 'current';
        }
        continue;
      }

      // If the step is the current step.
      if (step.id == currentStepId) {
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

    // Go in the new state.
    actionsStates[action] = state;
    // Add the new state class.
    $action.addClass('js-state-' + state);
  };

  /**
   * Go to the step.
   * @param targetStepId
   */
  passbolt.setup.goToStep = function(targetStepId) {
    //console.log(passbolt.setup.data);
    var menuSteps = passbolt.setup.getMenuSteps(),
      step = passbolt.setup.steps[currentStepId];

    getTpl('./tpl/setup/menu.ejs', function(tpl) {
      var data = {
        'steps': passbolt.setup.steps,
        'menuSteps': menuSteps,
        'currentStepId': currentStepId
      };
      $('#js_menu').html(new EJS({text: tpl}).render(data));
    });

    // Set the page title.
    $('#js_step_title').html(step.title);

    // Initialize the step.
    step.init();

    // Show hide the default actions.
    var stepActions = defaultStepActions;
    if (typeof step.defaultActions != 'undefined') {
      var stepActions = defaultStepActions.filter(function(n) {
        return step.defaultActions.indexOf(n) > -1;
      });
    }
    for(var i in defaultStepActions) {
      var action = defaultStepActions[i];
      // Show the action.
      if(stepActions.indexOf(action) != -1) {
        passbolt.setup.setActionState(action, 'enabled');
      }
      // Hide the action.
      else {
        passbolt.setup.setActionState(action, 'hidden');
      }
    }

    // Load the template relative to the step and start the step.
    getTpl('./tpl/setup/' + currentStepId + '.ejs', function(tpl) {
      $('#js_step_content').html(new EJS({text: tpl}).render(step.viewData));
      // Start the step.
      step.start();
    });
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
    // remove the latest step from the step the user has been through.
    pastSteps.pop();
    currentStepId = targetStepId;
    passbolt.setup.goToStep(currentStepId);
  };

  /**
   * init the setup
   * @param targetStepId
   */
  passbolt.setup.init = function(data) {
    console.log(data);
    passbolt.setup.data = data;

    // Go to the first step.
    passbolt.setup.goForward('domain_check');
  };

  // Bind the go to next step button.
  $('#js_setup_submit_step').click(function(ev) {
    ev.preventDefault();
    if(actionsStates['submit'] != 'enabled') {
      console.log('cannot go forward if the state is not enabled');
      return;
    }

    var step = passbolt.setup.steps[currentStepId];
    step.submit().then(function() {
      passbolt.setup.goForward(step.next);
    });
  });

  // Bind the cancel step button.
  $('#js_setup_cancel_step').click(function(ev) {
    ev.preventDefault();
    if(actionsStates['cancel'] != 'enabled') {
      console.log('cannot go backward if the state is not enabled');
      return;
    }

    var step = passbolt.setup.steps[currentStepId];
    step.cancel().then(function() {
      passbolt.setup.goBackward(pastSteps[pastSteps.length - 1]);
    });

  });

  // The addon initialise the setup.
  passbolt.message('passbolt.setup.init')
    .subscribe(function(domain, userId, token) {
      passbolt.setup.init(domain, userId, token);
    });

})(jQuery);
