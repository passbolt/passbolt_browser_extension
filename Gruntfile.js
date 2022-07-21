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
    build_data: 'build/all/data/',
    build_vendors: 'build/all/vendors/',
    build_content_scripts: 'build/all/content_scripts/',
    build_web_accessible_resources: 'build/all/web_accessible_resources/',

    dist_chrome: 'dist/chrome/',
    dist_firefox: 'dist/firefox/',

    src: 'src/all/',
    test: 'test/',
    src_background_page: 'src/all/background_page/',
    src_background_page_vendors: 'src/all/background_page/vendors/',
    src_chrome: 'src/chrome/',
    src_content_vendors: 'src/all/data/vendors/',
    src_firefox: 'src/firefox/',
    src_content_scripts: 'src/all/content_scripts/',
    src_web_accessible_resources: 'src/all/web_accessible_resources/'
  };

  /**
   * Import package.json file content
   */
  var pkg = grunt.file.readJSON('package.json');

  /**
   * Load and enable Tasks
   */
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['bundle']);
  grunt.registerTask('pre-dist', ['copy:vendors', 'copy:styleguide']);

  grunt.registerTask('bundle', ['externalize-locale-strings', 'copy:background_page', 'copy:content_scripts', 'browserify:background_page', 'copy:data', 'copy:locales']);
  grunt.registerTask('bundle-firefox', ['copy:manifest_firefox', 'bundle', 'browserify:vendors']);
  grunt.registerTask('bundle-chrome', ['copy:manifest_chrome', 'bundle', 'browserify:vendors']);

  grunt.registerTask('build', ['shell:eslint', 'shell:test', 'build-firefox', 'build-chrome']);

  grunt.registerTask('build-firefox', ['build-firefox-debug', 'build-firefox-prod']);
  grunt.registerTask('build-firefox-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-firefox', 'shell:build_webpack_apps_debug', 'shell:build_firefox_debug']);
  grunt.registerTask('build-firefox-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-firefox', 'shell:build_webpack_apps_prod', 'shell:build_firefox_prod']);

  grunt.registerTask('build-chrome', ['build-chrome-debug', 'build-chrome-prod']);
  grunt.registerTask('build-chrome-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-chrome', 'shell:build_webpack_apps_debug', 'shell:build_chrome_debug']);
  grunt.registerTask('build-chrome-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-chrome', 'shell:build_webpack_apps_prod', 'shell:build_chrome_prod']);

  grunt.registerTask('custom-chrome-debug', ['bg-chrome-debug', 'react-chrome-debug']);
  grunt.registerTask('bg-chrome-debug', ['copy:background_page', 'browserify:background_page']);
  grunt.registerTask('react-chrome-debug', ['copy:content_scripts', 'copy:data', 'copy:locales', 'shell:build_webpack_apps_debug']);

  grunt.registerTask('externalize-locale-strings', ['shell:externalize']);

  /**
   * Main grunt tasks configuration
    */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Browserify is a tool to package CommonJS Javascript code for use in the browser.
     * We use CommonJS require syntax to manage dependencies in the web extension add-on code
     * See also. src/background_page/vendor/require_polyfill.js
     */
    browserify: {
      vendors: {
        src: [path.src_background_page + 'vendors.js'],
        dest: path.build + 'vendors.min.js'
      },
      background_page: {
        src: [path.src_background_page + 'index.js'],
        dest: path.build + 'index.min.js'
      }
    },

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
      content_scripts: {
        files: [
          { expand: true, cwd: path.src_content_scripts, src: ['**', '!js/app/**'], dest: path.build_content_scripts }
        ]
      },
      background_page: {
        files: [
          { expand: true, cwd: path.src_background_page, src: 'index.html', dest: path.build }
        ]
      },
      data: {
        files: [
          { expand: true, cwd: path.src + 'data', src: ['js/themes/**', '*.html'], dest: path.build_data }
        ]
      },
      locales: {
        files: [
          { expand: true, cwd: path.src + 'locales', src: ['**'], dest: path.build + 'locales' },
          { expand: true, cwd: path.src + '_locales', src: ['**'], dest: path.build + '_locales' }
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
      // copy node_modules where needed in addon or content code vendors folder
      vendors: {
        files: [
          // openpgpjs
          { expand: true, cwd: path.node_modules + 'openpgp/dist', src: ['openpgp.js', 'openpgp.worker.js'], dest: path.build_vendors },
        ]
      },
      // Copy styleguide elements
      styleguide: {
        files: [{
          // Avatar
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/avatar',
          src: ['user.png', 'group_default.png'],
          dest: path.build_data + 'img/avatar',
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
          dest: path.build_data + 'img/controls',
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
          dest: path.build_data + 'img/logo',
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
          dest: path.build + 'icons',
          expand: true
        }, {
          // Illustrations
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/illustrations',
          src: ['passphrase_intro.svg', 'pin_passbolt.gif', 'wave-pin_my_extension.svg', 'email.png'],
          dest: path.build_data + 'img/illustrations',
          expand: true
        }, {
          // Third party logos
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/third_party',
          src: ['ChromeWebStore.png', 'firefox_logo-white.png', 'firefox_logo-black.png', 'gnupg_logo.png', 'gnupg_logo_disabled.png', 'appstore.svg', 'playstore.svg'],
          dest: path.build_data + 'img/third_party',
          expand: true
        }, {
          // CSS files default
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/default',
          src: [
            'ext_external.min.css', 'ext_login.min.css', 'ext_legacy.min.css', 'ext_in_form_cta.min.css',
            'ext_setup.min.css', 'ext_quickaccess.min.css', 'ext_app.min.css', 'ext_authentication.min.css',
            'ext_in_form_menu.min.css'
          ],
          dest: path.build_data + 'css/themes/default',
          expand: true
        }, {
          // CSS files midgar
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/midgar',
          src: [
            'ext_login.min.css', 'ext_in_form_cta.min.css', 'ext_setup.min.css', 'ext_quickaccess.min.css',
            'ext_app.min.css', 'ext_authentication.min.css', 'ext_in_form_menu.min.css'
          ],
          dest: path.build_data + 'css/themes/midgar',
          expand: true
        }, {
          // Fonts
          cwd: path.node_modules + 'passbolt-styleguide/src/fonts',
          src: ['opensans-bold.woff', 'opensans-regular.woff', 'passbolt.ttf'],
          dest: path.build_data + 'fonts',
          expand: true
        }, {
          // Locales
          cwd: path.node_modules + 'passbolt-styleguide/src/locales',
          src: ['**'],
          dest: path.build_data + 'locales',
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
       * Build content code apps.
       */
      build_webpack_apps_prod: {
        command: [
          'webpack --config webpack-content-scripts.config.js',
          'webpack --config webpack-data.config.js',
          'webpack --config webpack-content-scripts.browser-integration.config.js',
          'webpack --config webpack-content-scripts.public-website-sign-in.config.js',
          'webpack --config webpack-data.in-form-call-to-action.config.js',
          'webpack --config webpack-data.in-form-menu.config.js',
          'webpack --config webpack-data.clipboard.config.js',
          'webpack --config webpack-data.download.config.js'
        ].join(' && ')
      },
      build_webpack_apps_debug: {
        command: [
          'webpack --env debug=true --config webpack-content-scripts.config.js',
          'webpack --env debug=true --config webpack-data.config.js',
          'webpack --env debug=true --config webpack-content-scripts.browser-integration.config.js',
          'webpack --env debug=true --config webpack-content-scripts.public-website-sign-in.config.js',
          'webpack --env debug=true --config webpack-data.in-form-call-to-action.config.js',
          'webpack --env debug=true --config webpack-data.in-form-menu.config.js',
          'webpack --env debug=true --config webpack-data.clipboard.config.js',
          'webpack --env debug=true --config webpack-data.download.config.js'
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
          'mv ' + path.dist_firefox + pkg.name + '-' + pkg.version + '.zip ' + path.dist_firefox + 'passbolt-' + pkg.version + '-debug.zip',
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
          'mv ' + path.dist_firefox + pkg.name + '-' + pkg.version + '.zip ' + path.dist_firefox + '/passbolt-' + pkg.version + '.zip',
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
      }
    },
    /**
     * Watch task run predefined tasks whenever watched file patterns are added, changed or deleted
     * see. https://github.com/gruntjs/grunt-contrib-watch
     */
    watch: {
      content_scripts: {
        files: [path.src_content_scripts + '**/*.*'],
        tasks: ['copy:content_scripts'],
        options: { spawn: false }
      },
      background_page: {
        files: [path.src + 'background_page/**/*.js', '!' + path.src + 'background_page/vendors/*.js', '!' + path.src + 'background_page/vendors.js'],
        tasks: ['browserify:background_page'],
        options: { spawn: false }
      },
      config: {
        files: [path.src + 'background_page/config/config.json'],
        tasks: ['browserify:background_page'],
        options: { spawn: false }
      },
      vendors: {
        files: [path.src + 'background_page/vendors.js', path.src + 'background_page/vendors/**/*.js', path.src + 'background_page/sdk/storage.js'],
        tasks: ['browserify:vendors'],
        options: { spawn: false }
      }
    }
  });
};
