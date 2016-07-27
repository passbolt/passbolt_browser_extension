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
					"sed -i -e 's/[\"]debug[\"]:.*$/\"debug\": true/' ./lib/config/config.json",
					'./node_modules/jpm/bin/jpm xpi',
					"mv passbolt@passbolt.com-<%= pkg.version %>.xpi passbolt@passbolt.com-<%= pkg.version %>-debug.xpi",
					"sed -i -e 's/[\"]debug[\"]:.*$/\"debug\": false/' ./lib/config/config.json",
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
					// Icons
					nonull: true,
					cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img/logo',
					src: ['icon-16.png','icon-32.png','icon-64.png','icon-20.png','icon-20_white.png'],
					dest: '<%= config.webroot %>/img/logo',
					expand: true
				},{
					// Images
					nonull: true,
					cwd: '<%= config.modules_path %>/<%= config.styleguide %>/src/img',
					src: ['logo/**','third_party/**','avatar/**','controls/**'],
					dest: '<%= config.webroot %>/img',
					expand: true
				},{
					// Less
					cwd: '<%= config.modules_path %>/<%= config.styleguide %>/build/css',
					src: ['config_debug_ff.min.css', 'external.min.css', 'login.min.css', 'main_ff.min.css','setup_ff.min.css'],
					dest: '<%= config.webroot %>/css',
					expand: true
				}]
			}
		}
	});

	// on watch events configure jshint:all to only run on changed file
	//    grunt.event.on('watch', function(action, filepath) {
	//        grunt.config(['jshint', 'all'], filepath);
	//    });

	// ========================================================================
	// Initialise

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadNpmTasks('grunt-shell');

	grunt.loadNpmTasks('grunt-contrib-copy');

	// ========================================================================
	// Register Tasks

	// Bower deploy
	grunt.registerTask('styleguide-update', ['shell:updatestyleguide','copy:styleguide','shell:jpmxpi']);

	// Build xpi in debug and non-debug version.
	grunt.registerTask('build-xpi', ['shell:jpmxpi']);

	// Build xpi in debug and non-debug version.
	grunt.registerTask('push-xpi', ['shell:xpiinstall']);

	// 'grunt' will check code quality, and if no errors,
	// compile LESS to CSS, and minify and concatonate all JS and CSS
	grunt.registerTask('default', ['shell:jpmxpi']);

};
