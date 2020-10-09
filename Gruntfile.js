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
    build_templates: 'build/all/data/tpl/',
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
    src_ejs: 'src/all/data/ejs/',
    src_templates: 'src/all/data/tpl/',
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
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-passbolt-ejs-compile');

  grunt.registerTask('default', ['bundle']);
  grunt.registerTask('templates', ['ejs_compile', 'browserify:templates']);
  grunt.registerTask('pre-dist', ['copy:vendors', 'copy:styleguide']);

  grunt.registerTask('bundle', ['copy:background_page', 'copy:content_scripts', 'browserify:background_page', 'ejs_compile', 'browserify:templates', 'copy:data']);
  grunt.registerTask('bundle-firefox', ['copy:manifest_firefox', 'bundle', 'browserify:vendors', 'shell:append']);
  grunt.registerTask('bundle-chrome', ['copy:manifest_chrome', 'bundle', 'browserify:vendors']);

  grunt.registerTask('build', ['eslint', 'test', 'build-firefox', 'build-chrome']);

  grunt.registerTask('build-firefox', ['build-firefox-debug', 'build-firefox-prod']);
  grunt.registerTask('build-firefox-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-firefox', 'shell:build_webpack_apps_debug', 'shell:build_firefox_debug']);
  grunt.registerTask('build-firefox-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-firefox', 'clean:debug_data', 'shell:build_webpack_apps_prod', 'shell:build_firefox_prod']);

  grunt.registerTask('build-chrome', ['build-chrome-debug', 'build-chrome-prod']);
  grunt.registerTask('build-chrome-debug', ['clean:build', 'pre-dist', 'copy:config_debug', 'bundle-chrome', 'shell:build_webpack_apps_debug', 'shell:build_chrome_debug']);
  grunt.registerTask('build-chrome-prod', ['clean:build', 'pre-dist', 'copy:config_default', 'bundle-chrome', 'shell:build_webpack_apps_prod', 'clean:debug_data', 'shell:build_chrome_prod']);

  grunt.registerTask('test', ['shell:test']);

  grunt.registerTask('custom-chrome-debug', ['bg-chrome-debug', 'react-chrome-debug']);
  grunt.registerTask('bg-chrome-debug', ['copy:background_page', 'browserify:background_page']);
  grunt.registerTask('react-chrome-debug', ['copy:content_scripts', 'copy:data', 'shell:build_webpack_apps_debug']);

  /**
   * Main grunt tasks configuration
    */
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Eslint.
     */
    eslint: {
      options: {
        maxWarnings: 1,
        configFile: '.eslintrc.json',
        cache: true,
        fix: grunt.option('fix'),
        reportUnusedDisableDirectives: true
      },
      target: [
        'src/all/data/js/app/**/*.js',
      ]
    },

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
      templates: {
        cwd: path.src_templates,
        src: ['*.js'],
        dest: path.build_templates,
        expand: true,
        ext: '.js'
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
      ],
      debug_data: [
        path.build_data + 'js/debug/**'
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
          { expand: true, cwd: path.src + 'data', src: ['**', '!tpl/**', '!ejs/**', '!js/quickaccess/popup/**', '!js/app/**'], dest: path.build + 'data' }
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
          // jquery
          { expand: true, cwd: path.node_modules + 'jquery/dist', src: 'jquery.js', dest: path.src_content_vendors },
          // jssha
          { expand: true, cwd: path.node_modules + 'jssha/src', src: 'sha.js', dest: path.src_content_vendors },
          // xregexp
          { expand: true, cwd: path.node_modules + 'xregexp', src: 'xregexp-all.js', dest: path.src_content_vendors },
          // downloadjs (for download with save as).
          { expand: true, cwd: path.node_modules + 'downloadjs', src: 'download.js', dest: path.src_content_vendors },
          // validator
          { expand: true, cwd: path.node_modules + 'validator', src: 'validator.js', dest: path.src_content_vendors },
          // firefox browser polyfill.
          { expand: true, cwd: path.node_modules + 'webextension-polyfill/dist', src: 'browser-polyfill.js', dest: path.src_content_vendors }

          // TODO PASSBOLT-2219 Fix / Add missing Vendors
          // In src_content_vendors
          // Farbtastic color picker is not available as npm package (too old)
          // ejs too old / was hosted on google code...
          //
          // In src_background_page_vendors
          // validator: modified with non-standard alphaNumericSpecial
          //
          // Not in scope
          // phpjs a custom compilation of standard functions from http://locutus.io

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
          src: ['colorpicker/**', 'dot_black.svg', 'dot_red.svg', 'infinite-bar.gif', 'loading_dark.svg', 'loading_light.svg'],
          dest: path.build_data + 'img/controls',
          expand: true
        }, {
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/fa/fas',
          src: ['chevron-right.svg', 'check.svg'],
          dest: path.build_data + 'img/fa/fas',
          expand: true
        }, {
          // Icons / logo
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/logo',
          src: ['icon-19.png', 'icon-20_white.png', 'icon-48.png', 'icon-48_white.png', 'logo.png', 'logo@2x.png', 'logo.svg'],
          dest: path.build_data + 'img/logo',
          expand: true
        }, {
          // Branding
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/logo',
          src: ['icon-16.png', 'icon-19.png', 'icon-32.png', 'icon-48.png', 'icon-64.png', 'icon-128.png'],
          dest: path.build + 'icons',
          expand: true
        }, {
          // Third party logos
          nonull: true,
          cwd: path.node_modules + 'passbolt-styleguide/src/img/third_party',
          src: ['ChromeWebStore.png', 'firefox_logo.png', 'gnupg_logo.png', 'gnupg_logo_disabled.png'],
          dest: path.build_data + 'img/third_party',
          expand: true
        }, {
          // CSS files default
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/default',
          src: ['ext_config_debug.min.css', 'ext_external.min.css', 'ext_login.min.css', 'ext_legacy.min.css', 'ext_setup.min.css', 'ext_quickaccess.min.css', 'ext_app.min.css'],
          dest: path.build_data + 'css/themes/default',
          expand: true
        }, {
          // CSS files midgar
          cwd: path.node_modules + 'passbolt-styleguide/build/css/themes/midgar',
          src: ['ext_legacy.min.css', 'ext_app.min.css'],
          dest: path.build_data + 'css/themes/midgar',
          expand: true
        }, {
          // Fonts
          cwd: path.node_modules + 'passbolt-styleguide/src/fonts',
          src: ['opensans-bold.woff', 'opensans-regular.woff'],
          dest: path.build_data + 'fonts',
          expand: true
        }]
      }
    },

    /**
     * Compile EJS templates into javascript files
     */
    ejs_compile: {
      all: {
        cwd: path.src_ejs,
        src: ['**/*.ejs'],
        dest: path.src_templates,
        expand: true,
        ext: '.js',
        options: {
          delimiter: '?'
        }
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
        command: "./node_modules/.bin/webpack"
      },
      build_webpack_apps_debug: {
        command: "./node_modules/.bin/webpack --env.debug=true"
      },

      /**
       * Unit tests.
       */
      test: {
        stdout: true,
        command: "jest --config .jest.config.json --no-cache ./src/all/ --maxWorkers=4"
      },

      /**
       * Firefox
       */
      append: {
        options: {
          stderr: false
        },
        command: [
          'echo "//result must be structured-clonable data" | tee -a ' + path.build_templates + '*.js',
          'echo "undefined;" | tee -a ' + path.build_templates + '*.js'
        ].join(' &&')
      },
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
      data: {
        files: [path.src + 'data/**/*.*', '!' + path.src + 'data/tpl/**', '!' + path.src + 'data/ejs/**', '!' + path.src + 'js/quickaccess/popup/**'],
        tasks: ['copy:data', 'shell:build_webpack_apps_debug'],
        options: { spawn: false }
      },
      templates: {
        files: [path.src + 'data/ejs/**/*.ejs'],
        tasks: ['ejs_compile', 'browserify:templates'],
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
