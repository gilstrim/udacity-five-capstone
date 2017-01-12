module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
    
		// minifies JS
		uglify: {
			options: {
				mangle: false,
				preserveComments: false
			},
			my_target: {
				files: [{
					expand: true,
					cwd: 'dist/js',
					src: ['*.js','!*.min.js'],
					dest: 'dist/js',
					ext: '.min.js'
				}]
			}
		},
			
		// minifies CSS files
		cssmin: {
			options: {              	
              	rebase: false
          	},          	
			minify: {
				files: [{
					expand: true,
					cwd: 'dist/css',
					src: ['*.css', '!*.min.css'],
					dest: 'dist/css',
					ext: '.min.css'
				}]
			}
		},
		
		// js validation
		jshint: {
			all: ['src/js/*.js', '!src/js/*.min.js']
		},
		
		// image compression
		imagemin: {                          
			dist: {
				options: {
					optimizationLevel: 5
				},
				files: [{
					expand: true,
					cwd: 'src/img',
					src: ['**/*.{png,jpg}'],
					dest: 'dist/img/'
				}]
			}
		},
		
		// watch task
		browserSync: {
			bsFiles: {
				src : ['src/*.html','src/css/*.css','src/js/*.js']
			},
			options: {
				server: {
					baseDir: "./src/"
				},
				ghostMode: 
				{
					clicks: true,
					forms: true,
					scroll: true
				}
			}
		},
		
		// modifies html to use minified js
		processhtml: {		
			dist: {
				options: {
					process: true,
				},
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['*.html'],
					dest: 'dist/'	
				}]
			}
		},
		
		// copy job for fonts
		copy: {
			main: {
				files: [{
					expand: true, 
					cwd: 'src/fonts/', 
					src: ['**'], 
					dest: 'dist/fonts'
				},
				{
					expand: true, 
					cwd: 'src/json/', 
					src: ['**'], 
					dest: 'dist/json/'}
				]
			}
		},

		// job to concatenate multiple files
		concat: {		  	
		  	js: {
		  	  	src: ['src/js/jquery.min.js','src/js/bootstrap.min.js','src/js/bootstrap-accessibility.min.js','src/js/validator.min.js','src/js/config.js','src/js/controller.js','src/js/model.js','src/js/view.js','src/js/init.js'],
		  	  	dest: 'dist/js/app.js',
		  	  	options: {
		  		  	separator: ';',
		  		  	stripBanners: true
		  		}
		  	},
		  	css: {
		  	  	src: ['src/css/bootstrap.css','src/css/bootstrap-accessibility.css','src/css/style.css'],
		  	  	dest: 'dist/css/app.css',
		  	  	options: {
		  		  	separator: ';',
		  		  	stripBanners: true
		  		}
		  	}
		},

		// rids of unnecessary files
		clean: {
  			js: ['dist/js/*.js','!dist/js/*.min.js'],
  			css: ['dist/css/*.css','!dist/css/*.min.css']
		}
	});	

	// development tasks
	grunt.registerTask('dev', ['browserSync']);
	
	// production tasks
	grunt.registerTask('release', ['jshint','concat','uglify','cssmin','imagemin','processhtml','copy','clean','browserSync']);

	// load tasks 
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');	
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-processhtml');		
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-replace');
};