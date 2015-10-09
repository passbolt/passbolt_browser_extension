module.exports = function(grunt) {

	// ========================================================================
	// High level variables

	var config = {
		webroot : 'data/',
		styleguide : 'passbolt_styleguide'
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
			'js': [
				'<%= config.webroot %>/js/app/production.js'
			]
		},
		lesslint: {
			src: ['<%= config.webroot %>/less/*.less']
		},
		less: {
			files: {
				expand: true,
				flatten: true,
				cwd: "<%= config.webroot %>/less/",
				src: "*.less",
				dest: "<%= config.webroot %>/css/",
				ext: ".css"
			}
		},
		cssmin: {
			options: {
				banner: '/**!\n'+
				' * @name\t\t<%= pkg.name %>\n'+
				' * @version\t\tv<%= pkg.version %>\n' +
				' * @date\t\t<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				' * @copyright\t<%= pkg.copyright %>\n' +
				' * @source\t\t<%= pkg.repository %>\n'+
				' * @license\t\t<%= pkg.license %>\n */\n',
				footer: '/* @license-end */'
			},
			minify: {
				expand: true,
				cwd: '<%= config.webroot %>/css/',
				src: ['*.css', '!*.min.css'],
				dest: '<%= config.webroot %>/css/',
				ext: '.min.css'
			}
		},
		shell: {
			jsmin: {
				options: {
					stderr: false
				},
				command: '(cd ./app/webroot/js; ./js ./steal/buildjs ./app/passbolt.html)'
			},
			bowerupdate: {
				options: {
					stderr: false
				},
				command: 'bower update'
			},
			jpmxpi: {
				options: {
					stderr: false
				},
				command: 'jpm xpi'
			}
		},
		copy: {
			styleguide : {
				files: [{
					// Icons
					cwd: '<%= bower.directory %>/<%= config.styleguide %>/src/img/logo',
					src: ['icon-16.png','icon-32.png','icon-64.png','icon-20.png','icon-20_white.png'],
					dest: '<%= config.webroot %>/img/logo',
					expand: true
				},{
          // Images
          cwd: '<%= bower.directory %>/<%= config.styleguide %>/src/img',
          src: ['default/**','logo/**','third_party/**','avatar/**','controls/**'],
          dest: '<%= config.webroot %>/img',
          expand: true
        },{
					// Less
					cwd: '<%= bower.directory %>/<%= config.styleguide %>/src/less',
					src: [
						'abstractions/**', 'base/**', 'components/**', 'dialogs/**', 'plugin/**',
						'pages/login.less', 'pages/config_debug_ff.less', 'pages/setup.less', 'pages/external.less', 'pages/settings.less',
						'login.less', 'config.less', 'setup.less', 'setup_ff.less', 'main_ff.less', 'external.less', 'config_debug_ff.less'
					],
					dest: '<%= config.webroot %>/less',
					expand: true
				}]
			}
		},
		watch: {
			less: {
				files: ['Gruntfile.js', 'package.json', '<%= config.webroot %>/less/*.less','<%= config.webroot %>/less/**/*.less'],
				tasks: ['css'],
				options: {
					spawn: false
				}
			}
		}
	});

	// on watch events configure jshint:all to only run on changed file
	//    grunt.event.on('watch', function(action, filepath) {
	//        grunt.config(['jshint', 'all'], filepath);
	//    });

	// ========================================================================
	// Initialise

	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.loadNpmTasks('grunt-lesslint');

	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.loadNpmTasks('grunt-shell');

	grunt.loadNpmTasks('grunt-contrib-copy');

	// ========================================================================
	// Register Tasks

	// Run 'grunt css' to compile LESS into CSS, combine and minify
	grunt.registerTask('css', ['clean:css', 'less', 'cssmin']);

	// Bower deploy
	grunt.registerTask('styleguide-deploy', ['shell:bowerupdate','copy:styleguide','css','shell:jpmxpi']);

	// Run 'grunt production' to prepare the production release
	grunt.registerTask('production', ['css', 'clean:js', 'shell:jsmin']);

	// 'grunt' will check code quality, and if no errors,
	// compile LESS to CSS, and minify and concatonate all JS and CSS
	grunt.registerTask('default', ['css','shell:jpmxpi']);

};
