var passbolt = passbolt || {};

$(function() {

    // shortcut for selectors
    var $saveMyKey = $('#saveKey'),
        $saveServerKey = $('#saveServerKey'),
        $saveSettings = $('#js_save_conf'),
        $myKeyAscii = $('#myKeyAscii'),
        $serverKeyAscii = $('#serverKeyAscii'),
        $keyFilepicker = $('#keyFilepicker'),
        $domain = $('#baseUrl');

    /* ==================================================================================
     *  View Helpers
     * ================================================================================== */

    /**
     * Display the key information
     * @param keyInfo
     * @param keyId
     * @param keyType
     */
    var displayKeyInfo = function(keyInfo, keyId, keyType) {
        var container = $('#' + keyId);
        var info = {
            'uid' : (keyType == 'server' ? keyInfo.uid.replace('<', '&lt;').replace('>', '&gt;') : keyInfo.userIds[0].name + ' &lt;' + keyInfo.userIds[0].email + '&gt;'),
            'fingerprint' : keyInfo.fingerprint,
            'algorithm' : keyType == 'server' ? keyInfo.type : keyInfo.algorithm,
            'created' : keyType == 'server' ? keyInfo.key_created : keyInfo.created,
            'expires' : keyInfo.expires
        };
        if(keyInfo) {
            if (keyType == 'client') {
                var uids = '';
                for (var i in keyInfo.userIds) {
                    var uid = keyInfo.userIds[i].name + ' &lt;' + keyInfo.userIds[i].email + '&gt;';
                    uids += uid;
                }
                info.uid = uids;
            }
            $('.uid', container).html(info.uid);
            $('.fingerprint', container).html(info.fingerprint);
            $('.algorithm', container).html(info.algorithm);
            $('.created', container).html(info.created);
            $('.expires', container).html(info.expires);
        }
        else {
            $('.feedback', container).html(feedbackHtml('There is no private key available please upload one.', 'error'));
        }
    };

    /**
     * Helper to build feedback message
     * @param message
     * @param messageType
     * @returns {string}
     */
    var feedbackHtml = function(message, messageType) {
        return '<div class="message ' + messageType + '">' + message + '</div>';
    };

    /* ==================================================================================
     *  View init
     * ================================================================================== */

    /**
     * Get the information about the current user from teh server if any
     * @TODO Fix this & add back html display
     */
    var updatePublic = function() {
        passbolt.request('passbolt.user.get.remote')
            .then(function(user) {
                console.log('passbolt.user.get.remote success');
                displayKeyInfo(user.Gpgkey, 'pubkeyinfo-plugin', 'server');

                passbolt.request('passbolt.keyring.public.find', user.id)
                    .then(function(publicKeyArmored) {
                        if (publicKeyArmored) {
                            passbolt.request('passbolt.keyring.public.info', publicKeyArmored.key)
                                .then(function (info) {
                                    //displayKeyInfo(info, 'pubkeyinfo-plugin', 'client');
                                    console.log('passbolt.keyring.public.info :');
                                    console.log(info);
                                });
                        }
                    }).fail(function(){
                        console.log('passbolt.keyring.public.info fail');
                    });
            }).fail(function(){
                console.log('passbolt.user.get.remote fail: no current user');
            });
    };

    /**
     * Display key information
     * Triggered when the page is opened or when a new key is set
     */
    var updatePrivate = function() {
        passbolt.request('passbolt.keyring.private.find')
            .then(function(info) {
                displayKeyInfo(info, 'privkeyinfo', 'client');
            })
            .fail(function(){
                console.log('passbolt.keyring.private.find fail: no private key set');
            });
    };

    /**
     * Get the user settings
     */
    var updateSettings = function () {
        passbolt.request('passbolt.users.settings.getDomain')
            .then(function(domain) {
                if(domain) {
                    $domain.val(domain);
                }
            })
            .fail(function(param){
                console.log('passbolt.config.read fail: no baseurl in config');
            });
    };

    /**
     * At startup read configuration and load baseurl
     */
    var init = function () {
        // @TODO use get domain instead


        updatePrivate();

    };
    init();


    /* ==================================================================================
     *  View Events Listeners
     * ================================================================================== */

    /**
     * Event: When user press plugin configuration save button
     * Save the baseurl, user info, etc.
     */
    $saveSettings.click(function() {

        // Get the data from the input fields
        var securityToken = {
            code : $('#securityTokenCode').val(),
            color : $('#securityTokenColor').val(),
            textcolor : $('#securityTokenTextColor').val()
        };
        var user = {};
        user.firstname = $('#ProfileFirstName').val();
        user.lastname = $('#ProfileLastName').val();
        user.username = $('#UserUsername').val();
        user.userid = $('#UserId').val();
        var domain = $domain.val();

        // try to save the username
        passbolt.request('passbolt.user.set', user).then(
            function success() {
                console.log('User have been saved!');
            },
            function error(msg) {
                console.log('Error: ' + msg);
            }
        );

        // try to save the username
        passbolt.request('passbolt.user.settings.setDomain', domain).then(
            function success() {
                console.log('Domain have been saved!');
            },
            function error(msg) {
                console.log('Error: ' + msg);
            }
        );

        // Try to save the security token
        passbolt.request('passbolt.user.settings.setSecurityToken', securityToken).then(
            function success() {
                console.log('security token saved!');
            },
            function error(msg) {
                console.log('Error: ' + msg);
            }
        );

    });

    /**
     * Event: When user press browse button
     * The user requests a private key import from file.
     */
    $keyFilepicker.click(function(){
        passbolt.request('passbolt.file.prompt')
            .then(function(data) {
                $myKeyAscii.val(data);
            });
    });

    /**
     * Event: When the user press the save my key settings button
     * Save the private key and deduce public key from it
     */
    $saveMyKey.click(function() {
        var key = $myKeyAscii.val();

        passbolt.request('passbolt.keyring.private.import', key)
            .then(function() {
                // Display info.
                passbolt.request('passbolt.keyring.private.find').then(function(info) {
                    displayKeyInfo(info, 'privkeyinfo', 'client');
                });

                $('.my.key-import.feedback').html(feedbackHtml('The key has been imported succesfully.', 'success'));
            })
            .fail(function(params) {
                $('.my.key-import.feedback').html(feedbackHtml('something went wrong during the import: ' + params, 'error'));
            });
    });

    /**
     * Event: When the user press the save private key settings button
     * Save the public server key and update the info on the page
     */
    $saveServerKey.click(function() {
        var serverKey = $serverKeyAscii.val();
        passbolt.request('passbolt.keyring.server.import', serverKey)
            .then(function() {
                passbolt.request('passbolt.keyring.public.info', serverKey)
                    .then(function(info) {
                        displayKeyInfo(info, 'pubkeyinfo-server', 'client');
                        $('.server.key-import.feedback').html(feedbackHtml('The key has been imported succesfully.', 'success'));
                    })
                    .fail(function(){
                        $('.server.key-import.feedback').html(feedbackHtml('something went south when trying to display the key info','error'));
                    });
            })
            .fail(function(params) {
                $('.server.key-import.feedback').html(feedbackHtml('something went wrong during the import: ' + params, 'error'));
            });
    });
});
