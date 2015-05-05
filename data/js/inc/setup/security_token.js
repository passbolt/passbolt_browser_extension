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
    'parents': ['key_info', 'generate_key'],
    'next': 'password',
    'viewData': {}
  };

  step.init = function() {
    step.viewData.securityTokenColor = passbolt.setup.data.securityTokenColor || null;
    step.viewData.securityTokenCode = passbolt.setup.data.securityTokenCode || null;
  };

  step.start = function() {
      /* color picker */
      var fb = $.farbtastic('#js_colorpicker');
      var txtvalue = "";
      var txtpossible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*(){}[]:;!@#$%^&*_-+=|';
      var colorpossible = 'ABCDEF0123456789';

      /* callback on color picking selection */
      fb.linkTo(function(color){
        var txtcolor = fb.hsl[2] > 0.5 ? '#000' : '#fff';
        $('#js_security_token_text')
          .css('color',txtcolor)
          .css('background-color',color);
        $('#js_security_token_background').val(color);
        $('#js_security_token_color').val(txtcolor);

      });

      /* set some random letters */
      var i=0;
      var randcolor = '';
      var randtext = '';
      for( ; i < 3; i++ )
        randtext += txtpossible.charAt(Math.floor(Math.random() * txtpossible.length));
      $('#js_security_token_text').val(randtext);

      /* set some random color */
      for(i=0; i < 6; i++ )
        randcolor += colorpossible.charAt(Math.floor(Math.random() * colorpossible.length));
      fb.setColor('#' + randcolor);

    //// Check that the pre-filled values unlock the submit button.
    if ($('#js_security_token_background').val().length != 7 || $('#js_security_token_text').val().length != 3) {
      passbolt.setup.setActionState('submit', 'disabled');
    }
    // While changing the security token value.
    $('#js_security_token_background, #js_security_token_text').on('input', function() {
      if ($('#js_security_token_background').val().length == 7 && $('#js_security_token_text').val().length == 3) {
        passbolt.setup.setActionState('submit', 'enabled');
      }
      else {
        passbolt.setup.setActionState('submit', 'disabled');
      }
    });
  };

  step.submit = function() {
    passbolt.setup.setActionState('submit', 'processing');
    var def = $.Deferred(),
      securityTokenColor = $('#js_security_token_background').val(),
      securityTokenTextColor = $('#js_security_token_color').val(),
      securityTokenCode = $('#js_security_token_text').val();

    if ($.trim(securityTokenColor).length == 7 && $.trim(securityTokenCode).length == 3) {
      passbolt.setup.data.securityTokenColor = securityTokenColor;
      passbolt.setup.data.securityTokenTextColor = securityTokenTextColor;
      passbolt.setup.data.securityTokenCode = securityTokenCode;
      def.resolve();
    }

    return def;
  };

  step.cancel = function() {
    passbolt.setup.setActionState('cancel', 'processing');
    var def = $.Deferred();
    def.resolve();
    return def;
  };

  passbolt.setup.steps[step.id] = step;

})( passbolt );
