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
					src: ['*.js','!*.min.js','vendor/*.js','!vendor/*.min.js'],
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
					src: ['*.css', '!*.min.css','vendor/*.css','!vendor/*.min.css'],
					dest: 'dist/css',
					ext: '.min.css'
				}]
			}
		},
		
		// js validation
		jshint: {
			all: ['src/js/*.js', '!src/js/*.min.js', '!src/js/firebase.js', '!src/js/idb.js'],
			options: {
				'-W058': true
			}
		},
		
		// image compression
		imagemin: {                          
			dist: {
				options: {
					optimizationLevel: 3
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
					baseDir: "./dist/"
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
				}, {
					expand: true, 
					cwd: 'src/icons/', 
					src: ['**'], 
					dest: 'dist/icons/'
				}, {
					expand: true, 
					cwd: 'src/', 
					src: ['sw.js','manifest.json','icon1.png','icon2.png','icon3.png','icon4.png','icon5.png','icon6.png','icon7.png'], 
					dest: 'dist/'}
				]
			}
		},

		// job to concatenate multiple files
		concat: {		  	
		  	js: {
		  	  	src: ['src/js/firebase.js','src/js/initialiseFirebase.js','src/js/jquery.min.js','src/js/bootstrap.min.js','src/js/material.min.js','src/js/ripples.min.js','src/js/bootstrap-accessibility.min.js','src/js/moment.min.js','src/js/idb.js','src/js/validator.min.js','src/js/sightingIdb.js','src/js/model.js','src/js/controller.js','src/js/viewLatestSightings.js','src/js/viewAddSightings.js','src/js/viewAllSightings.js','src/js/viewLandingPage.js','src/js/viewGeneral.js','src/js/init.js'],
		  	  	dest: 'dist/js/app.js',
		  	  	options: {
		  		  	separator: ';',
		  		  	stripBanners: true
		  		}
		  	},
		  	css: {
		  	  	src: ['src/css/bootstrap.min.css','src/css/bootstrap-material-design.min.css','src/css/ripples.min.css','src/css/bootstrap-accessibility.css','src/css/animate.css','src/css/style.css'],
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
		},
		
		// replace variables between environments
		replace: {
			dist: {
				options: {
					patterns: [
					{
						match: 'srcCacheFiles)',
						replacement: 'distCacheFiles)'
					}],
					usePrefix: false
				},
				files: [
					{expand: true, flatten: true, src: ['src/sw.js'], dest: 'dist/'}
				]
			}
		}
	});	

	// development tasks
	grunt.registerTask('dev', ['browserSync']);
	
	// production tasks
	grunt.registerTask('release', ['jshint','concat','uglify','cssmin','imagemin','processhtml','copy','clean','replace','browserSync']);

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