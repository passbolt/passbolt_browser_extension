/**
 * Gruntfile
 * Provides tasks and commands to build and distribute the project
 *
 * @param grunt
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
module.exports = function (grunt) {

  /**
   * Path shortcuts
   */
  var path = {
    node_modules: 'node_modules/',

    build: 'build/all/',
    build_web_accessible_resources: 'build/all/webAccessibleResources/',

    dist_chrome: 'dist/chrome/',
    dist_chrome_mv3: 'dist/chrome-mv3/',
    dist_firefox: 'dist/firefox/',

    src: 'src/all/',
    test: 'test/',
    src_background_page: 'src/all/background_page/',
    src_chrome: 'src/chrome/',
    src_chrome_mv3: 'src/chrome-mv3/',
    src_firefox: 'src/firefox/',
    src_content_scripts: 'src/all/contentScripts/',
    src_web_accessible_resources: 'src/all/webAccessibleResources/',
  };
  const firefoxWebExtBuildName = 'passbolt_-_open_source_password_manager';

  /**
   * Import package.json file content
   */
  var pkg = grunt.file.readJSON('package.json');
  var manifestVersion =  pkg.version.replace(/-.*$/,'');

  /**
   * Load and enable Tasks
   */
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['bundle']);
  grunt.registerTask('pre-dist', ['copy:styleguide']);

  grunt.registerTask('bundle', ['externalize-locale-strings', 'copy:background_page', 'copy:web_accessible_resources', 'copy:locales']);
  grunt.registerTask('bundle-firefox', ['copy:manifest_firefox', 'bundle']);
  grunt.registerTask('bundle-chrome', ['copy:manifest_chrome', 'bundle']);
  grunt.registerTask('bundle-mv3', ['externalize-locale-strings', 'copy:service_worker', 'copy:web_accessible_resources', 'copy:locales']);
  grunt.registerTask('bundle-chrome-mv3', ['copy:manifest_chrome_mv3', 'bundle-mv3']);

  grunt.registerTask('build', ['build-firefox-prod', 'build-chrome-prod']);

  grunt.registerTask('build-firefox', ['build-firefox-debug', 'build-firefox-prod']);
  grunt.registerTask('build-firefox-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-firefox', 'shell:build_background_page_debug', 'shell:build_content_script_debug', 'shell:build_web_accessible_resources_debug', 'shell:build_firefox_debug']);
  grunt.registerTask('build-firefox-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-firefox', 'shell:build_background_page_prod', 'shell:build_content_script_prod', 'shell:build_web_accessible_resources_prod', 'shell:build_firefox_prod']);

  grunt.registerTask('build-chrome', ['build-chrome-debug', 'build-chrome-prod']);
  grunt.registerTask('build-chrome-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-chrome', 'shell:build_background_page_debug', 'shell:build_content_script_debug', 'shell:build_web_accessible_resources_debug', 'shell:build_chrome_debug']);
  grunt.registerTask('build-chrome-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-chrome', 'shell:build_background_page_prod', 'shell:build_content_script_prod', 'shell:build_web_accessible_resources_prod', 'shell:build_chrome_prod']);

  grunt.registerTask('build-chrome-mv3', ['build-chrome-mv3-debug', 'build-chrome-mv3-prod']);
  grunt.registerTask('build-chrome-mv3-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-chrome-mv3', 'shell:build_service_worker_debug', 'shell:build_content_script_debug', 'shell:build_web_accessible_resources_debug', 'shell:build_chrome_mv3_debug']);
  grunt.registerTask('build-chrome-mv3-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-chrome-mv3', 'shell:build_service_worker_prod', 'shell:build_content_script_prod', 'shell:build_web_accessible_resources_prod', 'shell:build_chrome_mv3_prod']);

  grunt.registerTask('externalize-locale-strings', ['shell:externalize']);

  /**
   * Main grunt tasks configuration
    */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Clean operations
     */
    clean: {
      build: [
        path.build + '**'
      ]
    },

    /**
     * Copy operations
     */
    copy: {
      // switch config files to debug or production
      config_debug: {
        files: [{
          expand: true, cwd: path.src_background_page + 'config', src: 'config.json.debug', dest: path.src_background_page + 'config',
          rename: function (dest, src) { return dest + '/config.json'; }
        }]
      },
      config_default: {
        files: [{
          expand: true, cwd: path.src_background_page + 'config',
          src: 'config.json.default',
          dest: path.src_background_page + 'config',
          rename: function (dest, src) { console.log(dest + '/config.json'); return dest + '/config.json'; }
        }]
      },
      background_page: {
        files: [
          { expand: true, cwd: path.src_background_page, src: 'index.html', dest: path.build }
        ]
      },
      service_worker: {
        files: [
          { expand: true, cwd: path.src_chrome_mv3, src: 'serviceWorker.js', dest: path.build + 'serviceWorker' }
        ]
      },
      web_accessible_resources: {
        files: [
          { expand: true, cwd: path.src_web_accessible_resources, src: ['js/themes/**', '*.html'], dest: path.build_web_accessible_resources }
        ]
      },
      locales: {
        files: [
          { expand: true, cwd: path.src + 'locales', src: ['**'], dest: path.build + 'locales' },
          { expand: true, cwd: path.src + '_locales', src: ['**', "!**/*.test.js"], dest: path.build + '_locales' }
        ]
      },
      // switch manifest file to firefox or chrome
      manifest_firefox: {
        files: [{
          expand: true, cwd: path.src_firefox, src: 'manifest.json', dest: path.build
        }]
      },
      manifest_chrome: {
        files: [{
          expand: true, cwd: path.src_chrome, src: 'manifest.json', dest: path.build
        }]
      },
      manifest_chrome_mv3: {
        files: [{
          expand: true, cwd: path.src_chrome_mv3, src: 'manifest.json', dest: path.build
        }]
      },
      // Copy styleguide elements
      styleguide: {
        files: [{
          // Avatar
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/avatar',
          src: ['user.png', 'group_default.png'],
          dest: path.build_web_accessible_resources + 'img/avatar',
          expand: true
        }, {
          // Controls
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/controls',
          src: [
            'check_black.svg', 'check_white.svg', 'dot_black.svg', 'dot_white.svg', 'dot_red.svg',
            'infinite-bar.gif', 'loading_dark.svg', 'loading_light.svg', 'chevron-right_black.svg',
            'chevron-right_white.svg', 'chevron-down_black.svg', 'chevron-down_white.svg', 'chevron-down_blue.svg',
            'success.svg', 'fail.svg', 'warning.svg'
          ],
          dest: path.build_web_accessible_resources + 'img/controls',
          expand: true
        }, {
          // Icons / logo
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/logo',
          src: [
            'icon-19.png', 'icon-20_white.png', 'icon-48.png', 'icon-48_white.png', 'logo.png', 'logo@2x.png',
            'logo.svg', 'logo_white.png', 'logo_white@2x.png', 'logo_white.svg',
            'icon-without-badge.svg',
            'icon-inactive.svg',
            'icon-badge-1.svg',
            'icon-badge-2.svg',
            'icon-badge-3.svg',
            'icon-badge-4.svg',
            'icon-badge-5.svg',
            'icon-badge-5+.svg',
          ],
          dest: path.build_web_accessible_resources + 'img/logo',
          expand: true
        }, {
          // Branding
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/logo',
          src: [
            'icon-16.png',
            'icon-19.png',
            'icon-32.png',
            'icon-32-signout.png',
            'icon-32-badge-1.png',
            'icon-32-badge-2.png',
            'icon-32-badge-3.png',
            'icon-32-badge-4.png',
            'icon-32-badge-5.png',
            'icon-32-badge-5+.png',
            'icon-48.png',
            'icon-64.png',
            'icon-128.png'],
          dest: path.build_web_accessible_resources + 'img/icons',
          expand: true
        }, {
          // Illustrations
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/illustrations',
          src: ['passphrase_intro.svg', 'pin_passbolt.gif', 'wave-pin_my_extension.svg', 'email.png'],
          dest: path.build_web_accessible_resources + 'img/illustrations',
          expand: true
        }, {
          // Third party logos
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/third_party',
          src: ['ChromeWebStore.png', 'gnupg_logo.png', 'gnupg_logo_disabled.png', 'appstore.svg', 'playstore.svg'],
          dest: path.build_web_accessible_resources + 'img/third_party',
          expand: true
        }, {
          // theme preview images
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/themes',
          src: ['default.png', 'midgar.png', 'solarized_dark.png', 'solarized_light.png'],
          dest: path.build_web_accessible_resources + 'img/themes',
          expand: true
        }, {
          // CSS files default
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/default',
          src: [
            'ext_external.min.css', 'ext_login.min.css', 'ext_legacy.min.css', 'ext_in_form_cta.min.css',
            'ext_setup.min.css', 'ext_quickaccess.min.css', 'ext_app.min.css', 'ext_authentication.min.css',
            'ext_in_form_menu.min.css'
          ],
          dest: path.build_web_accessible_resources + 'css/themes/default',
          expand: true
        }, {
          // CSS files midgar
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/midgar',
          src: [
            'ext_login.min.css', 'ext_in_form_cta.min.css', 'ext_setup.min.css', 'ext_quickaccess.min.css',
            'ext_app.min.css', 'ext_authentication.min.css', 'ext_in_form_menu.min.css'
          ],
          dest: path.build_web_accessible_resources + 'css/themes/midgar',
          expand: true
        }, {
          // CSS files solarized light
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/solarized_light',
          src: [
            'ext_login.min.css', 'ext_in_form_cta.min.css', 'ext_setup.min.css', 'ext_quickaccess.min.css',
            'ext_app.min.css', 'ext_authentication.min.css', 'ext_in_form_menu.min.css'
          ],
          dest: path.build_web_accessible_resources + 'css/themes/solarized_light',
          expand: true
        }, {
          // CSS files solarized dark
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/solarized_dark',
          src: [
            'ext_login.min.css', 'ext_in_form_cta.min.css', 'ext_setup.min.css', 'ext_quickaccess.min.css',
            'ext_app.min.css', 'ext_authentication.min.css', 'ext_in_form_menu.min.css'
          ],
          dest: path.build_web_accessible_resources + 'css/themes/solarized_dark',
          expand: true
        }, {
          // Fonts
          cwd: path.node_modules + 'passbolt-styleguide/src/fonts',
          src: ['opensans-bold.woff', 'opensans-regular.woff', 'passbolt.ttf'],
          dest: path.build_web_accessible_resources + 'fonts',
          expand: true
        }, {
          // Locales
          cwd: path.node_modules + 'passbolt-styleguide/src/locales',
          src: ['**'],
          dest: path.build_web_accessible_resources + 'locales',
          expand: true
        }]
      }
    },

    /**
     * Shell commands
     */
    shell: {
      options: { stderr: false },
      /**
       * Build background page.
       */
      build_background_page_prod: {
        command: [
          'npm run build:background-page'
        ].join(' && ')
      },
      build_background_page_debug: {
        command: [
          'npm run dev:build:background-page'
        ].join(' && ')
      },
      /**
       * Build service worker.
       */
      build_service_worker_prod: {
        command: [
          'npm run build:service-worker'
        ].join(' && ')
      },
      build_service_worker_debug: {
        command: [
          'npm run dev:build:service-worker'
        ].join(' && ')
      },
      /**
       * Build content script
       */
      build_content_script_prod: {
        command: [
          'npm run build:content-scripts'
        ].join(' && ')
      },
      build_content_script_debug: {
        command: [
          'npm run dev:build:content-scripts'
        ].join(' && ')
      },
      build_content_script_app: {
        command: [
          'npm run dev:build:content-scripts:app'
        ].join(' && ')
      },
      build_content_script_browser_integration: {
        command: [
          'npm run dev:build:content-scripts:browser-integration'
        ].join(' && ')
      },
      build_content_script_public_website: {
        command: [
          'npm run dev:build:content-scripts:public-website'
        ].join(' && ')
      },
      /**
       * Build web accessible resources
       */
      build_web_accessible_resources_prod: {
        command: [
          'npm run build:web-accessible-resources'
        ].join(' && ')
      },
      build_web_accessible_resources_debug: {
        command: [
          'npm run dev:build:web-accessible-resources'
        ].join(' && ')
      },
      build_web_accessible_resources_app: {
        command: [
          'npm run dev:build:web-accessible-resources:app'
        ].join(' && ')
      },
      build_web_accessible_resources_browser_integration: {
        command: [
          'npm run dev:build:web-accessible-resources:browser-integration'
        ].join(' && ')
      },
      // Execute the externalization command
      externalize: {
        command: [
          'npm run i18n:externalize'
        ].join(' && ')
      },
      // Execute the eslint command
      eslint: {
        command: [
          'npm run eslint'
        ].join(' && ')
      },

      /**
       * Unit tests.
       */
      test: {
        stdout: true,
        command: "npm run test"
      },

      /**
       * Firefox
       */
      build_firefox_debug: {
        options: {
          stderr: false
        },
        command: [
          './node_modules/.bin/web-ext build -s=' + path.build + ' -a=' + path.dist_firefox + '  -o=true',
          'mv ' + path.dist_firefox + firefoxWebExtBuildName + '-' + manifestVersion + '.zip ' + path.dist_firefox + 'passbolt-' + pkg.version + '-debug.zip',
          'rm -f ' + path.dist_firefox + 'passbolt-latest@passbolt.com.zip',
          'ln -fs passbolt-' + pkg.version + '-debug.zip ' + path.dist_firefox + 'passbolt-latest@passbolt.com.zip',
          "echo '\nMoved to " + path.dist_firefox + "passbolt-" + pkg.version + "-debug.zip'"
        ].join(' && ')
      },
      build_firefox_prod: {
        options: {
          stderr: false
        },
        command: [
          './node_modules/.bin/web-ext build -s=' + path.build + ' -a=' + path.dist_firefox + '  -o=true',
          'mv ' + path.dist_firefox + firefoxWebExtBuildName + '-' + manifestVersion + '.zip ' + path.dist_firefox + '/passbolt-' + pkg.version + '.zip',
          "echo '\nMoved to " + path.dist_firefox + "passbolt-" + pkg.version + ".zip'"
        ].join(' && ')
      },

      /**
       * Chrome
       */
      build_chrome_debug: {
        options: {
          stderr: false
        },
        command: [
          './node_modules/.bin/crx pack ' + path.build + ' -p key.pem -o ' + path.dist_chrome + 'passbolt-' + pkg.version + '-debug.crx',
          'rm -f ' + path.dist_chrome + 'passbolt-latest@passbolt.com.crx',
          'ln -fs passbolt-' + pkg.version + '-debug.crx ' + path.dist_chrome + 'passbolt-latest@passbolt.com.crx'
        ].join(' && ')
      },
      build_chrome_prod: {
        options: {
          stderr: false
        },
        command: [
          'zip -q -1 -r ' + path.dist_chrome + 'passbolt-' + pkg.version + '.zip ' + path.build,
          './node_modules/.bin/crx pack ' + path.build + ' -p key.pem -o ' + path.dist_chrome + 'passbolt-' + pkg.version + '.crx ',
          "echo '\nZip and Crx files generated in " + path.dist_chrome + "'"
        ].join(' && ')
      },
      /**
       * Chrome MV3
       */
      build_chrome_mv3_debug: {
        options: {
          stderr: false
        },
        command: [
          './node_modules/.bin/crx pack ' + path.build + ' -p key.pem -o ' + path.dist_chrome_mv3 + 'passbolt-' + pkg.version + '-debug.crx',
          'rm -f ' + path.dist_chrome_mv3 + 'passbolt-latest@passbolt.com.crx',
          'ln -fs passbolt-' + pkg.version + '-debug.crx ' + path.dist_chrome_mv3 + 'passbolt-latest@passbolt.com.crx'
        ].join(' && ')
      },
      build_chrome_mv3_prod: {
        options: {
          stderr: false
        },
        command: [
          'zip -q -1 -r ' + path.dist_chrome_mv3 + 'passbolt-' + pkg.version + '.zip ' + path.build,
          './node_modules/.bin/crx pack ' + path.build + ' -p key.pem -o ' + path.dist_chrome_mv3 + 'passbolt-' + pkg.version + '.crx ',
          "echo '\nZip and Crx files generated in " + path.dist_chrome_mv3 + "'"
        ].join(' && ')
      }
    },
    /**
     * Watch task run predefined tasks whenever watched file patterns are added, changed or deleted
     * see. https://github.com/gruntjs/grunt-contrib-watch
     */
    watch: {
      background_page: {
        files: [path.src_background_page + '**/*.js', 'node_modules/passbolt-styleguide/src/shared/**/*.js'],
        tasks: ['shell:build_background_page_debug'],
        options: { spawn: false }
      },
      service_worker: {
        files: [`${path.src_background_page}**/*.js`, `${path.src_chrome_mv3}**/*.js`],
        tasks: ['shell:build_service_worker_debug', 'copy:service_worker'],
        options: { spawn: false }
      },
      content_script_app: {
        files: [
          path.src_content_scripts + 'js/app/AccountRecovery.js',
          path.src_content_scripts + 'js/app/App.js',
          path.src_content_scripts + 'js/app/Login.js',
          path.src_content_scripts + 'js/app/Recover.js',
          path.src_content_scripts + 'js/app/Setup.js'
        ],
        tasks: ['shell:build_content_script_app'],
        options: { spawn: false }
      },
      content_script_browser_integration: {
        files: [path.src_content_scripts + 'js/app/BrowserIntegration.js'],
        tasks: ['shell:build_content_script_browser_integration'],
        options: { spawn: false }
      },
      content_script_public_website: {
        files: [path.src_content_scripts + 'js/app/PublicWebsiteSignIn.js'],
        tasks: ['shell:build_content_script_public_website'],
        options: { spawn: false }
      },
      web_accessible_resources: {
        files: [
          path.src_web_accessible_resources + 'js/themes/*.js',
          path.src_web_accessible_resources + '*.html'
        ],
        tasks: ['copy:web_accessible_resources'],
        options: { spawn: false }
      },
      web_accessible_resources_app: {
        files: [
          path.src_web_accessible_resources + 'js/app/AccountRecovery.js',
          path.src_web_accessible_resources + 'js/app/App.js',
          path.src_web_accessible_resources + 'js/app/Download.js',
          path.src_web_accessible_resources + 'js/app/Login.js',
          path.src_web_accessible_resources + 'js/app/QuickAccess.js',
          path.src_web_accessible_resources + 'js/app/Recover.js',
          path.src_web_accessible_resources + 'js/app/Setup.js',
          path.src_web_accessible_resources + 'js/app/Setup.js'
        ],
        tasks: ['shell:build_web_accessible_resources_app'],
        options: { spawn: false }
      },
      web_accessible_resources_browser_integration: {
        files: [
          path.src_web_accessible_resources + 'js/app/InFormCallToAction.js',
          path.src_web_accessible_resources + 'js/app/InFormMenu.js'
        ],
        tasks: ['shell:build_web_accessible_resources_browser_integration'],
        options: { spawn: false }
      },
      manifest_firefox: {
        files: [path.src_firefox + 'manifest.json'],
        tasks: ['copy:manifest_firefox'],
        options: { spawn: false }
      },
      manifest_chrome: {
        files: [path.src_chrome + 'manifest.json'],
        tasks: ['copy:manifest_chrome'],
        options: { spawn: false }
      },
      manifest_chrome_mv3: {
        files: [path.src_chrome_mv3 + 'manifest.json'],
        tasks: ['copy:manifest_chrome_mv3'],
        options: { spawn: false }
      }
    }
  });
};
