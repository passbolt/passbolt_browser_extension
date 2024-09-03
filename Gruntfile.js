/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         1.0.0
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
    dist_edge: 'dist/edge/',
    dist_safari: 'dist/safari/',
    dist_firefox: 'dist/firefox/',

    src: 'src/all/',
    test: 'test/',
    src_background_page: 'src/all/background_page/',
    src_chrome: 'src/chrome/',
    src_edge: 'src/edge/',
    src_safari: 'src/safari/',
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

  grunt.registerTask('default', ['build']);
  grunt.registerTask('pre-dist', ['shell:mkdir_dist', 'copy:styleguide']);

  grunt.registerTask('bundle', ['externalize-locale-strings', 'copy:web_accessible_resources', 'copy:locales']);
  grunt.registerTask('bundle-mv2', ['bundle', 'copy:background_page']);
  grunt.registerTask('bundle-mv3', ['bundle', 'copy:service_worker']);
  grunt.registerTask('bundle-chrome', ['copy:manifest_chrome', 'bundle-mv3']);
  grunt.registerTask('bundle-edge', ['copy:manifest_edge', 'bundle-mv2']);
  grunt.registerTask('bundle-firefox', ['copy:manifest_firefox', 'bundle-mv2']);
  grunt.registerTask('bundle-safari', ['copy:manifest_safari', 'bundle-mv3']);

  grunt.registerTask('build', ['build-firefox-prod', 'build-chrome-prod', 'build-edge-prod']);

  grunt.registerTask('build-firefox', ['build-firefox-debug', 'build-firefox-prod']);
  grunt.registerTask('build-firefox-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-firefox', 'shell:build_background_page_debug', 'shell:build_content_script_debug', 'shell:build_web_accessible_resources_debug', 'shell:build_firefox_debug']);
  grunt.registerTask('build-firefox-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-firefox', 'shell:build_background_page_prod', 'shell:build_content_script_prod', 'shell:build_web_accessible_resources_prod', 'shell:build_firefox_prod']);

  grunt.registerTask('build-edge', ['build-edge-debug', 'build-edge-prod']);
  grunt.registerTask('build-edge-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-edge', 'shell:build_background_page_debug', 'shell:build_content_script_debug', 'shell:build_web_accessible_resources_debug', 'shell:build_edge_debug']);
  grunt.registerTask('build-edge-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-edge', 'shell:build_background_page_prod', 'shell:build_content_script_prod', 'shell:build_web_accessible_resources_prod', 'shell:build_edge_prod']);

  grunt.registerTask('build-chrome', ['build-chrome-debug', 'build-chrome-prod']);
  grunt.registerTask('build-chrome-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-chrome', 'shell:build_service_worker_debug', 'shell:build_content_script_debug', 'shell:build_web_accessible_resources_debug', 'shell:build_chrome_debug']);
  grunt.registerTask('build-chrome-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-chrome', 'shell:build_service_worker_prod', 'shell:build_content_script_prod', 'shell:build_web_accessible_resources_prod', 'shell:build_chrome_prod']);

  grunt.registerTask('build-safari', ['build-safari-debug', 'build-safari-prod']);
  grunt.registerTask('build-safari-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-safari', 'shell:build_service_worker_debug', 'shell:build_content_script_debug', 'shell:build_web_accessible_resources_debug']);
  grunt.registerTask('build-safari-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-safari', 'shell:build_service_worker_prod', 'shell:build_content_script_prod', 'shell:build_web_accessible_resources_prod']);

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
          { expand: true, cwd: path.src_chrome, src: 'serviceWorker.js', dest: path.build + 'serviceWorker' },
          { expand: true, cwd: `${path.src_chrome}/offscreens`, src: 'fetch.html', dest: `${path.build}/offscreens` }
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
      // switch manifest file depending on the target browser.
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
      manifest_edge: {
        files: [{
          expand: true, cwd: path.src_edge, src: 'manifest.json', dest: path.build
        }]
      },
      manifest_safari: {
        files: [{
          expand: true, cwd: path.src_safari, src: 'manifest.json', dest: path.build
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
          src: ['opensans-bold.woff', 'opensans-regular.woff', 'passbolt.ttf', 'inconsolata-regular.ttf'],
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
       * Creat dist directories.
       */
      mkdir_dist: {
        command: [
          'mkdir -p ' + path.dist_chrome,
          'mkdir -p ' + path.dist_edge,
          'mkdir -p ' + path.dist_firefox,
        ].join(' && ')
      },
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
          'npm run build:service-worker',
        ].join(' && ')
      },
      build_service_worker_debug: {
        command: [
          'npm run dev:build:service-worker',
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
       * Edge
       */
      build_edge_debug: {
        options: {
          stderr: false
        },
        command: [
          './node_modules/.bin/crx pack ' + path.build + ' -p key.pem -o ' + path.dist_edge + 'passbolt-' + pkg.version + '-debug.crx',
          'rm -f ' + path.dist_edge + 'passbolt-latest@passbolt.com.crx',
          'ln -fs passbolt-' + pkg.version + '-debug.crx ' + path.dist_edge + 'passbolt-latest@passbolt.com.crx'
        ].join(' && ')
      },
      build_edge_prod: {
        options: {
          stderr: false
        },
        command: [
          'zip -q -1 -r ' + path.dist_edge + 'passbolt-' + pkg.version + '.zip ' + path.build,
          './node_modules/.bin/crx pack ' + path.build + ' -p key.pem -o ' + path.dist_edge + 'passbolt-' + pkg.version + '.crx ',
          "echo '\nZip and Crx files generated in " + path.dist_edge + "'"
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
    }
  });
};
