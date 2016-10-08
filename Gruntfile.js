module.exports = function(grunt) {

    // ========================================================================
    // High level variables

    var config = {
        webroot : 'data',
        styleguide : 'passbolt-styleguide',
        modules_path : 'node_modules'
    };

    // ========================================================================
    // Configure task options

    grunt.initConfig({
        config : config,
        pkg: grunt.file.readJSON('package.json'),
        bower: grunt.file.readJSON('./.bowerrc'),
        clean: {
            css: [
                '<%= config.webroot %>/css/*.css'
            ],
            img: [
                '<%= config.webroot %>/img'
            ]
        },
        shell: {
            updatestyleguide: {
                options: {
                    stderr: false
                },
                command: 'rm -rf <%= config.modules_path %>/<%= config.styleguide %>; npm install'
            },
            jpmxpi: {
                options: {
                    stderr: false
                },
                command: [
                    'rm -f passbolt*.xpi',
                    "sed -i '' -e 's/[\"]debug[\"]:.*$/\"debug\": true/' ./lib/config/config.json",
                    './node_modules/jpm/bin/jpm xpi',
                    "mv passbolt@passbolt.com-<%= pkg.version %>.xpi passbolt@passbolt.com-<%= pkg.version %>-debug.xpi",
                    "sed -i '' -e 's/[\"]debug[\"]:.*$/\"debug\": false/' ./lib/config/config.json",
                    './node_modules/jpm/bin/jpm xpi',
                    'ln -s passbolt@passbolt.com-<%= pkg.version %>-debug.xpi ./passbolt-latest@passbolt.com.xpi'
                ].join('&&')
            },
            xpiinstall: {
                options: {
                    stderr: false
                },
                command: [
                    'wget --post-file=passbolt@passbolt.com-<%= pkg.version %>-debug.xpi http://localhost:8888/ > /dev/null 2>&1',
                    'echo "If your browser has the firefox addon \"Extension auto-installer\" installed & enabled, the passbolt plugin is now installed on your browser"'
                ].join(';')
            }
        },
        copy: {
            styleguide : {
                files: [{
                    // Avatar
                    nonull: true,
                    cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/avatar',
                    src: ['user.png'],
                    dest: '<%= config.webroot %>/img/avatar',
                    expand: true
                },{
                    // Controls
                    nonull: true,
                    cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/controls',
                    src: ['colorpicker/**', 'calendar.png', 'infinite-bar.gif', 'loading.gif', 'menu.png'],
                    dest: '<%= config.webroot %>/img/controls',
                    expand: true
                },{
                    // Logo
                    nonull: true,
                    cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/logo',
                    src: ['icon-16.png', 'icon-20.png','icon-20_white.png', 'icon-32.png','icon-64.png', 'logo.png', 'logo@2x.png'],
                    dest: '<%= config.webroot %>/img/logo',
                    expand: true
                },{
                    // Third party
                    nonull: true,
                    cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/third_party',
                    src: ['ChromeWebStore.png', 'ChromeWebStore_disabled.png', 'firefox_logo.png', 'firefox_logo_disabled.png', 'gnupg_logo.png', 'gnupg_logo_disabled.png'],
                    dest: '<%= config.webroot %>/img/third_party',
                    expand: true
                },{
                    // Less
                    cwd: '<%= config.modules_path %>/<%= config.styleguide %>/build/css',
                    src: ['config_debug_ff.min.css', 'external.min.css', 'login.min.css', 'main_ff.min.css','setup_ff.min.css'],
                    dest: '<%= config.webroot %>/css',
                    expand: true
                }]
            },
            openpgp_ff : {
                files: [
                    {
                    // steal
                    cwd: '<%= config.modules_path %>/openpgp/dist/',
                    src: ['openpgp_ff.js', 'openpgp.worker.js'],
                    dest: 'lib/vendors/',
                    nonull: true,
                    expand: true,
                    rename: function(dest, src) {
                        console.log(dest, src);
                        if (src == 'openpgp_ff.js') {
                            return dest + 'openpgp.js';
                        }
                        return dest + src;
                    }
                }]
            }
        },
        replace: {
            openpgp_ff: {
                src: ['<%= config.modules_path %>/openpgp/dist/openpgp.js'],
                dest: ['<%= config.modules_path %>/openpgp/dist/openpgp_ff.js'],
                replacements: [
                    {
                        // Add necessary dependencies at the beginning of the file.
                        from: "(function(f)",
                        to: "if (Worker == undefined) {\nvar Worker = require('./web-worker').Worker;\n}\nif (window == undefined) {\nvar window = require('./window');\nvar atob = window.atob;\n}\n\n(function(f)"
                    },
                    {
                        // Comment promise polyfill. We don't need it. And it breaks.
                        from: "lib$es6$promise$polyfill$$default();",
                        to: "//lib$es6$promise$polyfill$$default();"
                    },
                    {
                        // Comment promise polyfill. We don't need it. And it breaks.
                        from: "_es6Promise2.default.polyfill();",
                        to: "//_es6Promise2.default.polyfill();"
                    }
                ]
            }
        }
    });

    // on watch events configure jshint:all to only run on changed file
    //    grunt.event.on('watch', function(action, filepath) {
    //        grunt.config(['jshint', 'all'], filepath);
    //    });

    // ========================================================================
    // Initialize
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-shell');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-text-replace');

    // ========================================================================
    // Register Tasks

    // Bower deploy
    grunt.registerTask('styleguide-update', ['shell:updatestyleguide', 'clean:css', 'clean:img', 'copy:styleguide','shell:jpmxpi']);

    // Copy, patch (to make it work with firefox) and deploy openPGP in libraries.
    grunt.registerTask('lib-openpgp-deploy', ['replace:openpgp_ff', 'copy:openpgp_ff']);

    // Build xpi in debug and non-debug version.
    grunt.registerTask('build-xpi', ['shell:jpmxpi']);

    // Build xpi in debug and non-debug version.
    grunt.registerTask('push-xpi', ['shell:xpiinstall']);

    // 'grunt' will check code quality, and if no errors,
    // compile LESS to CSS, and minify and concatonate all JS and CSS
    grunt.registerTask('default', ['shell:jpmxpi']);

};
