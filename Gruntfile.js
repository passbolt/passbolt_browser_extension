module.exports = function(grunt) {

    // ========================================================================
    // Configure task options

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            css: [
                'data/css/default/*.css'
            ]
        },
        lesslint: {
            src: ['data/less/default/*.less']
        },
        less: {
            files: {
                expand: true,
                flatten: true,
                cwd: "data/less/",
                src: "default/*.less",
                dest: "data/css/default/",
                ext: ".css"
            }
        },
        cssmin: {
            options: {
                banner: '/**!\n * @name\t\t<%= pkg.name %>\n * @version\t\tv<%= pkg.version %>\n * ' +
                    '@date\t\t<%= grunt.template.today("yyyy-mm-dd") %>\n * @copyright\t<%= pkg.copyright %>\n * @source\t\t<%= pkg.repository %>\n * @license\t\t<%= pkg.license %>\n */\n',
                footer: '/* @license-end */'
            },
            minify: {
                expand: true,
                cwd: 'app/webroot/css/default/',
                src: ['*.css', '!*.min.css'],
                dest: 'app/webroot/css/default/',
                ext: '.min.css'
            }
        },
	    watch: {
		    less: {
			    files: ['Gruntfile.js', 'package.json', 'data/less/default/*.less','data/less/default/**/*.less'],
			    tasks: ['css'],
			    options: {
				    spawn: false
			    }
		    }
	    }
    });

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


    // ========================================================================
    // Register Tasks

    // Run 'grunt test' to view lesslint recommendations
    grunt.registerTask('test', ['lesslint']);

    // Run 'grunt csslint' to check LESS quality, and if no errors then
    // compile LESS into CSS, combine and minify
    grunt.registerTask('csslint', ['lesslint', 'clean:css', 'less', 'cssmin']);

	// Run 'grunt css' to compile LESS into CSS, combine and minify
	grunt.registerTask('css', ['clean:css', 'less', 'cssmin']);

    // 'grunt' will check code quality, and if no errors,
    // compile LESS to CSS, and minify and concatonate all JS and CSS
    grunt.registerTask('default', [ 'clean', 'less', 'cssmin']);

};
