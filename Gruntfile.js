module.exports = function (grunt) {

  // ========================================================================
  // High level variables

  var config = {
    styleguide: 'passbolt-styleguide',
    modules_path: 'node_modules',
    common_path: 'src/all',
    webroot: 'src/all/data',
    build: {
      firefox: {
        path: 'dist/firefox'
      },
      chrome: {
        path: 'dist/chrome'
      }
    }
  };

  // ========================================================================
  // Configure task options

  grunt.initConfig({
    config: config,
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      css: [
        '<%= config.webroot %>/css/*.css'
      ],
      img: [
        '<%= config.webroot %>/img'
      ],
      'firefox_build': [
        '<%= config.build.firefox.path %>/**'
      ],
      'chrome_build': [
        '<%= config.build.chrome.path %>/**'
      ]
    },
    shell: {
      update_styleguide: {
        options: {
          stderr: false
        },
        command: 'rm -rf <%= config.modules_path %>/<%= config.styleguide %>; npm install'
      },
      build_xpi: {
        options: {
          stderr: false
        },
        command: [
          "cp <%= config.build.firefox.path %>/lib/config/config.json <%= config.build.firefox.path %>/lib/config/config.json.original",
          "sed -i '' -e 's/[\"]debug[\"]:.*$/\"debug\": true/' <%= config.build.firefox.path %>/lib/config/config.json",
          './node_modules/jpm/bin/jpm xpi --addon-dir <%= config.build.firefox.path %>',
          "mv <%= config.build.firefox.path %>/passbolt.xpi <%= config.build.firefox.path %>/passbolt-<%= pkg.version %>-debug.xpi",
          "sed -i '' -e 's/[\"]debug[\"]:.*$/\"debug\": false/' <%= config.build.firefox.path %>/lib/config/config.json",
          './node_modules/jpm/bin/jpm xpi --addon-dir <%= config.build.firefox.path %>',
          "mv <%= config.build.firefox.path %>/passbolt.xpi <%= config.build.firefox.path %>/passbolt-<%= pkg.version %>.xpi",
          'ln -s passbolt-<%= pkg.version %>-debug.xpi <%= config.build.firefox.path %>/passbolt-latest@passbolt.com.xpi',
          "rm <%= config.build.firefox.path %>/lib/config/config.json",
          "cp <%= config.build.firefox.path %>/lib/config/config.json.original <%= config.build.firefox.path %>/lib/config/config.json",
          "rm <%= config.build.firefox.path %>/lib/config/config.json.original",
        ].join('&&')
      },
      install_xpi: {
        options: {
          stderr: false
        },
        command: [
          'wget --post-file=<%= config.build.firefox.path %>/passbolt-<%= pkg.version %>-debug.xpi http://localhost:8888/ > /dev/null 2>&1',
          'echo "If your browser has the firefox addon \"Extension auto-installer\" installed & enabled, the passbolt plugin is now installed on your browser"'
        ].join(';')
      },
      build_crx: {
        options: {
          stderr: true
        },
        command: [
          "cp <%= config.build.chrome.path %>/lib/config/config.json <%= config.build.chrome.path %>/lib/config/config.json.original",
          "sed -i '' -e 's/[\"]debug[\"]:.*$/\"debug\": false/' <%= config.build.chrome.path %>/lib/config/config.json",
          'zip -q -1 -r dist/passbolt-<%= pkg.version %>.zip <%= config.build.chrome.path %>',
          "echo '<%= config.build.chrome.path %>/passbolt-<%= pkg.version %>.zip has been generated'",
          "sed -i '' -e 's/[\"]debug[\"]:.*$/\"debug\": true/' <%= config.build.chrome.path %>/lib/config/config.json",
          './node_modules/crx/bin/crx.js pack <%= config.build.chrome.path %> -p key.pem -o <%= config.build.chrome.path %>/passbolt-<%= pkg.version %>-debug.crx',
          "sed -i '' -e 's/[\"]debug[\"]:.*$/\"debug\": false/' <%= config.build.chrome.path %>/lib/config/config.json",
          './node_modules/crx/bin/crx.js pack <%= config.build.chrome.path %> -p key.pem -o <%= config.build.chrome.path %>/passbolt-<%= pkg.version %>.crx',
          'ln -s passbolt-<%= pkg.version %>-debug.crx <%= config.build.chrome.path %>/passbolt-latest@passbolt.com.crx',
          'mv dist/passbolt-<%= pkg.version %>.zip <%= config.build.chrome.path %>/.',
          "rm <%= config.build.chrome.path %>/lib/config/config.json",
          "cp <%= config.build.chrome.path %>/lib/config/config.json.original <%= config.build.chrome.path %>/lib/config/config.json",
          "rm <%= config.build.chrome.path %>/lib/config/config.json.original"
        ].join('&&')
      }
    },
    copy: {
      firefox_src: {
        files: [{
          // Package definition
          nonull: true,
          cwd: './',
          src: ['package.json'],
          dest: '<%= config.build.firefox.path %>',
          expand: true
        }, {
          // Common
          nonull: true,
          cwd: '<%= config.common_path %>',
          src: ['data/**', 'lib/**', 'locale/**'],
          dest: '<%= config.build.firefox.path %>',
          expand: true
        }, {
          // Firefox specific
          nonull: true,
          cwd: 'src/firefox',
          src: ['**'],
          dest: '<%= config.build.firefox.path %>',
          expand: true
        }]
      },
      chrome_src: {
        files: [{
          // Package definition
          nonull: true,
          cwd: './',
          src: ['package.json'],
          dest: '<%= config.build.chrome.path %>',
          expand: true
        }, {
          // Common
          nonull: true,
          cwd: '<%= config.common_path %>',
          src: ['data/**', 'lib/**', 'locale/**'],
          dest: '<%= config.build.chrome.path %>',
          expand: true
        }, {
          // Chrome specific
          nonull: true,
          cwd: 'src/chrome',
          src: ['**'],
          dest: '<%= config.build.chrome.path %>',
          expand: true
        }]
      },
      common_lib: {
        files: []
      },
      firefox_lib: {
        files: [{
          // openpgp
          cwd: '<%= config.modules_path %>/openpgp/dist/',
          src: ['openpgp.js', 'openpgp.worker.js'],
          dest: 'src/firefox/lib/vendors/',
          nonull: true,
          expand: true,
          rename: function (dest, src) {
            return dest + src;
          }
        }]
      },
      chrome_lib: {
        files: [{
          // steal lib.
          nonull: true,
          cwd: '<%= config.modules_path %>/steal',
          src: ['steal.js', 'ext/dev.js'],
          dest: 'src/chrome/lib/vendors/steal',
          expand: true
        }, {
          // openpgp
          cwd: '<%= config.modules_path %>/openpgp/dist/',
          src: ['openpgp.js', 'openpgp.worker.js'],
          dest: 'src/chrome/lib/vendors/',
          nonull: true,
          expand: true,
          rename: function (dest, src) {
            return dest + src;
          }
        }]
      },
      styleguide: {
        files: [{
          // Avatar
          nonull: true,
          cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/avatar',
          src: ['user.png'],
          dest: '<%= config.webroot %>/img/avatar',
          expand: true
        }, {
          // Controls
          nonull: true,
          cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/controls',
          src: ['colorpicker/**', 'calendar.png', 'infinite-bar.gif', 'loading.gif', 'menu.png'],
          dest: '<%= config.webroot %>/img/controls',
          expand: true
        }, {
          // Logo
          nonull: true,
          cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/logo',
          src: ['icon-16.png', 'icon-20.png', 'icon-20_white.png', 'icon-32.png', 'icon-64.png', 'logo.png', 'logo@2x.png'],
          dest: '<%= config.webroot %>/img/logo',
          expand: true
        }, {
          // Third party
          nonull: true,
          cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/third_party',
          src: ['ChromeWebStore.png', 'ChromeWebStore_disabled.png', 'firefox_logo.png', 'firefox_logo_disabled.png', 'gnupg_logo.png', 'gnupg_logo_disabled.png'],
          dest: '<%= config.webroot %>/img/third_party',
          expand: true
        }, {
          // Less
          cwd: '<%= config.modules_path %>/<%= config.styleguide %>/build/css',
          src: ['config_debug_ff.min.css', 'external.min.css', 'login.min.css', 'main_ff.min.css', 'setup_ff.min.css'],
          dest: '<%= config.webroot %>/css',
          expand: true
        }]
      }
    },
    replace: {
      patch_firefox_openpgp: {
        src: ['src/firefox/lib/vendors/openpgp.js'],
        dest: ['src/firefox/lib/vendors/openpgp.js'],
        replacements: [{
          // Add necessary dependencies at the beginning of the file.
          from: "(function(f)",
          to: "if (Worker == undefined) {\nvar Worker = require('./web-worker').Worker;\n}\nif (window == undefined) {\nvar window = require('./window');\nvar atob = window.atob;\n}\n\n(function(f)"
        }, {
          // Comment promise polyfill. We don't need it. And it breaks.
          from: "lib$es6$promise$polyfill$$default();",
          to: "//lib$es6$promise$polyfill$$default();"
        }, {
          // Comment promise polyfill. We don't need it. And it breaks.
          from: "_es6Promise2.default.polyfill();",
          to: "//_es6Promise2.default.polyfill();"
        }]
      }
    }
  });

  // ========================================================================
  // Initialize
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.loadNpmTasks('grunt-shell');

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.loadNpmTasks('grunt-text-replace');

  // ========================================================================
  // Register dependencies deployment tasks.

  // Deploy all libs.
  grunt.registerTask('deploy-lib', ['deploy-common-lib', 'deploy-chrome-lib', 'deploy-firefox-lib']);

  // Deploy common libs.
  grunt.registerTask('deploy-common-lib', ['copy:common_lib']);

  // Deploy chrome libs.
  grunt.registerTask('deploy-chrome-lib', ['copy:chrome_lib']);

  // Deploy firefox lib.
  grunt.registerTask('deploy-firefox-lib', ['copy:firefox_lib', 'replace:patch_firefox_openpgp']);

  // Update styleguide
  grunt.registerTask('update-styleguide', ['shell:update_styleguide', 'clean:css', 'clean:img', 'copy:styleguide']);

  // ========================================================================
  // Register build tasks.

  // Build xpi in debug and non-debug version.
  grunt.registerTask('install-xpi', ['shell:install_xpi']);

  // Build for all browsers
  grunt.registerTask('build', ['build-firefox', 'build-chrome']);

  // Build firefox.
  grunt.registerTask('build-firefox-src', ['clean:firefox_build', 'copy:firefox_src']);
  grunt.registerTask('build-firefox', ['clean:firefox_build', 'copy:firefox_src', 'shell:build_xpi']);

  // Build chrome.
  grunt.registerTask('build-chrome', ['clean:chrome_build', 'copy:chrome_src', 'shell:build_crx']);
  // Build chrome directory but not the crx usefull for devel
  grunt.registerTask('build-chrome-nocrx', ['clean:chrome_build', 'copy:chrome_src']);

  // By default build plugin for all browsers.
  grunt.registerTask('default', ['build']);

};
