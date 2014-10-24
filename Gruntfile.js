/*!
 * AP gh-ages Gruntfile
 * Copyright 2013-2014 Autre planete, SAS.
 */

module.exports = function (grunt) {
  'use strict';
  
  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    copy: {
      jquery: {
        expand: true,
        cwd: 'bower_components/jquery/dist/',
        src: '*.js',
        dest: 'js/'
      },
      html5shiv: { 
        expand: true,
        cwd: 'bower_components/html5shiv/dist',
        src: '*.js',
        dest: 'js/'
      },
      modernizr: {
        expand: true,
        cwd: 'bower_components/modernizr',
        src: 'modernizr.js',
        dest: 'js/'
      },
      svgInjector: {
        expand: true,
        cwd: 'bower_components/svg-injecto',
        src: '*.js',
        dest: 'js/'
      },
      fonts: {
        expand: true,
        cwd: 'src/fonts',
        src: '*',
        dest: 'fonts'
      },
      glyphicons: {
        expand: true,
        cwd: 'bower_components/bootstrap/fonts',
        src: '*',
        dest: 'fonts'
      }
    },
    
    clean: {
      dist: ['css', 'js', '*.html', '!layout.html'],
      dev: ['_dev']
    },
    
    concat: {
      bootstrap: {
        options: {
          stripBanners: false
        },
        src: [
          'bower_components/bootstrap/js/transition.js', 
          'bower_components/bootstrap/js/alert.js',
          'bower_components/bootstrap/js/button.js',
          'bower_components/bootstrap/js/carousel.js',
          'bower_components/bootstrap/js/collapse.js',
          'bower_components/bootstrap/js/dropdown.js',
          'bower_components/bootstrap/js/modal.js',
          'bower_components/bootstrap/js/tooltip.js',
          'bower_components/bootstrap/js/popover.js',
          'bower_components/bootstrap/js/scrollspy.js',
          'bower_components/bootstrap/js/tab.js',
          'bower_components/bootstrap/js/affix.js'
        ],
        dest: 'js/bootstrap.js'
      }
    },
    
    less: {
      dev: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'pages.css.map',
          sourceMapFilename: '_dev/css/pages.css.map'
        },
        files: {
          '_dev/css/pages.css': 'less/pages.less'
        }
      },
      dist: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'pages.css.map',
          sourceMapFilename: '_dev/css/pages.css.map'
        },
        files: {
          'css/pages.css': 'less/pages.less'
        }
      }
    },
    
    handlebarslayouts: {
      options: {
        partials: ['partials/*.hbs', 'partials/*.md', 'layout.html'],
        basePath: '',
        modules: ['helpers/helpers-*.js'],
        context: {"dev": true}
      },
      dev: {
        files: {
          '_dev/index.html': 'index.hbs'
        }
      },
      dist: {
        files: {
          'index.html': 'index.hbs'
        },
        options: {
          context: {"dev": false}
        }
      }
    },
    
    connect: {
      server: {
        options: {
          port: 8000,
          base: 'src/',
          open: true
        }
      }
    },
    
    watch: {
      less: {
        files: 'less/**/*.less',
        tasks: 'less:dev'
      },
      hsb: {
        files: '**/*.hbs',
        tasks: 'handlebarslayouts:dev'
      },
      options: {
        livereload: true
      }
    },
    
  });
  
  // Default task.
  grunt.registerTask('default', ['dist']);
  
  
  // Full distribution task.
  grunt.registerTask('dist', ['clean:dist', 'concat', 'less:dist', 'handlebarslayouts:dist']);


  // Default task.
  grunt.registerTask('serve', ['connect', 'watch']);
  
};