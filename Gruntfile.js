/**
 * Gruntfile
 * Provides tasks and commands to build and distribute the project
 *
 * @param grunt
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
module.exports = function(grunt) {

	/**
	 * Path shortcuts
	 */
	var path = {
		node_modules: 'node_modules/',
		dist: 'dist/all/',
		dist_vendors: 'dist/all/vendors/',
		dist_data: 'dist/all/data/',
    firefox: 'dist/firefox/',
    chrome: 'dist/chrome/',
    src: 'src/all/',
    src_firefox: 'src/firefox/',
    src_chrome: 'src/chrome/',
		src_addon: 'src/all/lib/',
		src_addon_vendors: 'src/all/lib/vendors/',
		src_content_vendors: 'src/all/data/vendors/',
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
  grunt.registerTask('bundle', ['browserify:vendors', 'browserify:app']);
	grunt.registerTask('pre-dist', ['copy:data', 'copy:vendors', 'copy:locale', 'copy:styleguide']);

  grunt.registerTask('build', ['build-firefox', 'build-chrome']);
  grunt.registerTask('build-firefox', ['clean', 'build-firefox-debug', 'build-firefox-prod']);
  grunt.registerTask('build-firefox-debug', ['pre-dist', 'copy:config_debug', 'copy:manifest_firefox','bundle', 'shell:build_firefox_debug']);
  grunt.registerTask('build-firefox-prod', ['pre-dist', 'copy:config_default','copy:manifest_firefox', 'bundle', 'shell:build_firefox_prod']);

  grunt.registerTask('build-chrome', ['clean', 'build-chrome-debug', 'build-chrome-prod']);
  grunt.registerTask('build-chrome-debug', ['pre-dist', 'copy:config_debug', 'copy:manifest_chrome', 'bundle', 'shell:build_chrome_debug']);
  grunt.registerTask('build-chrome-prod', ['pre-dist', 'copy:config_default', 'copy:manifest_chrome', 'bundle', 'shell:build_chrome_prod']);

	/**
	 * Main grunt tasks configuration
 	 */
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/**
		 * Browserify is a tool to package CommonJS Javascript code for use in the browser.
		 * We use CommonJS require syntax to manage dependencies in the web extension add-on code
		 * See also. src/lib/vendor/require_polyfill.js
		 */
		browserify: {
			vendors: {
				src: [path.src_addon + 'vendors.js'],
				dest: path.dist + 'vendors.min.js'
			},
			app: {
				src: [path.src_addon + 'index.js'],
				dest: path.dist + 'index.min.js'
			}
		},

		/**
		 * Clean operations
		 */
		clean: {
			data: [path.dist_data],
			vendors: [path.dist_vendors],
			style: [path.dist_data + 'img', path.dist + 'icons', path.dist_data + 'css'],
			others: [path.dist + 'locale', path.dist + 'manifest.json']
		},

		/**
		 * Copy operations
		 */
		copy: {
      // switch config files to debug or production
      config_debug: {
        files: [{
					expand: true, cwd: path.src_addon + 'config', src: 'config.json.debug', dest: path.src_addon + 'config',
					rename: function(dest, src) { return dest + '/config.json'; }
				}]
      },
      config_default: {
        files: [{
					expand: true, cwd: path.src_addon + 'config', src: 'config.json.default', dest: path.src_addon + 'config',
					rename: function(dest, src) {return dest + '/config.json';}
				}]
      },
			// copy data
			data: {
				files: [
					{expand: true, cwd: path.src + 'data', src: '**', dest: path.dist + 'data'}
				]
			},
			// copy locale files to dist
			locale: {
				files: [
					{expand: true, cwd: path.src + 'locale', src: '**', dest: path.dist + 'locale'},
				]
			},
      // switch manifest file to firefox or chrome
      manifest_firefox: {
        files: [{
          expand: true, cwd: path.src_firefox , src: 'manifest.json', dest: path.dist,
        }]
      },
      manifest_chrome: {
        files: [{
          expand: true, cwd: path.src_chrome, src: 'manifest.json', dest: path.dist,
        }]
      },
			// copy node_modules where needed in addon or content code vendors folder
			vendors: {
				files: [
					// openpgpjs
					{expand: true, cwd: path.node_modules + 'openpgp/dist', src: ['openpgp.js','openpgp.worker.js'], dest: path.src_addon_vendors},
					{expand: true, cwd: path.node_modules + 'openpgp/dist', src: ['openpgp.js','openpgp.worker.js'], dest: path.dist_vendors},
					// jquery
					{expand: true, cwd: path.node_modules + 'jquery/dist', src: 'jquery.min.js', dest: path.src_content_vendors},
					// jssha
					{expand: true, cwd: path.node_modules + 'jssha/src', src: 'sha.js', dest: path.src_addon_vendors},
					{expand: true, cwd: path.node_modules + 'jssha/src', src: 'sha.js', dest: path.src_content_vendors},
					// underscore
					{expand: true, cwd: path.node_modules + 'underscore', src: 'underscore-min.js', dest: path.src_addon_vendors},
					// jsonQ
					{expand: true, cwd: path.node_modules + 'jsonq', src: 'jsonQ.js', dest: path.src_addon_vendors},
					// xregexp
					{expand: true, cwd: path.node_modules + 'xregexp', src: 'xregexp-all.js', dest: path.src_addon_vendors},
					{expand: true, cwd: path.node_modules + 'xregexp', src: 'xregexp-all.js', dest: path.src_content_vendors},

				 	// TODO PASSBOLT-2219 Fix / Add missing Vendors
					// In src_content_vendors
					// Farbtastic color picker is not available as npm package (too old)
					// ejs too old / was hosted on google code...
					//
					// In src_addon_vendors
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
					src: ['user.png'],
					dest: path.dist_data + 'img/avatar',
					expand: true
				}, {
					// Controls
					nonull: true,
					cwd: path.node_modules + 'passbolt-styleguide/src/img/controls',
					src: ['colorpicker/**', 'infinite-bar.gif', 'loading.gif'],
					dest: path.dist_data + 'img/controls',
					expand: true
				}, {
					// Icons
					nonull: true,
					cwd: path.node_modules + 'passbolt-styleguide/src/img/logo',
					src: ['icon-19.png', 'icon-20_white.png', 'icon-48.png', 'icon-48_white.png', 'logo.png', 'logo@2x.png'],
					dest: path.dist_data + 'img/logo',
					expand: true
				}, {
					// Branding
					nonull: true,
					cwd: path.node_modules + 'passbolt-styleguide/src/img/logo',
					src: ['icon-16.png', 'icon-19.png', 'icon-32.png', 'icon-48.png', 'icon-64.png', 'icon-128.png'],
					dest: path.dist + 'icons',
					expand: true
				}, {
					// Third party logos
					nonull: true,
					cwd: path.node_modules + 'passbolt-styleguide/src/img/third_party',
					src: ['ChromeWebStore.png', 'firefox_logo.png', 'gnupg_logo.png', 'gnupg_logo_disabled.png'],
					dest: path.dist_data + 'img/third_party',
					expand: true
				}, {
					// CSS files
					cwd: path.node_modules + 'passbolt-styleguide/build/css',
					src: ['config_debug_webext.min.css', 'external.min.css', 'main_webext.min.css', 'setup_webext.min.css'],
					dest: path.dist_data + 'css',
					expand: true
				}]
			}
		},

		/**
		 * Shell commands
		 */
		shell: {
			options: {stderr: false},

      /**
       * Firefox
       */
      build_firefox_debug: {
        options: {
          stderr: false
        },
        command: [
					'./node_modules/.bin/web-ext build -s='+ path.dist + ' -a='+ path.firefox + '  -o=true',
					'mv '+ path.firefox + pkg.name + '-' + pkg.version + '.zip ' + path.firefox + 'passbolt-' + pkg.version + '-debug.zip ',
          'ln -fs ' + 'passbolt-' + pkg.version + '-debug.zip ' + path.firefox + 'passbolt-latest@passbolt.com.zip',
          "echo '\nMoved to " + path.firefox + "passbolt-" + pkg.version + "-debug.zip'"
        ].join('&&')
      },
      build_firefox_prod: {
        options: {
          stderr: false
        },
        command: [
          './node_modules/.bin/web-ext build -s='+ path.dist + ' -a='+ path.firefox + '  -o=true',
          'mv '+ path.firefox + pkg.name + '-' + pkg.version + '.zip ' + path.firefox + '/passbolt-' + pkg.version + '.zip ',
          "echo '\nMoved to " + path.firefox + "passbolt-" + pkg.version + ".zip'"
        ].join('&&')
      },

      /**
       * Chrome
       */
      build_chrome_debug: {
        options: {
          stderr: false
        },
        command: [
          './node_modules/.bin/crx pack ' + path.dist + ' -p key.pem -o ' + path.chrome + '/passbolt-' + pkg.version + '-debug.crx ',
          'rm '+ path.chrome + 'passbolt-latest@passbolt.com.crx',
          'ln -fs passbolt-' + pkg.version + '-debug.crx ' + path.chrome + 'passbolt-latest@passbolt.com.crx'
        ].join('&&')
      },
      build_chrome_prod: {
        options: {
          stderr: false
        },
        command: [
          'zip -q -1 -r ' + path.chrome + 'passbolt-' + pkg.version + '-debug.zip ' + path.dist,
          './node_modules/.bin/crx pack ' + path.dist + ' -p key.pem -o ' + path.chrome + 'passbolt-' + pkg.version + '.crx ',
          "echo '\nZip and Crx files generated in " + path.chrome + "'"
        ].join('&&')
      }
		},

		/**
		 * Watch task run predefined tasks whenever watched file patterns are added, changed or deleted
		 * see. https://github.com/gruntjs/grunt-contrib-watch
		 */
		watch: {
			data: {
				files: [path.src + 'data/**/*.*'],
				tasks: ['copy:data'],
				options: {spawn: false}
			},
			app: {
				files: [path.src + 'lib/**/*.js', '!' + path.src + 'lib/vendors/*.js', '!' + path.src + 'lib/vendors.js'],
				tasks: ['browserify:app'],
				options: {spawn: false}
			},
			vendors: {
				files: [path.src + 'lib/vendors.js', path.src + 'lib/vendors/**/*.js'],
				tasks: ['browserify:vendors'],
				options: {spawn: false}
			},
			others: {
				files: [path.src + 'manifest.json', path.src + 'locale/*'],
				tasks: ['copy:others'],
				options: {spawn: false}
			}
		}
	});
};